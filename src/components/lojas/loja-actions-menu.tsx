'use client'

import { useState, useTransition } from 'react'
import { MoreVertical, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { updateLoja, deleteLoja } from '@/lib/partner-actions'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Integration {
  adapter: string
  credentials?: Record<string, string>
}

interface Loja {
  id:           string
  name:         string
  city:         string
  state:        string
  integrations: Integration[]
}

// ── Config de campos por DMS ─────────────────────────────────────────────────

type CredField = { name: string; label: string; credKey: string; type?: string }

const DMS_LABEL: Record<string, string> = {
  AUTOCERTO:    'AutoCerto',
  COCKPIT:      'Cockpit DMS',
  REVENDA_MAIS: 'Revenda Mais',
  MOTOR21:      'Motor21',
}

const DMS_EDIT_FIELDS: Record<string, CredField[]> = {
  AUTOCERTO: [
    { name: 'dmsUsername', label: 'Usuário / Login',       credKey: 'username' },
    { name: 'dmsPassword', label: 'Nova senha (opcional)', credKey: 'password', type: 'password' },
  ],
  REVENDA_MAIS: [
    { name: 'dmsUsername', label: 'Usuário / Login',       credKey: 'username' },
    { name: 'dmsPassword', label: 'Nova senha (opcional)', credKey: 'password', type: 'password' },
  ],
  COCKPIT: [
    { name: 'dmsApiKey',    label: 'API Key',    credKey: 'apiKey'    },
    { name: 'dmsEmpresaId', label: 'Empresa ID', credKey: 'empresaId' },
  ],
  MOTOR21: [
    { name: 'dmsClientId',     label: 'Client ID',            credKey: 'clientId'     },
    { name: 'dmsClientSecret', label: 'Client Secret (novo)', credKey: 'clientSecret', type: 'password' },
  ],
}

// ── Estilos compartilhados ────────────────────────────────────────────────────

const inputCls = 'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'

// ── Componente principal ──────────────────────────────────────────────────────

export function LojaActionsMenu({ loja }: { loja: Loja }) {
  const [open,        setOpen]        = useState(false)
  const [editOpen,    setEditOpen]    = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [isPending,   startTransition] = useTransition()

  const primaryInteg = loja.integrations.find(i => i.adapter !== 'MANUAL') ?? null
  const editFields   = primaryInteg ? (DMS_EDIT_FIELDS[primaryInteg.adapter] ?? []) : []

  // ── Editar ──────────────────────────────────────────────────────────────────

  function handleEdit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updateLoja(formData)
      if (result?.error) { setError(result.error) }
      else { setEditOpen(false) }
    })
  }

  // ── Deletar ─────────────────────────────────────────────────────────────────

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLoja(loja.id)
      if (result?.error) {
        setError(result.error)
      } else {
        setDeleteOpen(false)
      }
    })
  }

  return (
    <>
      {/* Botão de 3 pontinhos */}
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Ações da loja"
        >
          <MoreVertical size={16} />
        </button>

        {open && (
          <>
            {/* Overlay para fechar o menu */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-9 z-20 bg-zinc-900 border border-white/10 rounded-xl shadow-xl w-40 overflow-hidden py-1">
              <button
                onClick={() => { setOpen(false); setEditOpen(true) }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
              >
                <Pencil size={14} /> Editar
              </button>
              <button
                onClick={() => { setOpen(false); setDeleteOpen(true) }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={14} /> Remover
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Modal de Edição ─────────────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E1E26] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-lg font-black text-white">Editar Loja</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Atualize os dados da loja parceira</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form action={handleEdit} className="p-6 space-y-4">
              <input type="hidden" name="partnerId" value={loja.id} />
              <input type="hidden" name="dms" value={primaryInteg?.adapter ?? 'MANUAL'} />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Loja *</label>
                <input name="name" required defaultValue={loja.name} className={inputCls} placeholder="Ex: Via Brasil Multimarcas" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cidade *</label>
                  <input name="city" required defaultValue={loja.city} className={inputCls} placeholder="Ex: São Paulo" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado *</label>
                  <input name="state" required defaultValue={loja.state} maxLength={2} className={inputCls} placeholder="Ex: SP" />
                </div>
              </div>

              {primaryInteg && editFields.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Credenciais {DMS_LABEL[primaryInteg.adapter] ?? primaryInteg.adapter}
                  </p>
                  {editFields.map(field => (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type ?? 'text'}
                        defaultValue={field.type === 'password' ? '' : (primaryInteg.credentials?.[field.credKey] ?? '')}
                        autoComplete="off"
                        className={inputCls}
                        placeholder={field.type === 'password' ? '••••••••' : ''}
                      />
                      {field.type === 'password' && (
                        <p className="text-[10px] text-zinc-600">Deixe em branco para manter</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {isPending ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal de Confirmação de Delete ──────────────────────────────────── */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E1E26] border border-red-500/20 rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h2 className="text-lg font-black text-white mb-1">Remover {loja.name}?</h2>
              <p className="text-zinc-500 text-sm">
                Todos os veículos desta loja serão removidos do inventário. Esta ação <span className="text-red-400 font-bold">não pode ser desfeita</span>.
              </p>

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setDeleteOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-all">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isPending ? <><Loader2 size={14} className="animate-spin" /> Removendo...</> : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
