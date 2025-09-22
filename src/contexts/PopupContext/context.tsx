'use client';

import { createContext } from 'react';

import { PopupContextType } from './types';

export const _PopupContext = createContext<PopupContextType | null>(null)
