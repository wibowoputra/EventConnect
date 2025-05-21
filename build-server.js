import { execSync } from 'child_process';
import { copyFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure dist/server directory exists
mkdirSync(resolve(__dirname, 'dist/server'), { recursive: true });

// Copy all server files to dist/server
execSync('cp -r server/* dist/server/', { stdio: 'inherit' });

// Copy shared directory if it exists
if (require('fs').existsSync('shared')) {
  mkdirSync(resolve(__dirname, 'dist/shared'), { recursive: true });
  execSync('cp -r shared/* dist/shared/', { stdio: 'inherit' });
}

console.log('Server build completed successfully!'); 