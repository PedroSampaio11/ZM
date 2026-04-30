import os
import json

def index_skills():
    print("🧠 CoreBrain: Indexando Skills...")
    skills_dir = ".claude/commands"
    indexed_data = []

    if not os.path.exists(skills_dir):
        print(f"❌ Erro: Pasta {skills_dir} não encontrada. Execute na raiz do projeto.")
        return

    for file in os.listdir(skills_dir):
        if file.endswith(".md"):
            try:
                with open(os.path.join(skills_dir, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    indexed_data.append({
                        "id": file.replace(".md", ""),
                        "content": content,
                        "metadata": {"type": "skill"}
                    })
            except Exception as e:
                print(f"⚠️ Erro ao ler {file}: {e}")

    if not os.path.exists("memory"):
        os.makedirs("memory")

    # Tenta usar ChromaDB; cai para JSON se não estiver instalado
    try:
        import chromadb
        client = chromadb.Client()
        collection = client.get_or_create_collection("corebrain_skills")
        collection.upsert(
            ids=[d["id"] for d in indexed_data],
            documents=[d["content"] for d in indexed_data],
            metadatas=[d["metadata"] for d in indexed_data],
        )
        print(f"✅ {len(indexed_data)} Skills indexadas no ChromaDB.")
    except ImportError:
        with open("memory/vector_cache.json", "w", encoding='utf-8') as f:
            json.dump(indexed_data, f, indent=4, ensure_ascii=False)
        print(f"✅ {len(indexed_data)} Skills salvas em memory/vector_cache.json.")
        print("   Para usar ChromaDB: pip install chromadb e rode novamente.")

if __name__ == "__main__":
    index_skills()
