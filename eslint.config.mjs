import nextVitals from 'eslint-config-next/core-web-vitals'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  // Optional: import nextTs from 'eslint-config-next/typescript' and spread ...nextTs after nextVitals
  // when you want the full Next 16 + TS preset (stricter typescript-eslint across the repo).
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'blob-report/**'
  ]),
  {
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: ['.*']
        }
      ],
      'unused-imports/no-unused-imports': 'warn'
    }
  },
  {
    files: ['src/**/index.tsx', 'src/**/index.ts'],
    rules: {
      'no-restricted-imports': 'off'
    }
  },
  // e2e: relative imports like ./fixtures and ./helpers match the restricted `patterns: ['.*']` rule.
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off'
    }
  },
  // scripts: `@/` path aliases match the same restricted-import patterns as other non-barrel files.
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
])
