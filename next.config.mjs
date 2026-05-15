/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
    remotePatterns: [
      // Supabase Storage (uploads manuais)
      { protocol: 'https', hostname: '*.supabase.co' },
      // Integrações DMS — autocerto, cockpit, revenda mais, motor21
      { protocol: 'https', hostname: 'autocerto.com' },
      { protocol: 'https', hostname: '*.autocerto.com' },
      { protocol: 'https', hostname: '*.autocerto.com.br' },
      { protocol: 'https', hostname: '*.cockpit.com.br' },
      { protocol: 'https', hostname: '*.revendamais.com.br' },
      { protocol: 'https', hostname: '*.motor21.com.br' },
      // Catch-all: qualquer CDN externo HTTPS (marketplace multi-integração)
      // Novo DMS integrado? Funciona automaticamente, sem alterar este arquivo.
      { protocol: 'https', hostname: '**' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/assets/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
