const fs = require('fs-extra-promise');
const path = require('path');
const rmrf = require('rmrf-promise');
const omit = require('lodash/omit');

(async function() {
  try {

    const buildDir = path.resolve(__dirname, '..', 'dist-native');
    const tempDir = path.resolve(__dirname, '..', 'temp');

    await rmrf(tempDir);
    await rmrf(buildDir);

    await fs.ensureDirAsync(tempDir);
    await fs.ensureDirAsync(buildDir);

    const filesToCopy = [
      'dist',
      'public',
      'index.js'
    ];

    for(const file of filesToCopy) {
      await fs.copyAsync(file, path.join(tempDir, file));
    }

    const packageJSON = await fs.readJsonAsync('package.json');

    const newPackageJSON = omit(packageJSON, [
      'build',
      'devDependencies'
    ]);

    await fs.writeJsonAsync(path.join(tempDir, 'package.json'), newPackageJSON);

  } catch(err) {
    console.error(err);
  }
})();
