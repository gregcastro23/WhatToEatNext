import { Metadata } from 'next';

const AstrologizeDemo = () => (
  <div className='text-gray-600'>AstrologizeDemo component unavailable.</div>
)

export const _metadata: Metadata = {
  title: 'Astrologize API Demo',
  description: 'Demo page for the Astrologize API integration'
};

export default function AstrologizeDemoPage() {
  return (
    <div className='container mx-auto py-8'>
      <AstrologizeDemo />
    </div>
  )
}