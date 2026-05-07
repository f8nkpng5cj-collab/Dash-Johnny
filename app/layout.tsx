import './globals.css';

export const metadata = {
  title: 'Johnny Dash V20',
  description: 'Dashboard financeiro premium com mercado online'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
