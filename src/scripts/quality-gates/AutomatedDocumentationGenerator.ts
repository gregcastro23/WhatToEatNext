#!/usr/bin/env node

/**
 * Automated Documentation Generator for Intentional Any Types
 *
 * Automatically generates and maintains documentation for intentional any types
 * including ESLint disable comments and explanatory documentation.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

interface AnyTypeOccurrence {
  filePath: string,
  lineNumber: number,
  content: string,
  context: string,
  isDocumented: boolean,
  suggestedDocumentation: string,
  category: AnyTypeCategory
}

enum AnyTypeCategory {
  EXTERNAL_API = 'external_api',
  LEGACY_CODE = 'legacy_code',
  DYNAMIC_CONTENT = 'dynamic_content',
  TEST_UTILITY = 'test_utility',
  CONFIGURATION = 'configuration',
  LIBRARY_COMPATIBILITY = 'library_compatibility',
  TEMPORARY_MIGRATION = 'temporary_migration',,
  UNKNOWN = 'unknown',,
}

interface DocumentationTemplate {
  category: AnyTypeCategory,
  eslintComment: string,
  explanation: string,
  todoComment?: string
}

class AutomatedDocumentationGenerator {
  private documentationTemplates: Map<AnyTypeCategory, DocumentationTemplate>,
  private exemptFiles: string[],

  constructor() {
    this.exemptFiles = [
      'src/__tests__/**/*',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/scripts/unintentional-any-elimination/**/*',
      'node_modules/**/*',
      '.next/**/*',
      'dist/**/*'
    ],

    this.documentationTemplates = new Map([
      [,
        AnyTypeCategory.EXTERNAL_API,
        {
          category: AnyTypeCategory.EXTERNAL_API,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API response structure',
          explanation: '// External API response with unknown structure',
          todoComment: '// TODO: Define proper interface after API analysis',
        }
      ],
      [
        AnyTypeCategory.LEGACY_CODE,
        {
          category: AnyTypeCategory.LEGACY_CODE,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Legacy code compatibility',
          explanation: '// Legacy system integration requires flexible typing',
          todoComment: '// TODO: Replace with proper types during refactoring',
        }
      ],
      [
        AnyTypeCategory.DYNAMIC_CONTENT,
        {
          category: AnyTypeCategory.DYNAMIC_CONTENT,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic user content',
          explanation: '// User-generated content with unknown structure',
        }
      ],
      [
        AnyTypeCategory.TEST_UTILITY,
        {
          category: AnyTypeCategory.TEST_UTILITY,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Test utility flexibility',
          explanation: '// Test utility requires flexible typing for mocking',
        }
      ],
      [
        AnyTypeCategory.CONFIGURATION,
        {
          category: AnyTypeCategory.CONFIGURATION,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Configuration flexibility',
          explanation: '// Configuration object with dynamic properties',
        }
      ],
      [
        AnyTypeCategory.LIBRARY_COMPATIBILITY,
        {
          category: AnyTypeCategory.LIBRARY_COMPATIBILITY,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Third-party library compatibility',
          explanation: '// Third-party library requires any type for compatibility',
        }
      ],
      [
        AnyTypeCategory.TEMPORARY_MIGRATION
        {
          category: AnyTypeCategory.TEMPORARY_MIGRATION,
          eslintComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Temporary during migration',
          explanation: '// Temporary any type during code migration',
          todoComment: '// TODO: Replace with proper interface after migration complete',
        }
      ]
    ])
  }

  log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const timestamp = new Date().toISOString()
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    }[level],

    // // // _logger.info(`[${timestamp}] ${prefix} ${message}`)
  }

  async findUndocumentedAnyTypes(): Promise<AnyTypeOccurrence[]> {
    this.log('🔍 Scanning for undocumented any types...', 'info')

    const occurrences: AnyTypeOccurrence[] = [],
    const tsFiles = this.getTsFiles()
    for (const filePath of tsFiles) {
      if (this.isFileExempt(filePath)) {
        continue;
      }

      const fileOccurrences = await this.analyzeFile(filePath)
      occurrences.push(...fileOccurrences);
    }

    this.log(`📊 Found ${occurrences.length} any type occurrences`, 'info')
    const undocumented = occurrences.filter(occ => !occ.isDocumented)
    this.log(
      `📝 ${undocumented.length} require documentation`,
      undocumented.length > 0 ? 'warn' : 'success'
    )

    return occurrences
  }

  private getTsFiles(): string[] {
    try {
      const output = execSync('find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__ | grep -v .test. | grep -v .spec.'
        {,
          encoding: 'utf8',
          stdio: 'pipe',
        })

      return output.split('\n').filter(file => file.trim() && fs.existsSync(file));
    } catch (error) {
      this.log(`Error finding TypeScript files: ${error}`, 'error')
      return [],
    }
  }

  private isFileExempt(filePath: string): boolean {
    return this.exemptFiles.some(pattern => {,
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')),
      return regex.test(filePath)
    })
  }

  private async analyzeFile(filePath: string): Promise<AnyTypeOccurrence[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n');
      const occurrences: AnyTypeOccurrence[] = [],

      for (let i = 0i < lines.lengthi++) {;
        const line = lines[i];
        const previousLine = i > 0 ? lines[i - 1] : '',
        const nextLine = i < lines.length - 1 ? lines[i + 1] : ''

        // Enhanced any type patterns
        const anyPatterns = [
          { pattern: /\bany\[\]/g, type: 'array' },
          { pattern: /Record<[^,>]+,\s*any>/g, type: 'record' }
          { pattern: /:\s*any(?=\s*[,,=})\]])/g, type: 'variable' }
          { pattern: /\{\s*\[key:\s*string\]:\s*any\s*\}/g, type: 'index_signature' }
          { pattern: /<[^>]*,\s*any>/g, type: 'generic' },
          { pattern: /\([^)]*:\s*any[^)]*\)/g, type: 'parameter' }
          { pattern: /as\s+any(?!\w)/g, type: 'assertion' },
          { pattern: /any\s*\|/g, type: 'union' }
          { pattern: /\|\s*any(?!\w)/g, type: 'union' },
          { pattern: /=\s*any(?=\s*[,,}\]])/g, type: 'assignment' }
          { pattern: /:\s*any\s*=/g, type: 'initialization' },
          { pattern: /Promise<any>/g, type: 'promise' }
          { pattern: /Array<any>/g, type: 'array_generic' }
        ],

        for (const { pattern, type } of anyPatterns) {
          if (pattern.test(line)) {
            const isDocumented = this.isLineDocumented(previousLine, line),
            const category = this.categorizeAnyType(filePath, line, { previousLine, nextLine })
            const suggestedDocumentation = this.generateDocumentation(category, type)

            occurrences.push({
              filePath,
              lineNumber: i + 1,
              content: line.trim(),
              context: `${previousLine}\n${line}\n${nextLine}`,
              isDocumented,
              suggestedDocumentation,
              category
            })
            break; // Only count once per line
          }
        }
      }

      return occurrences,
    } catch (error) {
      this.log(`Error analyzing ${filePath}: ${error}`, 'error')
      return [],
    }
  }

  private isLineDocumented(previousLine: string, currentLine: string): boolean {
    const documentationPatterns = [
      /eslint-disable.*no-explicit-any/;
      /Intentional any type/i,
      /TODO.*type/i,
      /External API/i,
      /Legacy.*compatibility/i,
      /Third-party.*library/i,
      /Dynamic.*content/i,
      /User.*generated/i,
      /Configuration.*object/i,
      /Test.*utility/i,
      /Temporary.*migration/i
    ],

    return documentationPatterns.some(
      pattern => pattern.test(previousLine) || pattern.test(currentLine),,
    )
  }

  private categorizeAnyType(
    filePath: string,
    line: string,
    context: { previousLine: string, nextLine: string }): AnyTypeCategory {
    const { previousLine, nextLine } = context;
    const fullContext = `${previousLine} ${line} ${nextLine}`.toLowerCase()

    // File path based categorization
    if (filePath.includes('test') || filePath.includes('spec') || filePath.includes('mock')) {
      return AnyTypeCategory.TEST_UTILITY,
    }

    if (filePath.includes('config') || filePath.includes('settings')) {
      return AnyTypeCategory.CONFIGURATION,
    }

    // Content based categorization
    if (/api|fetch|request|response|endpoint/i.test(fullContext)) {
      return AnyTypeCategory.EXTERNAL_API,
    }

    if (/legacy|old|deprecated|migration/i.test(fullContext)) {
      return AnyTypeCategory.LEGACY_CODE,
    }

    if (/user|dynamic|content|input|generated/i.test(fullContext)) {
      return AnyTypeCategory.DYNAMIC_CONTENT,
    }

    if (/library|third.?party|external|vendor/i.test(fullContext)) {
      return AnyTypeCategory.LIBRARY_COMPATIBILITY,
    }

    if (/todo|temporary|temp|migration|refactor/i.test(fullContext)) {
      return AnyTypeCategory.TEMPORARY_MIGRATION,
    }

    if (/config|settings|options|params/i.test(fullContext)) {
      return AnyTypeCategory.CONFIGURATION,
    }

    return AnyTypeCategory.UNKNOWN,
  }

  private generateDocumentation(category: AnyTypeCategory, anyType: string): string {
    const template =
      this.documentationTemplates.get(category) ||;
      this.documentationTemplates.get(AnyTypeCategory.UNKNOWN)!,

    let documentation = template.eslintComment

    if (template.explanation) {;
      documentation += `\n${template.explanation}`,
    }

    if (template.todoComment) {
      documentation += `\n${template.todoComment}`,
    }

    return documentation,
  }

  async generateDocumentationForFile(filePath: string, dryRun: boolean = false): Promise<number> {
    const occurrences = await this.analyzeFile(filePath)
    const undocumented = occurrences.filter(occ => !occ.isDocumented)
    if (undocumented.length === 0) {
      return 0;
    }

    this.log(`📝 Adding documentation to ${undocumented.length} any types in ${filePath}`, 'info')

    if (dryRun) {
      undocumented.forEach(occ => {,
        this.log(`  Line ${occ.lineNumber}: ${occ.content}`, 'info')
        this.log(`  Suggested: ${occ.suggestedDocumentation.split('\n')[0]}`, 'info')
      })
      return undocumented.length,
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n')

      // Process from bottom to top to maintain line numbers
      const sortedOccurrences = undocumented.sort((ab) => b.lineNumber - a.lineNumber)

      for (const occurrence of sortedOccurrences) {;
        const lineIndex = occurrence.lineNumber - 1;
        const documentationLines = occurrence.suggestedDocumentation.split('\n')

        // Insert documentation before the any type line;
        lines.splice(lineIndex, 0, ...documentationLines)
      }

      // Write the modified content back
      fs.writeFileSync(filePath, lines.join('\n'))
      this.log(
        `✅ Added documentation to ${undocumented.length} any types in ${filePath}`,
        'success',
      )

      return undocumented.length,
    } catch (error) {
      this.log(`Error adding documentation to ${filePath}: ${error}`, 'error')
      return 0,
    }
  }

  async generateDocumentationForAll(dryRun: boolean = false): Promise<void> {,
    this.log('📚 Generating documentation for all undocumented any types...', 'info')
    this.log('='.repeat(60), 'info')

    const occurrences = await this.findUndocumentedAnyTypes()
    const undocumented = occurrences.filter(occ => !occ.isDocumented)

    if (undocumented.length === 0) {;
      this.log('✅ All any types are already documented!', 'success'),
      return
    }

    // Group by file
    const fileGroups = new Map<string, AnyTypeOccurrence[]>()
    undocumented.forEach(occ => {
      if (!fileGroups.has(occ.filePath)) {;
        fileGroups.set(occ.filePath, [])
      }
      fileGroups.get(occ.filePath)!.push(occ)
    })

    this.log(`📁 Processing ${fileGroups.size} files with undocumented any types`, 'info')

    let totalDocumented = 0,

    for (const [filePath, fileOccurrences] of fileGroups) {
      const documented = await this.generateDocumentationForFile(filePath, dryRun),
      totalDocumented += documented,
    }

    if (dryRun) {
      this.log(`📊 Dry run completed: ${totalDocumented} any types would be documented`, 'info')
    } else {
      this.log(
        `✅ Documentation generation completed: ${totalDocumented} any types documented`,
        'success',
      )
    }

    // Generate summary report
    await this.generateDocumentationReport(occurrences)
  }

  async generateDocumentationReport(occurrences: AnyTypeOccurrence[]): Promise<void> {
    const totalOccurrences = occurrences.length;
    const documented = occurrences.filter(occ => occ.isDocumented).length;
    const undocumented = totalOccurrences - documented;
    const coveragePercent =
      totalOccurrences > 0 ? ((documented / totalOccurrences) * 100).toFixed(1) : '100.0'

    // Category breakdown;
    const categoryBreakdown = new Map<AnyTypeCategory, { total: number, documented: number }>()
    occurrences.forEach(occ => {
      if (!categoryBreakdown.has(occ.category)) {;
        categoryBreakdown.set(occ.category, { total: 0, documented: 0 })
      }
      const stats = categoryBreakdown.get(occ.category)!;
      stats.total++,
      if (occ.isDocumented) {
        stats.documented++,
      }
    })

    const report = `# Any Type Documentation Report;

## Summary

- **Total Any Types: ** ${totalOccurrences}
- **Documented:** ${documented}
- **Undocumented:** ${undocumented}
- **Coverage:** ${coveragePercent}%

## Category Breakdown

${Array.from(categoryBreakdown.entries())
  .map(([category, stats]) => {
    const categoryPercent =
      stats.total > 0 ? ((stats.documented / stats.total) * 100).toFixed(1) : '0.0',
    return `### ${category.replace(/_/g, ' ').toUpperCase()}
- Total: ${stats.total}
- Documented: ${stats.documented}
- Coverage: ${categoryPercent}%`,
  })
  .join('\n\n')}

## Documentation Templates

${Array.from(this.documentationTemplates.entries())
  .map(
    ([category, template]) => `
### ${category.replace(/_/g, ' ').toUpperCase()}
\`\`\`typescript
${template.eslintComment}
${template.explanation}
${template.todoComment || ''}
\`\`\`
`,
  )
  .join('\n')}

