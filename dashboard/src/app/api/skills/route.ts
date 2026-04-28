import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CATEGORIES: Record<string, string> = {
  'pedro-identity': 'Estratégia', 'ceo-advisor': 'Estratégia',
  'thought-organizer': 'Estratégia', 'handoff-protocol': 'Estratégia',
  'senior-architect': 'Engenharia', 'clean-code': 'Engenharia',
  'database': 'Engenharia', 'eschema': 'Engenharia',
  'api': 'Engenharia', 'typescript-pro': 'Engenharia', 'senior-backend': 'Engenharia',
  'arquiteture': 'Engenharia',
  'ui-ux-pro-max': 'Design/UI', 'ckm-design-system': 'Design/UI',
  'ckm-design': 'Design/UI', 'ckm-ui-styling': 'Design/UI', 'frontend-design': 'Design/UI',
  'content-ads-pro': 'Growth', 'social': 'Growth',
  'product-manager': 'Growth', 'analytics-expert': 'Growth',
  'devops-engineer': 'QA/Infra', 'test-master': 'QA/Infra',
  'security-auditor': 'QA/Infra', 'code-reviewer': 'QA/Infra',
  'task-decomposition': 'QA/Infra', 'guardian': 'QA/Infra',
  'super-power': 'Core', 'agent-development': 'Core',
  'claude-api': 'Core', 'simplify': 'Core',
};

export async function GET() {
  try {
    const skillsPath = path.join(process.cwd(), '..', '.claude', 'commands');

    if (!fs.existsSync(skillsPath)) {
      return NextResponse.json({ error: 'Pasta de skills não encontrada' }, { status: 404 });
    }

    const files = fs.readdirSync(skillsPath);
    const skills = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const id = file.replace('.md', '');
        const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { id, name, file, category: CATEGORIES[id] ?? 'Outros' };
      });

    return NextResponse.json(skills);
  } catch {
    return NextResponse.json({ error: 'Erro ao ler skills' }, { status: 500 });
  }
}
