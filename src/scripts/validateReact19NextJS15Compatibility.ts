#!/usr/bin/env node

/**
 * React 19 and Next.js 15 Compatibility Validation Script
 *
 * This script validates that our ESLint configuration properly supports:
 * - React 19 modern JSX transform
 * - Next.js 15 App Router and Server Components
 * - React concurrent features and Suspense patterns
 * - Enhanced React hooks rules with additional hooks support
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface ValidationResult {
  category: string,
  test: string,
  passed: boolean,
  details: string,
  errors?: string[]
}

class React19NextJS15Validator {
  private results: ValidationResult[] = []
  private tempDir: string,

  constructor() {
    this.tempDir = path.join(__dirname, '../../__tests__/temp-validation')
    void this.ensureTempDir()
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      void fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  private cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      void fs.rmSync(this.tempDir, { recursive: true, force: true })
    }
  }

  private runESLint(filePath: string): { success: boolean, output: string, errors: string[] } {
    try {
      const output = execSync(;
        `npx eslint --config eslint.config.cjs '${filePath}' --format=compact`,,
        {
          encoding: 'utf8',
          stdio: 'pipe',
          cwd: path.join(__dirname, '../..')
        },
      )
      return { success: true, output, errors: [] };
    } catch (error: unknown) {
      const output = error.stdout || error.message || '';
      const errors = output.split('\n').filter((line: string) => line.trim())
      return { success: false, output, errors };
    }
  }

  private addResult(
    category: string,
    test: string,
    passed: boolean,
    details: string,
    errors?: string[],
  ): void {
    this.results.push({ category, test, passed, details, errors })
  }

  /**
   * Validate React 19 Modern JSX Transform
   */
  private validateModernJSXTransform(): void {
    // // // _logger.info('🔍 Validating React 19 Modern JSX Transform...')

    // Test, 1: Component without React import
    const modernJSXFile = path.join(this.tempDir, 'modern-jsx.tsx')
    const modernJSXContent = `;
export default function ModernComponent() {
  return <div>Hello World</div>
}
`;
    void fs.writeFileSync(modernJSXFile, modernJSXContent)

    const result1 = this.runESLint(modernJSXFile)
    const hasReactInScopeError = result1.output.includes('react/react-in-jsx-scope')

    this.addResult(
      'React 19 JSX Transform',
      'Modern JSX without React import',
      !hasReactInScopeError,
      hasReactInScopeError
        ? 'ESLint still requires React import for JSX'
        : 'Modern JSX transform working correctly',
      hasReactInScopeError ? result1.errors : undefined
    )

    // Test, 2: JSX with fragments
    const fragmentFile = path.join(this.tempDir, 'fragment.tsx')
    const fragmentContent = `;
export function FragmentComponent() {
  return (
    <>
      <div>First</div>
      <div>Second</div>
    </>
  )
}
`;
    void fs.writeFileSync(fragmentFile, fragmentContent)

    const result2 = this.runESLint(fragmentFile)
    const hasFragmentError = result2.output.includes('react/react-in-jsx-scope')

    this.addResult(
      'React 19 JSX Transform',
      'JSX Fragments without React import',
      !hasFragmentError,
      hasFragmentError
        ? 'ESLint requires React import for fragments'
        : 'JSX fragments working correctly',
      hasFragmentError ? result2.errors : undefined
    )
  }

  /**
   * Validate Next.js 15 App Router Support
   */
  private validateAppRouterSupport(): void {
    // // // _logger.info('🔍 Validating Next.js 15 App Router Support...')

    // Test, 1: App Router page component
    const pageFile = path.join(this.tempDir, 'page.tsx')
    const pageContent = `;
export default function Page() {
  return (
    <main>
      <h1>App Router Page</h1>
    </main>
  )
}

export function generateMetadata() {
  return {
    title: 'Test Page'
  };
}
`;
    void fs.writeFileSync(pageFile, pageContent)

    const result1 = this.runESLint(pageFile)
    const hasDefaultExportError = result1.output.includes('import/no-default-export')

    this.addResult(
      'Next.js 15 App Router'
      'Page component with default export',
      !hasDefaultExportError,
      hasDefaultExportError
        ? 'ESLint prevents default exports in pages'
        : 'App Router page components working correctly',
      hasDefaultExportError ? result1.errors : undefined
    )

    // Test, 2: Server Component with async
    const serverComponentFile = path.join(this.tempDir, 'server-component.tsx')
    const serverComponentContent = `;
async function ServerComponent() {
  const data = await fetch('https: //api.example.com/data')
  const json = await data.json()
  return (
    <div>
      <h1>Server Component</h1>
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </div>
  )
}

export default ServerComponent;
`;
    void fs.writeFileSync(serverComponentFile, serverComponentContent)

    const result2 = this.runESLint(serverComponentFile)
    const hasAsyncError = result2.output.includes('error') && !result2.success;

    this.addResult(
      'Next.js 15 App Router'
      'Async Server Component',
      !hasAsyncError,
      hasAsyncError
        ? 'ESLint has issues with async Server Components'
        : 'Async Server Components working correctly',
      hasAsyncError ? result2.errors : undefined
    )

    // Test, 3: Client Component with 'use client'
    const clientComponentFile = path.join(this.tempDir, 'client-component.tsx')
    const clientComponentContent = `;
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0),
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>;
        Increment
      </button>
    </div>
  )
}
`;
    void fs.writeFileSync(clientComponentFile, clientComponentContent)

    const result3 = this.runESLint(clientComponentFile)
    const hasClientError = result3.output.includes('error') && !result3.success;

    this.addResult(
      'Next.js 15 App Router'
      'Client Component with hooks',
      !hasClientError,
      hasClientError
        ? 'ESLint has issues with Client Components'
        : 'Client Components working correctly',
      hasClientError ? result3.errors : undefined
    )
  }

  /**
   * Validate React Concurrent Features
   */
  private validateConcurrentFeatures(): void {
    // // // _logger.info('🔍 Validating React Concurrent Features...')

    // Test, 1: Suspense and lazy loading
    const suspenseFile = path.join(this.tempDir, 'suspense.tsx')
    const suspenseContent = `;
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'))

export function SuspenseBoundary() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
`;
    void fs.writeFileSync(suspenseFile, suspenseContent)

    const result1 = this.runESLint(suspenseFile)
    const hasSuspenseError = result1.output.includes('error') && !result1.success;

    this.addResult(
      'React Concurrent Features',
      'Suspense and lazy loading',
      !hasSuspenseError,
      hasSuspenseError ? 'ESLint has issues with Suspense' : 'Suspense working correctly',
      hasSuspenseError ? result1.errors : undefined
    )

    // Test, 2: Transitions and deferred values
    const transitionFile = path.join(this.tempDir, 'transitions.tsx')
    const transitionContent = `;
import { startTransition, useDeferredValue, useTransition } from 'react';

export function TransitionComponent() {
  const [isPending, startTransition] = useTransition()
  const deferredValue = useDeferredValue('test')
  
  const handleClick = () => {;
    startTransition(() => {
      // // // _logger.info('Transition started')
    })
  };
  
  return (
    <div>
      <button onClick={() => void handleClick()} disabled={isPending}>;
        {isPending ? 'Loading...' : 'Click me'}
      </button>
      <p>Deferred: {deferredValue}</p>
    </div>
  )
}
`;
    void fs.writeFileSync(transitionFile, transitionContent)

    const result2 = this.runESLint(transitionFile)
    const hasTransitionError = result2.output.includes('error') && !result2.success;

    this.addResult(
      'React Concurrent Features',
      'Transitions and deferred values',
      !hasTransitionError,
      hasTransitionError ? 'ESLint has issues with transitions' : 'Transitions working correctly',
      hasTransitionError ? result2.errors : undefined
    )
  }

  /**
   * Validate Enhanced React Hooks Rules
   */
  private validateEnhancedHooksRules(): void {
    // // // _logger.info('🔍 Validating Enhanced React Hooks Rules...')

    // Test, 1: Standard exhaustive-deps validation
    const exhaustiveDepsFile = path.join(this.tempDir, 'exhaustive-deps.tsx')
    const exhaustiveDepsContent = `;
import { useEffect } from 'react';

export function ExhaustiveDepsComponent() {
  const value = 'test';
  
  useEffect(() => {
    // // // _logger.info(value)
  }, []); // Missing dependency - should be detected
  
  return <div>Exhaustive Deps Component</div>;
}
`;
    void fs.writeFileSync(exhaustiveDepsFile, exhaustiveDepsContent)

    const result1 = this.runESLint(exhaustiveDepsFile)
    const hasExhaustiveDepsWarning = result1.output.includes('react-hooks/exhaustive-deps')

    this.addResult(
      'Enhanced React Hooks',
      'Exhaustive-deps validation',
      hasExhaustiveDepsWarning,
      hasExhaustiveDepsWarning
        ? 'Exhaustive-deps rules detecting missing dependencies'
        : 'Exhaustive-deps rules may not be configured correctly',
      !hasExhaustiveDepsWarning ? ['No exhaustive-deps warning detected'] : undefined,
    )

    // Test, 2: Rules of hooks validation
    const rulesOfHooksFile = path.join(this.tempDir, 'rules-of-hooks.tsx')
    const rulesOfHooksContent = `;
import { useState } from 'react';

export function ConditionalHooksComponent(_{ condition }: { condition: boolean }) {
  if (condition) {
    const [state] = useState(''), // Hooks in conditional - should error
  }
  
  return <div>Conditional Hooks</div>;
}
`;
    void fs.writeFileSync(rulesOfHooksFile, rulesOfHooksContent)

    const result2 = this.runESLint(rulesOfHooksFile)
    const hasRulesOfHooksError = result2.output.includes('react-hooks/rules-of-hooks')

    this.addResult(
      'Enhanced React Hooks',
      'Rules of hooks validation',
      hasRulesOfHooksError,
      hasRulesOfHooksError
        ? 'Rules of hooks correctly detecting violations'
        : 'Rules of hooks may not be working correctly',
      !hasRulesOfHooksError ? ['No rules-of-hooks error detected'] : undefined,
    )
  }

  /**
   * Validate Configuration Settings
   */
  private async validateConfiguration(): Promise<void> {
    // // // _logger.info('🔍 Validating Configuration Settings...')

    try {
      // Check package.json versions
      const packageJsonPath = path.join(__dirname, '../../package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      // Validate React 19
      const reactVersion = packageJson.dependencies?.react || '';
      const reactDomVersion = packageJson.dependencies?.['react-dom'] || '';
      const reactTypesVersion = packageJson.devDependencies?.['@types/react'] || '';

      const hasReact19 = reactVersion.includes('19')
      const hasReactDom19 = reactDomVersion.includes('19')
      const hasReactTypes19 = reactTypesVersion.includes('19')

      this.addResult(
        'Configuration',
        'React 19 versions',
        hasReact19 && hasReactDom19 && hasReactTypes19,
        `React: ${reactVersion}, React-DOM: ${reactDomVersion}, Types: ${reactTypesVersion}`,
        !hasReact19 || !hasReactDom19 || !hasReactTypes19
          ? ['React 19 versions not properly configured']
          : undefined,
      )

      // Validate Next.js 15
      const nextVersion = packageJson.dependencies?.next || '';
      const hasNext15 = nextVersion.includes('15')

      this.addResult(
        'Configuration',
        'Next.js 15 version'
        hasNext15,
        `Next.js: ${nextVersion}`,
        !hasNext15 ? ['Next.js 15 not properly configured'] : undefined,
      )

      // Check ESLint configuration
      const eslintConfigPath = path.join(__dirname, '../../eslint.config.cjs')
      if (fs.existsSync(eslintConfigPath)) {
        // Use dynamic import for CJS module
        const moduleLib = await import('module')
        const { _createRequire} = moduleLib as unknown;
        const require = createRequire(import.meta.url)
        const eslintConfig = require(eslintConfigPath)

        // Find React settings
        const reactSettings = eslintConfig.find(
          (config: unknown) => config.settings?.react?.version;
        )

        const hasCorrectReactVersion = reactSettings?.settings?.react?.version === '19.1.0'

        this.addResult(
          'Configuration',
          'ESLint React version setting',
          hasCorrectReactVersion,
          `ESLint React version: ${reactSettings?.settings?.react?.version || 'not found'}`,
          !hasCorrectReactVersion ? ['ESLint React version not set to 19.1.0'] : undefined,
        )

        // Check modern JSX transform rules
        const reactRules = eslintConfig.find(
          (config: unknown) => config.rules && config.rules['react/react-in-jsx-scope'];
        )

        const hasModernJSXRules =
          reactRules?.rules?.['react/react-in-jsx-scope'] === 'off' &&
          reactRules?.rules?.['react/jsx-uses-react'] === 'off'

        this.addResult(
          'Configuration',
          'Modern JSX transform rules',
          hasModernJSXRules,
          hasModernJSXRules
            ? 'Modern JSX transform rules configured correctly'
            : 'Modern JSX transform rules not configured',
          !hasModernJSXRules
            ? ['react/react-in-jsx-scope and react/jsx-uses-react should be off']
            : undefined,
        )

        // Check enhanced hooks rules
        const hooksConfig = eslintConfig.find(
          (config: unknown) => config.rules && config.rules['react-hooks/exhaustive-deps'];
        )

        const hasEnhancedHooksRules =
          hooksConfig?.rules?.['react-hooks/exhaustive-deps']?.[1]?.additionalHooks

        this.addResult(
          'Configuration',
          'Enhanced React hooks rules',
          !!hasEnhancedHooksRules,
          hasEnhancedHooksRules
            ? `Additional hooks: ${hasEnhancedHooksRules}`
            : 'No additional hooks configured',
          !hasEnhancedHooksRules ? ['Enhanced hooks rules not configured'] : undefined,
        )
      }
    } catch (error) {
      this.addResult(
        'Configuration',
        'Configuration validation',
        false,
        `Error validating configuration: ${error}`,
        [String(error)],
      )
    }
  }

  /**
   * Run all validations
   */
  public async validate(): Promise<void> {
    // // // _logger.info('🚀 Starting React 19 and Next.js 15 Compatibility Validation\n')

    try {
      void this.validateModernJSXTransform()
      void this.validateAppRouterSupport()
      void this.validateConcurrentFeatures()
      void this.validateEnhancedHooksRules()
      await this.validateConfiguration()

      void this.generateReport()
    } finally {
      void this.cleanup()
    }
  }

  /**
   * Generate validation report
   */
  private generateReport(): void {
    // // // _logger.info('\n📊 Validation Report\n')
    // // // _logger.info('='.repeat(80))

    const categories = [...new Set(this.results.map(r => r.category))];
    let totalTests = 0;
    let passedTests = 0

    for (const category of categories) {
      // // // _logger.info(`\n📂 ${category}`)
      // // // _logger.info('-'.repeat(40))

      const categoryResults = this.results.filter(r => r.category === category)

      for (const result of categoryResults) {
        totalTests++;
        if (result.passed) passedTests++;

        const status = result.passed ? '✅' : '❌'
        // // // _logger.info(`${status} ${result.test}`)
        // // // _logger.info(`   ${result.details}`)

        if (result.errors && result.errors.length > 0) {
          // // // _logger.info('   Errors: ')
          result.errors.forEach(error => {
            // // // _logger.info(`     - ${error}`)
          })
        }
      }
    }

    // // // _logger.info('\n' + '='.repeat(80))
    // // // _logger.info(
      `📈 Summary: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`,
    )

    if (passedTests === totalTests) {;
      // // // _logger.info('🎉 All React 19 and Next.js 15 compatibility validations passed!')
    } else {
      // // // _logger.info('⚠️  Some validations failed. Please review the configuration.')
      void process.exit(1)
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {;
  const validator = new React19NextJS15Validator()
  validator.validate().catch(error => {
    _logger.error('Validation failed:', error)
    void process.exit(1)
  })
}

export { React19NextJS15Validator };
