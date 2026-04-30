# Implementation Plan: CoreBrain Enrichment via Reversa

This plan outlines how to integrate key concepts from the [Reversa](https://github.com/sandeco/reversa) framework into CoreBrain to enhance its ability to analyze legacy systems and provide higher traceability.

## 🎯 Objectives
- **Onboarding Power**: Enhance CoreBrain's ability to "digest" existing codebases.
- **Traceability**: Implement a confidence-based marking system for AI-generated knowledge.
- **Visual Architecture**: Automate the generation of C4 diagrams using Mermaid.
- **Operational Contracts**: Transition from simple documentation to executable specifications.

## 🛠️ Proposed Changes

### 1. New "Reverse Engineering" Skills
Add specialized skills to `.claude/commands/` inspired by Reversa's pipeline:
- `scout.md`: Fast reconnaissance of project surface (folders, stack, entry points).
- `archaeologist.md`: Deep logic extraction and module-level flow analysis.
- `detective.md`: Extraction of implicit business rules and retroactive ADRs.
- `writer-sdd.md`: Generation of "Software Design Documents" as operational contracts.

### 2. Confidence & Traceability System
Modify the `handoff-protocol.md` and memory templates to support traceability marks:
- 🟢 **CONFIRMED**: Directly from code (with file/line reference).
- 🟡 **INFERRED**: Deduced from patterns or common practices.
- 🔴 **GAP**: Missing information requiring human validation.

### 3. Visual Architecture (C4 Diagrams)
Enhance `senior-architect.md` or create `architect-c4.md` to automatically generate:
- C4 Context Diagrams (System Level)
- C4 Container Diagrams (Service Level)
- C4 Component Diagrams (Internal Level)
Using Mermaid syntax for easy rendering in Obsidian/GitHub.

### 4. Memory Structure Enrichment
Add a new directory `memory/specifications/` (or `_sdd/`) to store the "Reverse Engineered" state of the project, including:
- `inventory.md`
- `domain-rules.md`
- `confidence-report.md`

### 5. Automation Tools
Create `scripts/cb-reversa.ps1`:
- A wrapper script to trigger the analysis pipeline.
- Orchestrates the `scout` -> `archaeologist` -> `detective` sequence.

## 🚀 Execution Phases

### Phase 1: Foundation (Skills & Traceability)
- Create `scout.md`, `archaeologist.md`, `detective.md`.
- Update `handoff-protocol.md` with confidence levels.

### Phase 2: Visualization (C4 & Mermaid)
- Implement `architect-c4` skill.
- Add Mermaid templates to `.obsidian/templates/`.

### Phase 3: Automation & Structure
- Create `scripts/cb-reversa.ps1`.
- Initialize `memory/specifications/` structure.

---

## ❓ Questions for the USER
1. Would you like the "Reversa" output to be stored inside `/memory` or in a separate root folder like `_reversa/`?
2. Should we prioritize the "Chronicler" (session documentation) or the "Archaeologist" (code logic extraction)?
3. Do you want me to start creating the first "Reverse Engineering" skill (Scout) now?
