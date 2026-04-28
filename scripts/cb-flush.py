import os
import re

def flush_logs():
    log_path = "memory/logs.md"
    decision_path = "memory/decisions.md"
    
    if not os.path.exists(log_path):
        print("❌ memory/logs.md não encontrado.")
        return

    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Identifica o cabeçalho (até a primeira linha com --- ou as primeiras 7 linhas)
    header_end = 0
    for i, line in enumerate(lines):
        if "---" in line:
            header_end = i + 1
            break
    if header_end == 0: header_end = 7

    header = lines[:header_end]
    content = lines[header_end:]

    # Encontra as tarefas concluídas (padrão **[DATA] SKILL | STATUS**)
    tasks = []
    current_task = []
    
    for line in content:
        if line.strip().startswith("**["):
            if current_task:
                tasks.append(current_task)
            current_task = [line]
        elif current_task:
            current_task.append(line)
    
    if current_task:
        tasks.append(current_task)

    print(f"🔍 Encontradas {len(tasks)} tarefas no log.")

    if len(tasks) >= 3:
        print("🚀 Atingido limite de 3 tarefas. Iniciando Flush...")
        
        # Prepara o conteúdo para o decisions.md
        archive_content = ["\n## 📦 Arquivo de Sessão (Auto-Flush)\n"]
        for task in tasks:
            archive_content.extend(task)
        archive_content.append("\n---\n")

        # Escreve no decisions.md (append)
        with open(decision_path, 'a', encoding='utf-8') as f:
            f.writelines(archive_content)
        
        # Limpa o logs.md (mantém só o cabeçalho)
        with open(log_path, 'w', encoding='utf-8') as f:
            f.writelines(header)
            f.write("\n*Log limpo e arquivado em decisions.md.*\n\n---\n\n*Próxima compressão pendente (Atualmente: 0 tarefas novas).* \n")
        
        print("✅ Logs arquivados e memory/logs.md limpo.")
    else:
        print("ℹ️ Flush ignorado: menos de 3 tarefas acumuladas.")

if __name__ == "__main__":
    flush_logs()
