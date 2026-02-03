import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores([
        'dist',
        'src/components/ui/**', // ui 폴더 내부의 모든 파일을 제외
    ]),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2025,
            globals: globals.browser,
        },
        plugins: {
            'import': importPlugin,
        },
        rules: {
            'react-hooks/exhaustive-deps': 'off',
            'import/order': ['error', {
                groups: [
                    ['builtin', 'external'],
                    ['internal'],
                    ['parent', 'sibling', 'index'],
                ],
                pathGroups: [
                    { pattern: 'react', group: 'external', position: 'before' },
                    { pattern: 'react-dom', group: 'external', position: 'before' },
                    { pattern: 'src/apis/**', group: 'internal', position: 'before' },
                    { pattern: 'src/constants/**', group: 'internal', position: 'before' },
                    { pattern: 'src/stores/**', group: 'internal', position: 'before' },
                    { pattern: 'src/hooks/**', group: 'internal', position: 'before' },
                    { pattern: 'src/utils/**', group: 'internal', position: 'before' },
                    { pattern: 'src/types/**', group: 'internal', position: 'after' },
                    { pattern: 'src/interface/**', group: 'internal', position: 'after' },
                    { pattern: 'src/layouts/**', group: 'internal', position: 'after' },
                    { pattern: 'src/components/**', group: 'internal', position: 'after' },
                    { pattern: 'src/pages/**', group: 'internal', position: 'after' },
                    { pattern: 'src/assets/**', group: 'internal', position: 'after' },
                    { pattern: 'src/styles/**', group: 'internal', position: 'after' },
                ],
                pathGroupsExcludedImportTypes: ['react'],
                alphabetize: { order: 'asc', caseInsensitive: true },
                'newlines-between': 'never',
            }],
        }
    },
])