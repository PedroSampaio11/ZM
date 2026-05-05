'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { syncPartnerNow } from '@/lib/partner-actions'
import { cn } from '@/lib/utils'

export function SyncLojaButton({ integrationId }: { integrationId: string }) {
  const [result, setResult]         = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSync() {
    setResult(null)
    startTransition(async () => {
      const res = await syncPartnerNow(integrationId)
      if (res?.error) {
        setResult(`error:${res.error}`)
      } else if (res?.result) {
        const r = res.result
        setResult(`ok:${r.upserted} importados · ${r.archived} arquivados`)
      }
    })
  }

  const isError = result?.startsWith('error:')
  const msg     = result?.replace(/^(ok|error):/, '')

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all w-full"
      >
        <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
        {isPending ? 'Sincronizando...' : 'Sincronizar agora'}
      </button>
      {msg && (
        <div className={cn('flex items-center gap-1.5 text-[10px] font-medium', isError ? 'text-red-400' : 'text-green-400')}>
          {isError ? <AlertCircle size={11} /> : <CheckCircle2 size={11} />}
          {msg}
        </div>
      )}
    </div>
  )
}