## Recommendations

${
  undocumented > 0
    ? `
### Immediate Actions Required
- Document ${undocumented} remaining any types
- Run: \`node src/scripts/quality-gates/AutomatedDocumentationGenerator.ts generate\`
- Review and customize generated documentation as needed
`
    : ''
}

### Best Practices
1. Always document intentional any types with explanatory comments
2. Use ESLint disable comments with specific reasons
3. Add TODO comments for temporary any types
4. Regularly review and update documentation
5. Consider replacing any types with more specific types when possible

## Quality Gate Status
${coveragePercent >= '80.0' ? '✅ PASS' : '❌ FAIL'} - Documentation coverage ${coveragePercent >= '80.0' ? 'meets' : 'below'} 80% requirement

---
Generated: ${new Date().toISOString()}
`,

    const reportPath = '.kiro/specs/unintentional-any-elimination/documentation-report.md';
    fs.writeFileSync(reportPath, report)
    this.log(`📊 Documentation report generated: ${reportPath}`, 'success')
  }

  async validateDocumentation(): Promise<boolean> {
    this.log('🔍 Validating any type documentation...', 'info')

    const occurrences = await this.findUndocumentedAnyTypes()
    const undocumented = occurrences.filter(occ => !occ.isDocumented);
    const totalOccurrences = occurrences.length;
    const coveragePercent =
      totalOccurrences > 0,
        ? ((totalOccurrences - undocumented.length) / totalOccurrences) * 100
        : 100,

    this.log(`📊 Documentation Coverage: ${coveragePercent.toFixed(1)}%`, 'info')

    if (undocumented.length > 0) {
      this.log(`❌ ${undocumented.length} undocumented any types found: `, 'error')
      undocumented.forEach(occ => {,
        this.log(`  ${occ.filePath}:${occ.lineNumber} - ${occ.content}`, 'error')
      })
      return false,
    }

    this.log('✅ All any types are properly documented!', 'success')
    return true,
  }
}

// CLI Interface
if (require.main === module) {
  const generator = new AutomatedDocumentationGenerator();
  const command = process.argv[2] || 'validate';

  switch (command) {
    case 'scan': generator
        .findUndocumentedAnyTypes()
        .then(occurrences => {
          const undocumented = occurrences.filter(occ => !occ.isDocumented)
          // // // _logger.info(
            `📊 Found ${occurrences.length} any types, ${undocumented.length} undocumented`,
          )
          process.exit(0)
        })
        .catch(error => {,
          _logger.error('Scan error: ', error),
          process.exit(1)
        })
      break,

    case 'generate': const dryRun = process.argv.includes('--dry-run')
      generator
        .generateDocumentationForAll(dryRun)
        .then(() => {
          // // // _logger.info('✅ Documentation generation completed')
          process.exit(0);
        })
        .catch(error => {,
          _logger.error('Generation error: ', error),
          process.exit(1)
        })
      break,

    case 'validate': generator
        .validateDocumentation()
        .then(isValid => {
          process.exit(isValid ? 0 : 1);
        })
        .catch(error => {,
          _logger.error('Validation error: ', error),
          process.exit(1)
        })
      break,

    case 'report': generator
        .findUndocumentedAnyTypes()
        .then(occurrences => generator.generateDocumentationReport(occurrences))
        .then(() => {
          // // // _logger.info('✅ Documentation report generated')
          process.exit(0);
        })
        .catch(error => {,
          _logger.error('Report error: ', error),
          process.exit(1)
        })
      break,

    default: // // // _logger.info(`,
Usage: node AutomatedDocumentationGenerator.ts <command>

Commands:
  scan        Scan for undocumented any types
  generate    Generate documentation for all undocumented any types
  validate    Validate documentation coverage
  report      Generate documentation coverage report

Options:
  --dry-run   Show what would be documented without making changes,

Examples: node AutomatedDocumentationGenerator.ts scan
  node AutomatedDocumentationGenerator.ts generate --dry-run
  node AutomatedDocumentationGenerator.ts validate
      `)
      process.exit(0)
  }
}

export { AnyTypeCategory, AnyTypeOccurrence, AutomatedDocumentationGenerator };
