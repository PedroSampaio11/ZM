export default function EstoqueLoading() {
  return (
    <div className="platform-container">
      <section style={{ background: 'var(--mz-snow)', paddingTop: '140px', paddingBottom: '60px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
          <div className="h-4 w-32 rounded-lg bg-mz-ash animate-pulse mb-10" />
          <div className="h-14 w-64 rounded-2xl bg-mz-ash animate-pulse mb-4" />
          <div className="h-5 w-80 rounded-lg bg-mz-ash animate-pulse mb-12" />
          <div className="h-12 w-full rounded-2xl bg-mz-ash animate-pulse mb-6" />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 w-20 rounded-xl bg-mz-ash animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--mz-snow)', padding: '60px 0 100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-border animate-pulse"
                style={{ height: '420px' }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
