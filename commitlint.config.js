export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Warn (not error) so scopes outside the list don't hard-block commits
    'scope-enum': [
      1,
      'always',
      ['core', 'frontend', 'shared', 'ci', 'deps', 'release'],
    ],
  },
}
