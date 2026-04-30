import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const agentsPath = path.join(process.cwd(), '..', '.claude', 'agents');

    if (!fs.existsSync(agentsPath)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));
    const agents = files.map(file => {
      const content = fs.readFileSync(path.join(agentsPath, file), 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let name = file.replace('.md', '');
      let description = 'Agente autônomo do sistema CoreBrain.';
      let color = '#7B61FF';

      if (fmMatch) {
        const fm = fmMatch[1];
        const nameMatch = fm.match(/name:\s*(.+)/);
        const descMatch = fm.match(/description:\s*(.+)/);
        const colorMatch = fm.match(/color:\s*["']?([^"'\n]+)["']?/);
        if (nameMatch) name = nameMatch[1].trim().replace(/^"|"$/g, '');
        if (descMatch) description = descMatch[1].trim().replace(/^"|"$/g, '');
        if (colorMatch) color = colorMatch[1].trim().replace(/^"|"$/g, '');
      }

      const toolsMatch = content.match(/tools:\s*\[([^\]]+)\]/);
      const tools = toolsMatch
        ? toolsMatch[1].split(',').map(t => t.trim().replace(/["']/g, ''))
        : ['read', 'write'];

      return { id: file.replace('.md', ''), name, description, color, tools };
    });

    return NextResponse.json(agents);
  } catch {
    return NextResponse.json({ error: 'Erro ao ler agentes' }, { status: 500 });
  }
}
