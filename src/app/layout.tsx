// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'What to Eat Next',
  description: 'Personalized food recommendations based on your chakra energies'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <header className='bg-gray-50 py-6'>
          <div className='mx-auto max-w-7xl px-4'>
            <div className='flex flex-row items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Alchm Kitchen</h1>
                <p className='mt-2 text-gray-600'>
                  The Menu of the Moment in the Stars and Elements
                </p>
              </div>

              {/* PayPal Button */}
              <div>
                <form
                  action='https://www.paypal.com/ncp/payment/SVN6Q368TKKLS'
                  method='post'
                  target='_blank'
                >
                  <input
                    type='submit'
                    value='HELP'
                    style={{
                      textAlign: 'center',
                      border: 'none',
                      borderRadius: '0.25rem',
                      minWidth: '11.625rem',
                      padding: '0 2rem',
                      height: '2.625rem',
                      fontWeight: 'bold',
                      backgroundColor: '#FFD140',
                      color: '#000000',
                      fontFamily: ''Helvetica Neue', Arial, sans-serif',
                      fontSize: '1rem',
                      lineHeight: '1.25rem',
                      cursor: 'pointer'
                    }}
                  />
                </form>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}