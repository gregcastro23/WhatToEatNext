import React from 'react';
import Navigation from '../components/Navigation';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </main>
    </>
  );
} 