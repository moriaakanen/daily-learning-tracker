import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Memora · Memori & Jurnal',
  description: 'Platform cerdas untuk mencatat hasil belajar harian, kuis active recall otomatis, dan journaling bermakna.',
  icons: {
    icon: './favicon.png',
    shortcut: './favicon.ico',
    apple: './logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="./favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="./logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('gh_theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
