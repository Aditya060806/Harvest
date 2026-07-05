import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://harvest-scan.vercel.app'),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    'harvest-scan', 'security scanner', 'code quality', 'SAST', 'npm audit',
    'SARIF', 'devsecops', 'cli', 'static analysis', 'Aditya Pandey',
  ],
  authors: [{ name: site.author.name, url: site.author.github }],
  creator: site.author.name,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: 'website',
    siteName: site.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  icons: { icon: '/favicon.svg' },
};

const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    var d = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === null) d = true; // default to dark
    document.documentElement.classList.toggle('dark', d);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
