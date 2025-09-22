import React from 'react';

const ClientWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>

const MainPageLayout = () => (
  <main className='p-6'>
    <h1 className='text-2xl font-semibold'>What To Eat Next</h1>
    <p className='mt-2 text-gray-600'>Welcome to the Alchemical Culinary Intelligence System</p>
  </main>
);

export default function Home() {
  return (
    <ClientWrapper>
      <MainPageLayout />
    </ClientWrapper>
  );
}