import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Contoh: melarang bot mengakses halaman admin
    },
    sitemap: 'https://videohub-taupe.vercel.app/sitemap.xml',
  };
}
