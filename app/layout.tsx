import './globals.css';

export const metadata = {
  title: 'Johnny Dash V19',
  description: 'Dashboard financeiro premium com projeção dinâmica'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
