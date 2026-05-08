import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/gestao/', '/api/', '/gestao'],
      },
    ],
    sitemap: 'https://motorz.com.br/sitemap.xml',
    host: 'https://motorz.com.br',
  };
}
