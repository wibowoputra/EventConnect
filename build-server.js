import { copyFile, mkdir, readdir, stat, rm } from 'fs/promises';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

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

function compileTypeScript() {
  console.log('Compiling TypeScript files...');
  const configPath = resolve(__dirname, 'tsconfig.server.json');
  console.log('configPath...', configPath);

  // Read and parse the tsconfig file
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  console.log('configFile...', configFile);

  if (configFile.error) {
    throw new Error(`Failed to read tsconfig: ${configFile.error.messageText}`);
  }

  // Parse the config file content
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    dirname(configPath),
    undefined,
    configPath
  );

  console.log('parsedConfig...', parsedConfig);

  if (parsedConfig.errors && parsedConfig.errors.length > 0) {
    const errors = parsedConfig.errors.map(error => 
      ts.flattenDiagnosticMessageText(error.messageText, '\n')
    ).join('\n');
    throw new Error(`Failed to parse tsconfig: ${errors}`);
  }

  // Create the program with the parsed configuration
  const program = ts.createProgram(
    parsedConfig.fileNames,
    parsedConfig.options
  );

  console.log('Program created with files:', parsedConfig.fileNames);
  console.log('Compiler options:', parsedConfig.options);

  // Emit the program
  const emitResult = program.emit();

  // Get all diagnostics
  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  // Log all diagnostics
  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
    }
  });

  if (emitResult.emitSkipped) {
    throw new Error('TypeScript compilation failed');
  }

  console.log('TypeScript compilation completed successfully');
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
    compileTypeScript();

    // Copy shared directory
    const sharedPath = resolve(__dirname, 'shared');
    try {
      await stat(sharedPath);
      console.log('Copying shared directory...');
      console.log('dirname...', __dirname);
      console.log('sharedpath...', sharedPath);
      console.log('sharedir...', sharedDir);
      await copyDir(sharedPath, sharedDir);
    } catch (err) {
      console.log('Shared directory not found, skipping...');
    }

    // Copy package.json to dist/server for Vercel
    console.log('Copying package.json to dist/server...');
    console.log('dirname...', __dirname);
    console.log('serverdir...', serverDir);
    await copyFile(
      resolve(__dirname, 'package.json'),
      resolve(serverDir, 'package.json')
    );

    // Create a server-specific package.json with type: module
    const serverPackageJson = {
      "type": "module",
      "dependencies": {
        "express": "^4.21.2",
        "bcrypt": "^6.0.0",
        "jsonwebtoken": "^9.0.2",
        "zod": "^3.24.4",
        "zod-validation-error": "^3.4.1"
      }
    };

    console.log('__dirname...', __dirname);
    console.log('serverdir...', serverDir);
    await copyFile(
      resolve(__dirname, 'package.json'),
      resolve(serverDir, 'package.json')
    );

    // Verify the build
    console.log('Verifying build...');
    const serverFiles = await readdir(serverDir);
    console.log('Server files compiled:', serverFiles);
    console.log('Server build completed successfully!');
    
    const sharedFiles = await readdir(sharedDir);
    console.log('Shared files compiled:', sharedFiles);
    console.log('Shared build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build(); 