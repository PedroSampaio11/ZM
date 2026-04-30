import json
import datetime
import sys

def update_state(key, value):
    path = "memory/state.json"
    try:
        with open(path, 'r', encoding='utf-8') as f:
            state = json.load(f)
    except:
        state = {}

    state[key] = value
    state["last_sync"] = datetime.datetime.now().isoformat()

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2)
    
    print(f"✅ State updated: {key}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        update_state(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python scripts/cb-state.py <key> <value>")
