import os
import json
import re
import datetime
from pathlib import Path

def analyze_health(root_dir, graph):
    health = {
        "score": 100,
        "issues": [],
        "metrics": {
            "total_files": len(graph["files"]),
            "large_files": 0,
            "missing_types": 0,
            "todo_count": 0
        }
    }
    
    for path, info in graph["files"].items():
        # 1. Size Check (>10KB is yellow, >20KB is red for a 'clean' project)
        if info["size"] > 20480:
            health["score"] -= 5
            health["issues"].append(f"🔴 Arquivo muito grande: {path} ({info['size']//1024}KB)")
            health["metrics"]["large_files"] += 1
        elif info["size"] > 10240:
            health["score"] -= 2
            health["issues"].append(f"🟡 Arquivo crescendo: {path}")
            
        # 2. Typing Check (Simplified)
        if path.endswith(('.ts', '.tsx')):
            full_path = os.path.join(root_dir, path)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'any' in content and 'eslint-disable' not in content:
                        health["score"] -= 1
                        health["metrics"]["missing_types"] += 1
                    if 'TODO' in content or 'FIXME' in content:
                        health["metrics"]["todo_count"] += content.count('TODO') + content.count('FIXME')
            except:
                pass
                
    health["score"] = max(0, health["score"])
    return health

def generate_graph(root_dir):
    graph = {
        "files": {},
        "folders": [],
        "dependencies": [],
        "generated_at": datetime.datetime.now().isoformat()
    }
    
    exclude = {'.git', 'node_modules', '.claude', 'dist', '.next', '.gemini', 'memory'}
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude]
        
        rel_root = os.path.relpath(root, root_dir)
        if rel_root == ".": rel_root = ""
            
        if rel_root: graph["folders"].append(rel_root)
            
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.md', '.py', '.ps1')):
                file_path = os.path.join(rel_root, file).replace('\\', '/')
                full_path = os.path.join(root, file)
                
                graph["files"][file_path] = {
                    "size": os.path.getsize(full_path),
                    "type": file.split('.')[-1]
                }
                
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    try:
                        with open(full_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            imports = re.findall(r'from\s+[\'"](.+?)[\'"]', content)
                            for imp in imports:
                                graph["dependencies"].append({"from": file_path, "to": imp})
                    except: pass
                        
    graph["health"] = analyze_health(root_dir, graph)
    return graph

if __name__ == "__main__":
    graph_data = generate_graph(".")
    os.makedirs("memory", exist_ok=True)
    with open("memory/graph.json", 'w', encoding='utf-8') as f:
        json.dump(graph_data, f, indent=2)
    print(f"✅ Graph & Health Report generated at memory/graph.json")
