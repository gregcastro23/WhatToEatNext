const ClientWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MainPageLayout = () => (
  <main className='p-6'>
    <h1 className='text-2xl font-semibold'>What To Eat Next</h1>
    <p className='text-gray-600 mt-2'>Main layout unavailable. Minimal shell rendered.</p>
  </main>
);

export default function Home() {
  return (
    <ClientWrapper>
      <MainPageLayout />
    </ClientWrapper>
  );
}
