import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default:  'StadiumOps AI — APL Grand Final Operations',
    template: '%s | StadiumOps AI',
  },
  description:
    'Enterprise-grade real-time stadium operations and crowd management platform. Powered by Google AI and Firebase.',
  keywords: ['stadium operations', 'crowd management', 'AI', 'real-time', 'APL Grand Final'],
  robots: 'noindex, nofollow', // Internal ops tool — do not index
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f1117" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#0f1117] text-slate-200 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
