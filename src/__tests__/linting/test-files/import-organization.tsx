
import { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';

import { CustomComponent } from '@/components/CustomComponent';
import { useCustomHook } from '@/hooks/useCustomHook';

import './styles.css';

const ImportOrganizationPage: NextPage = () => {
  const [state, setState] = useState('');
  const customValue = useCustomHook();
  
  const memoizedValue = useMemo(() => {
    return state.toUpperCase();
  }, [state]);
  
  useEffect(() => {
    setState('initialized');
  }, []);
  
  return (
    <div>
      <CustomComponent value={memoizedValue} />
      <p>{customValue}</p>
    </div>
  );
};

export default ImportOrganizationPage;
