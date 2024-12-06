// app/layout.tsx
import { AlchemicalProvider } from '@/contexts/AlchemicalContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AlchemicalProvider>
          {children}
        </AlchemicalProvider>
      </body>
    </html>
  );
}