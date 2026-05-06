const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

function loadElectronEnv(mode = 'development') {
  const projectRoot = path.join(__dirname, '..');
  const envFiles = [path.join(projectRoot, '.env'), path.join(projectRoot, `.env.${mode}`)];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile, override: false });
    }
  }
}

module.exports = { loadElectronEnv };

