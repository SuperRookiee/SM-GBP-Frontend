import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import-x'
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
            indent: ['error', 4, {
                SwitchCase: 1,
                ignoredNodes: [
                    'TSTypeParameterInstantiation',
                    'TSUnionType',
                    'TSIntersectionType',
                ],
            }],
            'import/order': ['error', {
                groups: [
                    ['builtin', 'external'],
                    ['internal'],
                    ['parent', 'sibling', 'index'],
                ],
                pathGroups: [
                    // react / react-dom
                    { pattern: 'react', group: 'external', position: 'before' },
                    { pattern: 'react-dom', group: 'external', position: 'before' },
                    // 기타 외부 라이브러리
                    { pattern: '@tanstack/**', group: 'external', position: 'after' },
                    { pattern: 'axios', group: 'external', position: 'after' },
                    // 내부 모듈
                    { pattern: '@/apis/**', group: 'internal', position: 'before' },
                    { pattern: '@/constants/**', group: 'internal', position: 'before' },
                    { pattern: '@/stores/**', group: 'internal', position: 'before' },
                    { pattern: '@/hooks/**', group: 'internal', position: 'before' },
                    { pattern: '@/utils/**', group: 'internal', position: 'before' },
                    // UI / 구조 계층
                    { pattern: '@/interface/**', group: 'internal', position: 'after' },
                    { pattern: '@/types/**', group: 'internal', position: 'after' },
                    { pattern: '@/layouts/**', group: 'internal', position: 'after' },
                    { pattern: '@/components/**', group: 'internal', position: 'after' },
                    { pattern: '@/pages/**', group: 'internal', position: 'after' },
                    { pattern: '@/assets/**', group: 'internal', position: 'after' },
                    { pattern: '@/styles/**', group: 'internal', position: 'after' },
                    // Test
                    { pattern: '@/tests/**', group: 'parent', position: 'before' },
                ],
                pathGroupsExcludedImportTypes: ['react'],
                alphabetize: { order: 'asc', caseInsensitive: true },
                'newlines-between': 'never',
            }],
        }
    },
])