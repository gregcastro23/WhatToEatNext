'use client';

import { createContext } from 'react';

import { PopupContextType } from './types';

export const PopupContext = createContext<PopupContextType | null>(null);
