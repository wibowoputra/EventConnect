import { copyFile, mkdir, readdir, stat, rm } from 'fs/promises';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  await mkdir(dest, { recursive: true });

  // Read source directory
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      await copyDir(srcPath, destPath);
    } else {
      // Copy files
      await copyFile(srcPath, destPath);
    }
  }
}

async function removeDirIfExists(dirPath) {
  try {
    await stat(dirPath);
    console.log(`Removing directory: ${dirPath}`);
    await rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Directory does not exist: ${dirPath}`);
    } else {
      throw err;
    }
  }
}

async function build() {
  try {
    // Clean the dist directory
    console.log('Cleaning dist directory...');
    const serverDir = resolve(__dirname, 'dist/server');
    const sharedDir = resolve(__dirname, 'dist/shared');
    
    await removeDirIfExists(serverDir);
    await removeDirIfExists(sharedDir);

    // Create necessary directories
    console.log('Creating directories...');
    await mkdir(serverDir, { recursive: true });
    await mkdir(sharedDir, { recursive: true });

    // Compile TypeScript files
    console.log('Compiling TypeScript files...');
    execSync('tsc -p tsconfig.server.json', { stdio: 'inherit' });

    // Copy shared directory
    const sharedPath = resolve(__dirname, 'shared');
    try {
      await stat(sharedPath);
      console.log('Copying shared directory...');
      await copyDir(sharedPath, sharedDir);
    } catch (err) {
      console.log('Shared directory not found, skipping...');
    }

    // Verify the build
    console.log('Verifying build...');
    const serverFiles = await readdir(serverDir);
    console.log('Server files compiled:', serverFiles);

    console.log('Server build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build(); 