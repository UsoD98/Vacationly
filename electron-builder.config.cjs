const { loadElectronEnv } = require('./electron/env.cjs');

loadElectronEnv('production');

const updateUrl = process.env.VACATIONLY_UPDATE_URL?.trim();

const publish = updateUrl
  ? [
      {
        provider: 'generic',
        url: updateUrl.endsWith('/') ? updateUrl : `${updateUrl}/`,
      },
    ]
  : undefined;

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.vacationly.app',
  productName: 'Vacationly',
  artifactName: '${productName}-${version}-${arch}.${ext}',
  directories: {
    output: 'release',
    buildResources: 'electron/assets',
  },
  files: ['dist/**/*', 'electron/**/*', 'package.json'],
  extraMetadata: {
    main: 'electron/main.cjs',
  },
  win: {
    target: ['portable'],
    icon: 'app.ico',
  },
  ...(publish ? { publish } : {}),
};

