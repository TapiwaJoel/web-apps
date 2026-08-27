module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'shell',
        'umdzidzisi-website',
        'umdzidzisi-admin',
        'umdzidzisi-client',
        'umtengesi-website',
        'umtengesi-admin',
        'umtengesi-client',
        'insurance',
        'insurance-website',
        'insurance-admin',
        'insurance-client',
        'api',
        'ui',
        'util',
        'models',
        'deps',
        'ci',
        'workspace',
      ],
    ],
  },
};
