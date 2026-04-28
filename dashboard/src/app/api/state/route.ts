import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const statePath = path.join(process.cwd(), '..', 'memory', 'state.json');
    
    if (!fs.existsSync(statePath)) {
      return NextResponse.json({ error: 'Arquivo state.json não encontrado' }, { status: 404 });
    }

    const stateContent = fs.readFileSync(statePath, 'utf8');
    const stateData = JSON.parse(stateContent);

    return NextResponse.json(stateData);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao ler estado do sistema' }, { status: 500 });
  }
}
