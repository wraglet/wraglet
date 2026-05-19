// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import nextVitals from 'eslint-config-next/core-web-vitals'
import sonarjs from 'eslint-plugin-sonarjs'
import storybook from 'eslint-plugin-storybook'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  // SonarJS in ESLint (subset of SonarQube IDE rules). Full `recommended` is ~60+ errors on legacy UI code;
  // enable high-signal rules as warn first, then tighten per directory.
  {
    plugins: { sonarjs },
    rules: {
      'sonarjs/no-dead-store': 'warn',
      'sonarjs/no-ignored-exceptions': 'warn',
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/no-unused-vars': 'warn',
      // Covered by eslint-plugin-unused-imports
      'sonarjs/unused-import': 'off'
    }
  },
  // Sonar S7763 (`export…from`) + stricter hygiene on API contracts and mock fixtures
  {
    files: ['src/contracts/**/*.ts', 'src/test/mock-rest/**/*.ts'],
    plugins: { sonarjs, unicorn },
    rules: {
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/unused-import': 'error',
      'unicorn/prefer-export-from': 'error'
    }
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'storybook-static/**',
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
      // Warn on path-like import patterns so relative `./foo` and `@/` stay deliberate;
      // e2e/scripts/barrels opt out below. (See eslint `no-restricted-imports` patterns.)
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
  // Colocated Vitest: `./route` and sibling imports are intentional.
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      'no-restricted-imports': 'off'
    }
  },
  // Mock REST catalog: internal relative imports between sibling modules.
  {
    files: ['src/test/mock-rest/**/*.ts'],
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
  },
  ...storybook.configs['flat/recommended']
])
