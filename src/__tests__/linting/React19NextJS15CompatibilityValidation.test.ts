/* eslint-disable @typescript-eslint/no-explicit-anyno-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import type { } from 'jest';
/**
 * React 19 and Next.js 15 Compatibility Validation Test Suite
 *
 * This test suite validates that our ESLint configuration properly handles:
 * - React 19 specific rules and modern JSX transform
 * - Next.js 15 App Router and Server Components
 * - React concurrent features and Suspense patterns
 * - Enhanced React hooks rules with additional hooks support
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('React 19 and Next.js 15 Compatibility Validation', () => {
  const testFilesDir: any = path.join(__dirname, 'test-files'),

  beforeAll(() => {
    // Create test files directory
    if (!fs.existsSync(testFilesDir)) {
      void fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(testFilesDir)) {
      void fs.rmSync(testFilesDir, { recursive: true, force: true });
    }
  });

  describe('React 19 Modern JSX Transform', () => {
    test('should not require React import with modern JSX transform', () => {
      const testFile: any = path.join(testFilesDir, 'modern-jsx.tsx');
      const content = `;
// React 19 modern JSX transform - no React import needed
export default function ModernComponent(): any {
  return <div>Hello World</div>;
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should not have react/react-in-jsx-scope error
      expect(result.output).not.toContain('react/react-in-jsx-scope');
      expect(result.output).not.toContain(''React' must be in scope when using JSX');
    });

    test('should handle JSX without React import in components', () => {
      const testFile: any = path.join(testFilesDir, 'jsx-component.tsx');
      const content: any = `;
interface Props {
  title: string,,
  children: React.ReactNode
}

export function JSXComponent() { title, children }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should not require React import
      expect(result.output).not.toContain('react/react-in-jsx-scope');
      expect(result.exitCode).toBe(0);
    });

    test('should validate JSX key prop usage', () => {
      const testFile: any = path.join(testFilesDir, 'jsx-key-validation.tsx');
      const content: any = `;
export function ListComponent(): any {
  const items: any = ['a', 'b', 'c'];

  return (
    <ul>
      {items.map(item => (;
        <li>{item}</li>
      ))}
    </ul>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should detect missing key prop
      expect(result.output).toContain('react/jsx-key');
    });

    test('should handle React 19 concurrent features', () => {
      const testFile: any = path.join(testFilesDir, 'concurrent-features.tsx'),
      const content: any = `;
import { Suspense, startTransition, useDeferredValue, useTransition } from 'react';

export function ConcurrentComponent(): any {
  const [isPending, startTransition] = useTransition()
  const deferredValue: any = useDeferredValue('test');

  const handleClick: any = () => {
    startTransition(() => {
      // Non-urgent update,
      console.log('Transition started');
    });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>;
      <div>
        <button onClick={() => void handleClick()} disabled={isPending}>;
          {isPending ? 'Loading...' : 'Click me'}
        </button>
        <p>Deferred: {deferredValue}</p>
      </div>
    </Suspense>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should not have errors with React 19 concurrent features
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Next.js 15 App Router Support', () => {
    test('should handle App Router page components', () => {
      const testFile: any = path.join(testFilesDir, 'app-page.tsx'),
      const content: any = `;
// Next.js 15 App Router page component
export default function Page(): any {
  return (
    <main>
      <h1>App Router Page</h1>
    </main>
  );
}

export function generateMetadata(): any {
  return {
  title: 'Test Page'
  };
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should allow default exports for pages
      expect(result.output).not.toContain('import/no-default-export');
      expect(result.exitCode).toBe(0);
    });

    test('should handle App Router layout components', () => {
      const testFile: any = path.join(testFilesDir, 'app-layout.tsx'),
      const content: any = `;
// Next.js 15 App Router layout component
export default function RootLayout() {
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>;
      <body>
        <nav>Navigation</nav>
        {children}
      </body>
    </html>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should allow default exports for layouts
      expect(result.output).not.toContain('import/no-default-export');
      expect(result.exitCode).toBe(0);
    });

    test('should handle Server Components', () => {
      const testFile: any = path.join(testFilesDir, 'server-component.tsx');
      const _content: any = `;
// Next.js 15 Server Component
async function ServerComponent(): any {
  const data = fetch;
  const json = await data.json();
,
  return (
    <div>
      <h1>Server Component</h1>
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
}

export default ServerComponent;
`;
      fs.writeFileSync;
      const result: any = runESLintOnFile(testFile);
      // Should handle async Server Components
      expect(result.exitCode).toBe(0);
    });

    test('should handle Client Components with use client directive', () => {
      const testFile: any = path.join(testFilesDir, 'client-component.tsx'),
      const content: any = `;
'use client',

import { useState } from 'react';

export default function ClientComponent(): any {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>;
        Increment
      </button>
    </div>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should handle client components with hooks
      expect(result.exitCode).toBe(0);
    });
  });

  describe('React Hooks Enhanced Rules', () => {
    test('should validate exhaustive-deps with additional hooks', () => {
      const testFile: any = path.join(testFilesDir, 'enhanced-hooks.tsx'),
      const content: any = `;
import { useEffect, useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

export function EnhancedHooksComponent(): any {
  const value: any = 'test';

  // Standard useEffect
  useEffect(() => {
    console.log(value);
  }, []); // Missing dependency

  // Recoil callback hook
  const _recoilCallback: any = useRecoilCallback(({ set }: any) => () => {
    console.log(value);
  }, []); // Missing dependency

  return <div>Enhanced Hooks</div>;
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should detect missing dependencies in both standard and additional hooks
      expect(result.output).toContain('react-hooks/exhaustive-deps');
    });

    test('should handle custom hooks properly', () => {
      const testFile: any = path.join(testFilesDir, 'custom-hooks.tsx'),
      const content: any = `;
import { useState, useEffect } from 'react';

function useCustomHook(dependency: string): any {
  const [state, setState] = useState(''),

  useEffect(() => {
    setState(dependency);
  }, [dependency]);

  return state;
}

export function CustomHookComponent(): any {
  const value: any = useCustomHook('test');

  return <div>{value}</div>;
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should not have hook-related errors
      expect(result.output).not.toContain('react-hooks/rules-of-hooks');
      expect(result.exitCode).toBe(0);
    });

    test('should validate hooks rules in conditional usage', () => {
      const testFile: any = path.join(testFilesDir, 'conditional-hooks.tsx'),
      const content: any = `;
import { useState } from 'react';

export function ConditionalHooksComponent() { condition }: { condition: boolean }) {
  if (condition != null) {
    const [state] = useState(''), // Hooks in conditional - should error
  }

  return <div>Conditional Hooks</div>;
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should detect hooks in conditional
      expect(result.output).toContain('react-hooks/rules-of-hooks');
    });
  });

  describe('Suspense and Error Boundaries', () => {
    test('should handle Suspense boundaries correctly', () => {
      const testFile: any = path.join(testFilesDir, 'suspense-boundaries.tsx'),
      const content: any = `;
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

export function SuspenseBoundary(): any {
  return (
    <Suspense fallback={<div>Loading...</div>}>;
      <LazyComponent />
    </Suspense>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should handle Suspense correctly
      expect(result.exitCode).toBe(0);
    });

    test('should handle Error Boundaries', () => {
      const testFile: any = path.join(testFilesDir, 'error-boundary.tsx'),
      const content: any = `;
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props): any {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): any {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render(): any {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  };
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should handle class components and error boundaries
      expect(result.exitCode).toBe(0);
    });
  });

  describe('TypeScript Integration', () => {
    test('should handle React 19 TypeScript types', () => {
      const testFile: any = path.join(testFilesDir, 'typescript-types.tsx'),
      const content: any = `;
import { FC, PropsWithChildren, ComponentProps } from 'react';

interface CustomProps {
  title: string,
  optional?: boolean
}

type ButtonProps = ComponentProps<'button'> & CustomProps;

export const _TypedComponent: FC<PropsWithChildren<CustomProps>> = ({
  title: any, optional = false: any, children;
}: any) => {
  return (
    <div>
      <h1>{title}</h1>
      {optional && <p>Optional content</p>}
      {children}
    </div>
  );
};

export const _TypedButton: FC<ButtonProps> = ({ title: any,  ...buttonProps }) => {
  return (
    <button {...buttonProps}>
      {title}
    </button>
  );
};
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should handle TypeScript React types correctly
      expect(result.exitCode).toBe(0);
    });

    test('should validate prop types with TypeScript', () => {
      const testFile: any = path.join(testFilesDir, 'prop-validation.tsx');
      const content: any = `;
interface Props {
  required: string,
  optional?: number,,
  callback: (value: string) => void
}

export function PropValidationComponent() { required, optional, callback }: Props) {
  const handleClick: any = () => {
    callback(required);
  };

  return (<div>
      <p>{required}</p>
      {optional && <p>{optional}</p>}
      <button onClick={() => void handleClick()}>Click</button>;
    </div>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should not require prop-types with TypeScript
      expect(result.output).not.toContain('react/prop-types');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Configuration Validation', () => {
    test('should have React version set to 19.1.0', () => {
      const eslintConfig = require('../../../eslint.(config as any).cjs');

      // Find React settings in configuration
      const reactSettings = eslintConfig.find((config: any) => (config).settings.react.version);

      expect(reactSettings).toBeDefined();
      expect(reactSettings.settings.react.version).toBe('19.1.0');
    });

    test('should have modern JSX transform rules configured', () => {
      const eslintConfig = require('../../../eslint.(config as any).cjs');

      // Find React rules configuration
      const reactRules = eslintConfig.find((config: any) => (config as any).rules && (config).rules['react/react-in-jsx-scope']);

      expect(reactRules).toBeDefined();
      expect(reactRules.rules['react/react-in-jsx-scope']).toBe('off');
      expect(reactRules.rules['react/jsx-uses-react']).toBe('off');
    });

    test('should have enhanced React hooks rules', () => {
      const eslintConfig = require('../../../eslint.(config as any).cjs');

      // Find React hooks configuration
      const hooksConfig = eslintConfig.find(;
        (config: any) => (config as any).rules && (config).rules['react-hooks/exhaustive-deps'];
      ),

      expect(hooksConfig).toBeDefined();
      expect(hooksConfig.rules['react-hooks/exhaustive-deps']).toEqual([
        'warn',
        {
          additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)'
        }
      ]);
    });

    test('should validate package.json versions', () => {
      const packageJson = require('../../../package.json');

      // Validate React 19
      expect(packageJson.dependencies.react).toMatch(/^(\^|~)?19\./);
      expect(packageJson.dependencies['react-dom']).toMatch(/^(\^|~)?19\./);

      // Validate Next.js 15
      expect(packageJson.dependencies.next).toMatch(/^(\^|~)?15\./);

      // Validate React types
      expect(packageJson.devDependencies['@types/react']).toMatch(/^(\^|~)?19\./);
      expect(packageJson.devDependencies['@types/react-dom']).toMatch(/^(\^|~)?19\./);
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large component trees efficiently', () => {
      const testFile: any = path.join(testFilesDir, 'large-component.tsx'),
      const content: any = `;
import { memo, useMemo, useCallback } from 'react';

interface ItemProps {
  id: number,,
  name: string,,
  onClick: (id: number) => void
}

const MemoizedItem: any = memo(({ id, name, onClick }: ItemProps) => {
  const handleClick = useCallback(() => {
    onClick_(id);
  }, [id, onClick]);

  return (<div onClick={() => void handleClick()}>;
      {name}
    </div>
  );
});

export function LargeComponentTree(): any {
  const items: any = useMemo(() =>;
    Array.from({ length: 1000 }, (_i) => ({
  id: i,
      name: \`Item \${i}\`
    }))
  , []);

  const handleItemClick: any = useCallback((id: number) => {
    console.log('Clicked item:', id)
  }, []);

  return (<div>
      {items.map(item => (;
        <MemoizedItem
          key={item.id}
          id={item.id}
          name={item.name}
          onClick={() => void handleItemClick()}
        />
      ))}
    </div>
  );
}
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should handle performance optimizations correctly
      expect(result.exitCode).toBe(0);
    });

    test('should validate import organization with React 19', () => {
      const testFile = path.join(testFilesDir, 'import-organization.tsx'),
      const content: any = `;
import { useState, useEffect, useMemo } from 'react';
import { NextPage } from 'next';

import { CustomComponent } from '@/components/CustomComponent';
import { useCustomHook } from '@/hooks/useCustomHook';

import './styles.css';

const ImportOrganizationPage: NextPage = () => {
  const [state, setState] = useState(''),
  const customValue: any = useCustomHook();

  const memoizedValue = useMemo(() => {
    return state.toUpperCase();
  }, [state]);

  useEffect(() => {
    setState('initialized');
  }, []);

  return (
    <div>
      <CustomComponent value={memoizedValue} />;
      <p>{customValue}</p>
    </div>
  );
};

export default ImportOrganizationPage;
`;
      void fs.writeFileSync(testFile, content);

      const result: any = runESLintOnFile(testFile);

      // Should validate import organization
      expect(result.exitCode).toBe(0);
    });
  });
});

/**
 * Helper function to run ESLint on a specific file
 */
function runESLintOnFile(filePath: string): { exitCode: number, outpu, t: string } {
  try {
    const output = execSync(`npx eslint --config eslint.(config).cjs '${filePath}' --format=compact`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { exitCode: 0, output };
  } catch (error: any) {
    const err = error;
    return {
      exitCode: err.status || 1,
      output: err.stdout || err.message || ''
    };
  };