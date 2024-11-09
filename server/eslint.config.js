import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import lintPrettier from 'eslint-config-prettier'

export default tseslint.config(
   { ignores: ['dist', 'node_modules', 'public'] },
   {
      extends: [
         js.configs.recommended,
         ...tseslint.configs.recommended,
         lintPrettier,
      ],
      files: ['**/*.{js,ts}'],
      languageOptions: {
         ecmaVersion: 2020,
         globals: globals.node,
      },
      plugins: {},
      rules: {
         'no-console': 'warn', // Warns for console usage, common for backend debugging
         'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignores unused variables that start with '_'
         'consistent-return': 'error', // Enforces consistent return statements in functions
         '@typescript-eslint/no-empty-interface': ['off'], // Allows empty interfaces if needed
      },
   }
)
