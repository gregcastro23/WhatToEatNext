// Next.js 15 App Router layout component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>;
      
      <body>
        <nav>Navigation</nav>
        {children}
      </body>
    </html>
  );
}