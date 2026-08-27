#!/usr/bin/env node
/**
 * Build script for Module Federation deployments
 *
 * Supports two deployment modes:
 * 1. bundle - Creates self-contained bundle (shell + remote) for independent deployment
 * 2. shared - Creates separate builds for shared-shell deployment
 *
 * Usage:
 *   node build-deployment.mjs bundle umdzidzisi-admin
 *   node build-deployment.mjs shared umdzidzisi-admin
 */

import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '../..');

// Map of remote names to their source project paths
const remoteConfig = {
  'umdzidzisi-website': 'umdzidzisi/website',
  'umdzidzisi-admin': 'umdzidzisi/admin',
  'umdzidzisi-client': 'umdzidzisi/client',
  'umtengesi-website': 'umtengesi/website',
  'umtengesi-admin': 'umtengesi/admin',
  'umtengesi-client': 'umtengesi/client',
  'insurance-website': 'insurance/website',
  'insurance-admin': 'insurance/admin',
  'insurance-client': 'insurance/client'
};

function buildBundle(remoteName) {
  console.log(`\n📦 Building bundle deployment for: ${remoteName}\n`);

  if (!remoteConfig[remoteName]) {
    console.error(`❌ Unknown remote: ${remoteName}`);
    console.error(`Available remotes: ${Object.keys(remoteConfig).join(', ')}`);
    process.exit(1);
  }

  const remotePath = remoteConfig[remoteName];
  const outputDir = join(workspaceRoot, 'dist/bundles', remoteName);

  // Clean output directory
  if (existsSync(outputDir)) {
    console.log(`🧹 Cleaning ${outputDir}`);
    rmSync(outputDir, { recursive: true, force: true });
  }

  // Build shell and remote
  console.log(`🔨 Building shell and ${remoteName}...`);
  try {
    execSync(`npm exec nx run-many -- -t build -p shell,${remoteName} --configuration=production`, {
      cwd: workspaceRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`❌ Build failed`);
    process.exit(1);
  }

  // Create bundle directory
  mkdirSync(outputDir, { recursive: true });

  // Copy shell build to root of bundle
  const shellSrc = join(workspaceRoot, 'dist/apps/shell/browser');
  if (!existsSync(shellSrc)) {
    console.error(`❌ Shell build not found at: ${shellSrc}`);
    process.exit(1);
  }

  console.log(`📋 Copying shell from ${shellSrc} to ${outputDir}`);
  cpSync(shellSrc, outputDir, { recursive: true });

  // Copy remote build to subdirectory
  const remoteSrc = join(workspaceRoot, `dist/apps/${remotePath}/browser`);
  const remoteDest = join(outputDir, remoteName);

  if (!existsSync(remoteSrc)) {
    console.error(`❌ Remote build not found at: ${remoteSrc}`);
    process.exit(1);
  }

  console.log(`📋 Copying ${remoteName} from ${remoteSrc} to ${remoteDest}`);
  cpSync(remoteSrc, remoteDest, { recursive: true });

  console.log(`\n✅ Bundle deployment created at: ${outputDir}`);
  console.log(`\n📦 Bundle structure:`);
  console.log(`   ${outputDir}/`);
  console.log(`   ├── index.html           (shell)`);
  console.log(`   ├── main-*.js            (shell bundles)`);
  console.log(`   └── ${remoteName}/`);
  console.log(`       ├── remoteEntry.json`);
  console.log(`       └── *.js`);
  console.log(`\n🚀 Deploy with: rsync -avz dist/bundles/${remoteName}/ user@server:/var/www/\n`);
}

function buildShared(remoteName) {
  console.log(`\n🔧 Building shared deployment for: ${remoteName}\n`);

  if (!remoteConfig[remoteName]) {
    console.error(`❌ Unknown remote: ${remoteName}`);
    console.error(`Available remotes: ${Object.keys(remoteConfig).join(', ')}`);
    process.exit(1);
  }

  const outputDir = join(workspaceRoot, 'dist/shared');

  // Build remote (shell can be built separately or already exists)
  console.log(`🔨 Building ${remoteName}...`);
  try {
    execSync(`npm exec nx build ${remoteName} -- --configuration=production`, {
      cwd: workspaceRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`❌ Build failed`);
    process.exit(1);
  }

  const remotePath = remoteConfig[remoteName];
  const remoteSrc = join(workspaceRoot, `dist/apps/${remotePath}/browser`);
  const remoteDest = join(outputDir, remoteName);

  if (!existsSync(remoteSrc)) {
    console.error(`❌ Remote build not found at: ${remoteSrc}`);
    process.exit(1);
  }

  // Clean and create output directory
  if (existsSync(remoteDest)) {
    rmSync(remoteDest, { recursive: true, force: true });
  }
  mkdirSync(remoteDest, { recursive: true });

  console.log(`📋 Copying ${remoteName} to ${remoteDest}`);
  cpSync(remoteSrc, remoteDest, { recursive: true });

  console.log(`\n✅ Shared deployment build created for ${remoteName}`);
  console.log(`   Location: ${remoteDest}`);
  console.log(`\n💡 Don't forget to build the shell separately:`);
  console.log(`   npm run build:shared:shell`);
  console.log(`\n🚀 Deploy with:`);
  console.log(`   rsync -avz dist/shared/${remoteName}/ user@server:/var/www/${remoteName}/\n`);
}

function buildSharedShell() {
  console.log(`\n🔧 Building shared shell\n`);

  const outputDir = join(workspaceRoot, 'dist/shared');

  // Build shell
  console.log(`🔨 Building shell...`);
  try {
    execSync(`npm exec nx build shell -- --configuration=production`, {
      cwd: workspaceRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`❌ Build failed`);
    process.exit(1);
  }

  const shellSrc = join(workspaceRoot, 'dist/apps/shell/browser');
  const shellDest = join(outputDir, 'shell');

  if (!existsSync(shellSrc)) {
    console.error(`❌ Shell build not found at: ${shellSrc}`);
    process.exit(1);
  }

  // Clean and create output directory
  if (existsSync(shellDest)) {
    rmSync(shellDest, { recursive: true, force: true });
  }
  mkdirSync(shellDest, { recursive: true });

  console.log(`📋 Copying shell to ${shellDest}`);
  cpSync(shellSrc, shellDest, { recursive: true });

  console.log(`\n✅ Shared shell build created`);
  console.log(`   Location: ${shellDest}`);
  console.log(`\n🚀 Deploy with:`);
  console.log(`   rsync -avz dist/shared/shell/ user@server:/var/www/\n`);
}

// Main execution
const mode = process.argv[2];
const remoteName = process.argv[3];

if (!mode || (mode !== 'bundle' && mode !== 'shared')) {
  console.error('Usage: node build-deployment.mjs <mode> <remote-name>');
  console.error('       node build-deployment.mjs shared-shell');
  console.error('');
  console.error('Modes:');
  console.error('  bundle       - Create self-contained bundle (shell + remote)');
  console.error('  shared       - Create separate build for shared-shell deployment');
  console.error('  shared-shell - Build only the shell for shared deployment');
  console.error('');
  console.error('Available remotes:', Object.keys(remoteConfig).join(', '));
  process.exit(1);
}

if (mode === 'shared-shell') {
  buildSharedShell();
} else if (!remoteName) {
  console.error('Error: remote-name is required');
  console.error('Available remotes:', Object.keys(remoteConfig).join(', '));
  process.exit(1);
} else if (mode === 'bundle') {
  buildBundle(remoteName);
} else if (mode === 'shared') {
  buildShared(remoteName);
}
