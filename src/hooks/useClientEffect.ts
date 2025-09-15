import { useEffect, useLayoutEffect } from 'react';

export const _useClientEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
