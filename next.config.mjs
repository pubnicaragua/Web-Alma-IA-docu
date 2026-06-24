/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.google.com https://*.gstatic.com https://images.unsplash.com https://avatar.iran.liara.run;
  font-src 'self' https://fonts.gstatic.com data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' https://www.google.com;
  connect-src 'self' ${isDev ? 'ws://localhost:* http://localhost:*' : ''} https://api-almaia.onrender.com https://api-almaia-prod.onrender.com https://*.supabase.co https://*.google.com;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
