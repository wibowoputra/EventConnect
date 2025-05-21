import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

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

async function build() {
  try {
    // Copy server files
    await copyDir(
      resolve(__dirname, 'server'),
      resolve(__dirname, 'dist/server')
    );

    // Copy shared directory if it exists
    const sharedPath = resolve(__dirname, 'shared');
    try {
      await stat(sharedPath);
      await copyDir(
        sharedPath,
        resolve(__dirname, 'dist/shared')
      );
    } catch (err) {
      // Shared directory doesn't exist, skip it
      console.log('Shared directory not found, skipping...');
    }

    console.log('Server build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build(); 