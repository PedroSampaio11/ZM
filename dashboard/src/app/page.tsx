'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Brain, Zap, Database, FileText, Activity, RefreshCw,
  Shield, Code2, Palette, TrendingUp, Cpu, ArrowUpRight,
  MessageSquare, Settings, Circle, Clock, AlertCircle,
  BookOpen, Terminal, Lightbulb, Layers, GitBranch, Copy, Check
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Skill    { id: string; name: string; file: string; category: string }
interface MemFile  { filename: string; title: string; preview: string }
interface Agent    { id: string; name: string; description: string; color: string; tools: string[] }

// ── Category config ───────────────────────────────────────────────────────────

const CAT: Record<string, { badge: string; icon: React.ReactNode }> = {
  'Estratégia': { badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', icon: <Brain size={10} /> },
  'Engenharia': { badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',       icon: <Code2 size={10} /> },
  'Design/UI':  { badge: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',       icon: <Palette size={10} /> },
  'Growth':     { badge: 'bg-green-500/20 text-green-300 border border-green-500/30',     icon: <TrendingUp size={10} /> },
  'QA/Infra':   { badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', icon: <Shield size={10} /> },
  'Core':       { badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',       icon: <Cpu size={10} /> },
  'Outros':     { badge: 'bg-zinc-500/20 text-zinc-400 border border-zinc-600/30',       icon: <Zap size={10} /> },
}

const CAT_ORDER = ['Todos', 'Estratégia', 'Engenharia', 'Design/UI', 'Growth', 'QA/Infra', 'Core', 'Outros']

// ── Sub-components ────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: Skill }) {
  const cat = CAT[skill.category] ?? CAT['Outros']
  return (
    <div className="glass glass-hover rounded-2xl p-5 group cursor-default hover:scale-[1.01] transition-all duration-200">
      <h3 className="text-sm font-bold text-white mb-2 truncate">{skill.name}</h3>
      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cat.badge}`}>
        {cat.icon} {skill.category}
      </span>
      <div className="mt-3 flex justify-end">
        <ArrowUpRight size={13} className="text-zinc-700 group-hover:text-purple-400 transition-colors" />
      </div>
    </div>
  )
}

function MemCard({ file }: { file: MemFile }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-green-400 shrink-0" />
        <span className="text-sm font-semibold text-zinc-200 truncate">{file.title}</span>
      </div>
      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">{file.preview}</p>
    </div>
  )
}

// ── Guia Tab ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1.5 glass rounded-lg hover:bg-white/10 transition-all" title="Copiar">
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-zinc-500" />}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="glass rounded-xl p-4 flex items-start justify-between gap-3 mt-2">
      <code className="text-purple-300 text-xs font-mono leading-relaxed whitespace-pre-wrap flex-1">{code}</code>
      <CopyButton text={code} />
    </div>
  )
}

function GuiaTab() {
  const examples = [
    { label: 'Começar um projeto',       text: 'Brain, leia memory/context.md e monta o plano do projeto' },
    { label: 'Criar uma tela',           text: 'Brain, cria a tela de login com Google' },
    { label: 'Revisar antes do deploy',  text: 'Brain, revisa o código e aponta o que pode quebrar em prod' },
    { label: 'Criar conteúdo',           text: 'Brain, cria um post de LinkedIn sobre o lançamento' },
    { label: 'Modelar banco de dados',   text: 'Brain, modela o banco de dados do projeto' },
    { label: 'Organizar ideias',         text: 'Brain, tenho várias ideias, me ajuda a transformar em tarefas' },
  ]

  const steps = [
    { n: '1', title: 'Inicializa o projeto',    cmd: '.\\CoreBrain\\scripts\\cb-init.ps1 "C:\\MeuProjeto"', desc: 'Copia skills, Brain e cria os arquivos de memória prontos.' },
    { n: '2', title: 'Abre no Claude Code',      cmd: null, desc: 'Abra a pasta do projeto (não a do CoreBrain) no Claude Code.' },
    { n: '3', title: 'Descreve seu projeto',     cmd: null, desc: 'Edite memory/context.md: escreva o nome, objetivo e stack.' },
    { n: '4', title: 'Fala com o Brain',         cmd: 'Brain, leia memory/context.md e vamos começar', desc: 'Pronto. O Brain lê o contexto e orquestra o que for necessário.' },
  ]

  const tokenTips = [
    { icon: <FileText size={16} />, color: 'text-yellow-400', title: 'context.md curto', desc: 'O Brain lê context.md antes de agir. Mantenha em no máximo 1 página: objetivo, stack e escopo atual. Sem histórico.' },
    { icon: <Activity size={16} />, color: 'text-purple-400', title: 'Brain comprime o log', desc: 'A cada 3 tarefas concluídas, o Brain arquiva logs.md em decisions.md e limpa o arquivo. Você não paga duas vezes pelo mesmo contexto.' },
    { icon: <Zap size={16} />,      color: 'text-cyan-400',   title: 'Chame direto pra tarefas simples', desc: 'Sem precisar do Brain: "/senior-backend" abre só aquele especialista. Economiza a etapa de roteamento.' },
    { icon: <Cpu size={16} />,      color: 'text-green-400',  title: 'CLAUDE.md automático', desc: 'O arquivo CLAUDE.md é lido pelo Claude Code em toda sessão. Ele já está configurado para ser mínimo — só o essencial.' },
  ]

  const tools = [
    { name: 'Claude Code', tag: '✅ Nativo',     tagColor: 'text-green-400',  desc: 'Brain + Skills + memória com roteamento automático. Zero configuração extra.' },
    { name: 'Antigravity', tag: '⚡ Com export', tagColor: 'text-purple-400', desc: 'Gere o .antigravityrules com o script e eu passarei a seguir as regras do Brain.' },
    { name: 'Cursor',      tag: '⚡ Com export', tagColor: 'text-yellow-400', desc: 'Gere o .cursorrules com o script e o Brain passa a rodar nas regras do projeto.' },
    { name: 'Windsurf',    tag: '⚡ Com export', tagColor: 'text-yellow-400', desc: 'Gere o .windsurfrules com o script. Mesma lógica do Cursor.' },
    { name: 'Qualquer outro', tag: '📋 Manual',  tagColor: 'text-zinc-400',   desc: 'Copie SYSTEM_PROMPT.md (gerado pelo export) como system prompt da ferramenta.' },
  ]

  return (
    <section className="max-w-3xl mx-auto space-y-10">

      {/* A fórmula */}
      <div className="glass rounded-[32px] p-10 relative overflow-hidden text-center">
        <span className="text-xs text-purple-400 uppercase tracking-widest font-bold">A fórmula</span>
        <h2 className="text-4xl font-black mt-3 mb-2">
          Brain, <span className="gradient-text">[o que você quer]</span>
        </h2>
        <p className="text-zinc-500 text-sm">É só isso. O Brain lê o contexto e decide quem faz o quê.</p>
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-purple-600/15 blur-[80px] rounded-full pointer-events-none" />
      </div>

      {/* Exemplos copiáveis */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={15} className="text-purple-400" />
          <h3 className="font-bold">Exemplos prontos para copiar</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {examples.map((ex, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide font-bold mb-1">{ex.label}</p>
                <p className="text-sm text-zinc-300 italic">"{ex.text}"</p>
              </div>
              <CopyButton text={ex.text} />
            </div>
          ))}
        </div>
      </div>

      {/* Setup em 4 passos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={15} className="text-green-400" />
          <h3 className="font-bold">Começar um projeto novo — 4 passos</h3>
        </div>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 flex gap-5 items-start">
              <span className="text-3xl font-black text-zinc-800 shrink-0 leading-none">{s.n}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white mb-1">{s.title}</h4>
                <p className="text-zinc-500 text-sm mb-2">{s.desc}</p>
                {s.cmd && <CodeBlock code={s.cmd} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gastar menos tokens */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={15} className="text-yellow-400" />
          <h3 className="font-bold">Como gastar menos tokens</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tokenTips.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className={`${t.color} mb-3`}>{t.icon}</div>
              <h4 className="font-semibold text-white text-sm mb-1">{t.title}</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-ferramenta */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={15} className="text-cyan-400" />
          <h3 className="font-bold">Funciona em outros apps?</h3>
        </div>
        <div className="space-y-2 mb-4">
          {tools.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-start gap-4">
              <div className="min-w-[100px]">
                <p className="font-bold text-white text-sm">{t.name}</p>
                <p className={`text-xs font-semibold ${t.tagColor}`}>{t.tag}</p>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mb-1">Para gerar os arquivos de outros apps, rode na pasta do projeto:</p>
        <CodeBlock code={'.\\scripts\\cb-export.ps1'} />
        <p className="text-xs text-zinc-700 mt-2">Gera <code className="text-purple-400">.antigravityrules</code>, <code className="text-purple-400">.cursorrules</code> e <code className="text-purple-400">SYSTEM_PROMPT.md</code> automaticamente.</p>
      </div>

    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'skills' | 'memory' | 'agents' | 'guia'

export default function Home() {
  const [tab, setTab]           = useState<Tab>('overview')
  const [skills, setSkills]     = useState<Skill[]>([])
  const [memory, setMemory]     = useState<MemFile[]>([])
  const [agents, setAgents]     = useState<Agent[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [catFilter, setCat]     = useState('Todos')
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [sr, mr, ar] = await Promise.all([
        fetch('/api/skills'), fetch('/api/memory'), fetch('/api/agents')
      ])
      const [sd, md, ad] = await Promise.all([sr.json(), mr.json(), ar.json()])
      setSkills(Array.isArray(sd) ? sd : [])
      setMemory(Array.isArray(md) ? md : [])
      setAgents(Array.isArray(ad) ? ad : [])
      setLastSync(new Date())
    } catch {
      setError('Não foi possível carregar os dados. Verifique se o servidor Next.js está rodando.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filteredSkills = catFilter === 'Todos' ? skills : skills.filter(s => s.category === catFilter)
  const presentCats    = CAT_ORDER.filter(c => c === 'Todos' || skills.some(s => s.category === c))

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'skills',   label: 'Skills'   },
    { key: 'memory',   label: 'Memória'  },
    { key: 'agents',   label: 'Agentes'  },
    { key: 'guia',     label: '📖 Guia'  },
  ]

  return (
    <main className="max-w-[1600px] mx-auto p-6 md:p-10">

      {/* ── Nav ── */}
      <nav className="flex flex-wrap justify-between items-center gap-4 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center glow-purple">
            <Brain className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">
              CORE<span className="gradient-text">BRAIN</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">PedroSampaio Ecosystem</p>
          </div>
        </div>

        {/* Desktop pill nav */}
        <div className="hidden md:flex glass px-2 py-1.5 rounded-xl">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Mobile tab selector */}
        <div className="flex md:hidden w-full order-last">
          <div className="glass rounded-xl p-1 flex w-full gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  tab === t.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastSync && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-600">
              <Clock size={11} /> {lastSync.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <div className="flex flex-col items-end mr-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Sistema</span>
            <span className="text-xs text-green-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Operacional
            </span>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="w-9 h-9 glass glass-hover rounded-lg flex items-center justify-center transition-all"
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={`text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </nav>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 mb-8 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {tab === 'overview' && (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Hero */}
            <div className="lg:col-span-2 glass p-10 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                  Bem-vindo ao seu <br />
                  <span className="gradient-text">Segundo Cérebro.</span>
                </h2>
                <p className="text-gray-400 max-w-md leading-relaxed">
                  O CoreBrain está pronto para orquestrar seus projetos, gerenciar sua memória no Obsidian e escalar sua produtividade.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-8 relative z-10">
                <button
                  onClick={() => setTab('skills')}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Ver Skills
                </button>
                <button
                  onClick={() => setTab('memory')}
                  className="px-8 py-3 glass font-bold rounded-xl hover:bg-white/5 transition-colors border-white/10 flex items-center gap-2"
                >
                  <Database className="w-4 h-4" /> Ver Memória
                </button>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* Metrics */}
            <div className="glass p-8 rounded-[32px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-lg">Métricas do Sistema</h3>
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Skills Ativas', value: loading ? '—' : skills.length, bar: skills.length / 30, color: 'bg-purple-500' },
                    { label: 'Arquivos de Memória', value: loading ? '—' : memory.length, bar: Math.min(memory.length / 10, 1), color: 'bg-cyan-500' },
                    { label: 'Agentes', value: loading ? '—' : agents.length, bar: agents.length / 5, color: 'bg-green-500' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-gray-500 text-sm">{m.label}</span>
                        <span className="text-2xl font-black">{m.value}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className={`${m.color} h-full rounded-full transition-all duration-700`} style={{ width: `${(m.bar || 0) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                <p className="text-xs text-purple-300 font-medium leading-relaxed">
                  "A inteligência é a habilidade de se adaptar à mudança."
                </p>
              </div>
            </div>
          </section>

          {/* Recent skills preview */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-black">Córtex de Habilidades</h2>
                <p className="text-gray-500 text-sm">{loading ? '...' : `${skills.length} agentes especializados prontos.`}</p>
              </div>
              <button
                onClick={() => setTab('skills')}
                className="text-purple-400 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Ver todas <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 glass rounded-2xl animate-pulse" />)
                : skills.slice(0, 6).map(s => <SkillCard key={s.id} skill={s} />)
              }
            </div>
          </section>
        </>
      )}

      {/* ══════════════ SKILLS TAB ══════════════ */}
      {tab === 'skills' && (
        <section>
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black">Skills Especializadas</h2>
              <p className="text-gray-500 text-sm">{filteredSkills.length} de {skills.length} skills</p>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {presentCats.map(cat => (
              <button
                key={cat}
                onClick={() => setCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  catFilter === cat
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                    : 'glass text-zinc-500 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {cat !== 'Todos' && <span className="mr-1 opacity-60">{CAT[cat]?.icon}</span>}
                {cat}
                {cat !== 'Todos' && (
                  <span className="ml-1.5 opacity-40">({skills.filter(s => s.category === cat).length})</span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-28 glass rounded-2xl animate-pulse" />)
              : filteredSkills.map(s => <SkillCard key={s.id} skill={s} />)
            }
          </div>
        </section>
      )}

      {/* ══════════════ MEMORY TAB ══════════════ */}
      {tab === 'memory' && (
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black">Base de Memória</h2>
              <p className="text-gray-500 text-sm">{memory.length} arquivo{memory.length !== 1 ? 's' : ''} indexados</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 glass rounded-2xl animate-pulse" />)}
            </div>
          ) : memory.length === 0 ? (
            <div className="glass rounded-[32px] p-16 text-center">
              <Database size={40} className="text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">Memória Vazia</h3>
              <p className="text-zinc-600 text-sm mb-6">Nenhum arquivo de memória foi indexado ainda.</p>
              <div className="glass rounded-2xl p-4 inline-block text-left">
                <p className="text-xs text-zinc-500 mb-2">Para indexar, execute na raiz do projeto:</p>
                <code className="text-purple-400 text-sm font-mono">python scripts/cb-sync.py</code>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memory.map(f => <MemCard key={f.filename} file={f} />)}
            </div>
          )}
        </section>
      )}

      {/* ══════════════ AGENTS TAB ══════════════ */}
      {tab === 'agents' && (
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black">Agentes Ativos</h2>
            <p className="text-gray-500 text-sm">{agents.length} agente{agents.length !== 1 ? 's' : ''} configurado{agents.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div className="h-48 glass rounded-[32px] animate-pulse" />
          ) : agents.length === 0 ? (
            <div className="glass rounded-[32px] p-16 text-center">
              <Brain size={40} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-600 text-sm">Nenhum agente em <code className="text-purple-400">.claude/agents/</code></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agents.map(a => (
                <div key={a.id} className="glass rounded-[32px] p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${a.color}20` }}>
                      <Brain size={20} style={{ color: a.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{a.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <Circle size={7} className="fill-green-400 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-6">{a.description}</p>
                  {a.tools.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold mb-2">Tools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {a.tools.map(t => (
                          <span key={t} className="text-xs px-2.5 py-1 glass rounded-lg text-zinc-400 font-mono">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════ GUIA TAB ══════════════ */}
      {tab === 'guia' && <GuiaTab />}

      {/* ── Footer ── */}
      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-600 text-xs font-medium">© 2026 CoreBrain by PedroSampaio. Todos os direitos reservados.</p>
        <div className="flex items-center gap-1.5 text-xs text-zinc-700">
          <Activity size={11} className="text-green-500" />
          {lastSync ? `Última sync: ${lastSync.toLocaleTimeString('pt-BR')}` : 'Aguardando dados...'}
        </div>
      </footer>
    </main>
  )
}
