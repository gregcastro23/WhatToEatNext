import { useEffect, useLayoutEffect } from 'react';

export const useClientEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
