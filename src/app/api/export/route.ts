import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Caminho para a pasta raiz do projeto (onde o .claude e scripts/ estão)
    const rootPath = path.join(process.cwd(), '..');
    
    // Comando para rodar o powershell
    const command = 'powershell.exe -ExecutionPolicy Bypass -File ./scripts/cb-export.ps1';
    
    const { stdout, stderr } = await execAsync(command, { cwd: rootPath });
    
    if (stderr && !stdout) {
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      output: stdout,
      message: 'Regras exportadas com sucesso para .cursorrules, .windsurfrules e .antigravityrules'
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao executar script de exportação' }, { status: 500 });
  }
}
