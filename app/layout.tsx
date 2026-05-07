import './globals.css';

export const metadata = {
  title: 'Johnny Dash V23',
  description: 'Dashboard financeiro premium com total e projeção por categoria'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
