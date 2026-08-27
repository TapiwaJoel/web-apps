import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'org',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'org',
          style: 'kebab-case',
        },
      ],
      // Enforce separate template and style files for Angular components
      'org/no-inline-template-style': [
        'error',
        {
          allowInlineTemplateMaxLength: 0,
          allowInlineStyles: false,
        },
      ],
      // Performance rules
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/no-pipe-impure': 'error',
      // Code quality rules
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      // Dependency injection rules
      '@angular-eslint/use-injectable-provided-in': 'error',
      '@angular-eslint/no-forward-ref': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // Template best practices
      '@angular-eslint/template/use-track-by-function': 'warn',
      '@angular-eslint/template/no-call-expression': 'warn',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
    },
  },
];
