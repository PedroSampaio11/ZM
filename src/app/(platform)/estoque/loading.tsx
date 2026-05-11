function CardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-border overflow-hidden animate-pulse">
      {/* image */}
      <div style={{ aspectRatio: '16/10', background: 'var(--mz-ash)' }} />
      <div style={{ padding: '24px' }}>
        {/* brand */}
        <div style={{ height: '10px', width: '60px', borderRadius: '6px', background: 'var(--mz-ash)', marginBottom: '10px' }} />
        {/* model */}
        <div style={{ height: '22px', width: '140px', borderRadius: '8px', background: 'var(--mz-ash)', marginBottom: '8px' }} />
        {/* version */}
        <div style={{ height: '13px', width: '100px', borderRadius: '6px', background: 'var(--mz-ash)', marginBottom: '20px' }} />
        {/* pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          {[48, 56, 64].map(w => (
            <div key={w} style={{ height: '26px', width: `${w}px`, borderRadius: '8px', background: 'var(--mz-ash)' }} />
          ))}
        </div>
        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div style={{ height: '28px', width: '100px', borderRadius: '8px', background: 'var(--mz-ash)' }} />
          <div style={{ height: '38px', width: '90px', borderRadius: '12px', background: 'var(--mz-ash)' }} />
        </div>
      </div>
    </div>
  );
}

export default function EstoqueLoading() {
  return (
    <div className="platform-container">
      <section style={{ background: 'var(--mz-snow)', paddingTop: '140px', paddingBottom: '60px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          <div className="h-3 w-28 rounded-md bg-mz-ash animate-pulse mb-8" />
          <div className="h-12 w-56 rounded-2xl bg-mz-ash animate-pulse mb-4" />
          <div className="h-4 w-72 rounded-lg bg-mz-ash animate-pulse mb-10" />
          <div className="h-12 w-full rounded-2xl bg-mz-ash animate-pulse mb-5" />
          <div style={{ display: 'flex', gap: '8px' }}>
            {[80, 72, 96, 64, 80].map((w, i) => (
              <div key={i} className="h-9 rounded-xl bg-mz-ash animate-pulse" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--mz-snow)', padding: '60px 0 100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
