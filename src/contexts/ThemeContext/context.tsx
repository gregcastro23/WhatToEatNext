'use client';

import { createContext } from 'react';

import { ThemeContextType } from './types';

export const _ThemeContext = createContext<ThemeContextType | undefined>(undefined);
