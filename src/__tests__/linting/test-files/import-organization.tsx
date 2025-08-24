import { NextPage } from 'next';
import { useState, useEffect, useMemo } from 'react';

// Mock imports for linting test file
const CustomComponent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const useCustomHook = () => 'mocked-value';

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
      <CustomComponent title={memoizedValue} />
      <p>{String(customValue)}</p>
    </div>
  );
};

export default ImportOrganizationPage;
