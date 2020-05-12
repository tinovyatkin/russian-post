'use strict';

module.exports = {
  '*.ts': [
    'eslint --fix --quiet -f visualstudio',
    'prettier --write',
    'node -r dotenv/config --max_old_space_size=2048 --expose-gc node_modules/jest-cli/bin/jest --maxWorkers=2 --silent --forceExit --errorOnDeprecated --ci --bail --findRelatedTests',
  ],
  '.env': ['git rm'],
  '*.{yaml,yml}': ['yamllint', 'prettier --write'],
  '*.{md,json}': ['prettier --write'],
  '**/package.json': filenames => [
    'yarn check --integrity',
    ...filenames.map(file => `npmPkgJsonLint ${file}`),
    'prettier-package-json --write',
  ],
  '.codecov.yml': () =>
    'curl -f --silent --data-binary @.codecov.yml https://codecov.io/validate',
};
