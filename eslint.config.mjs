import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import unusedImports from 'eslint-plugin-unused-imports'

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
  }
])
