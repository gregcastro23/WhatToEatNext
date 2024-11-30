import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { getTheme } from '../utils/theme';
import '../styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    document.body.className = getTheme();
  }, []);

  return <Component {...pageProps} />;
};

export default MyApp; 