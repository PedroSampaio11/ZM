import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Caminho para a pasta de memória (Obsidian)
    const memoryPath = path.join(process.cwd(), '..', 'memory');
    
    if (!fs.existsSync(memoryPath)) {
      return NextResponse.json({ error: 'Pasta de memória não encontrada' }, { status: 404 });
    }

    const files = fs.readdirSync(memoryPath);
    const memoryData = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(memoryPath, file), 'utf8');
        return {
          filename: file,
          title: file.replace('.md', ''),
          preview: content.slice(0, 100) + '...'
        };
      });

    return NextResponse.json(memoryData);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao ler memória' }, { status: 500 });
  }
}
