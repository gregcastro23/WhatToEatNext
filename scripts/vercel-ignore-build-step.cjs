/**
 * Vercel Ignored Build Step Filter
 * 
 * Exit code 0: SKIP / CANCEL build (no CPU minutes charged)
 * Exit code 1: PROCEED with build (changes detected in frontend paths)
 */

const { execSync } = require('child_process');

console.log('=======================================================');
console.log('🔍 Alchm.kitchen Vercel Build Step Filter');
console.log('=======================================================');

const commitMsg = process.env.VERCEL_GIT_COMMIT_MESSAGE || (() => {
  try {
    return execSync('git log -1 --pretty=%B', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
})();

const commitRef = process.env.VERCEL_GIT_COMMIT_REF || (() => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
})();

const prevSha = process.env.VERCEL_GIT_PREVIOUS_SHA || '';
const currSha = process.env.VERCEL_GIT_COMMIT_SHA || (() => {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
})();

const vercelEnv = process.env.VERCEL_ENV || 'development';

console.log(`📌 Branch: ${commitRef}`);
console.log(`📌 Environment: ${vercelEnv}`);
console.log(`📌 Current SHA: ${currSha || 'unknown'}`);
console.log(`📌 Previous Deployed SHA: ${prevSha || 'none'}`);

// 1. Check for explicit skip directives
if (/\[(skip[ -]vercel|skip[ -]ci|no[ -]build|skip[ -]build)\]/i.test(commitMsg)) {
  console.log(`⏩ [SKIP] Explicit skip directive detected in commit message: "${commitMsg}"`);
  console.log('🛑 Cancelling Vercel build (0 CPU minutes used).');
  process.exit(0);
}

// 2. Frontend-critical paths
const FRONTEND_PATHS = [
  'src',
  'public',
  'next.config.js',
  'package.json',
  'bun.lock',
  'vercel.json',
  'tailwind.config.js',
  'postcss.config.mjs',
  'tsconfig.json',
  '.vercelignore',
  'components.json',
  'scripts/check-route-sizes.cjs',
  'scripts/check-version.cjs',
  'scripts/vercel-ignore-build-step.cjs',
  'scripts/vercel-ignore-build-step.sh',
];

// 3. Determine git diff target
let diffTarget = '';

if (prevSha) {
  try {
    execSync(`git cat-file -e ${prevSha}^{commit}`, { stdio: 'ignore' });
    console.log(`🔎 Evaluating diff against previous deployment (${prevSha})...`);
    diffTarget = `${prevSha} ${currSha || 'HEAD'}`;
  } catch {
    // previous SHA not available in shallow history
  }
}

if (!diffTarget) {
  try {
    execSync('git rev-parse --verify HEAD^', { stdio: 'ignore' });
    console.log('🔎 Evaluating diff against parent commit (HEAD^)...');
    diffTarget = 'HEAD^ HEAD';
  } catch {
    // initial commit or shallow clone
  }
}

if (!diffTarget) {
  console.log('⚠️ [FALLBACK] Unable to determine git parent or previous deployment SHA.');
  console.log('✅ Defaulting to proceed with build safely.');
  process.exit(1);
}

// 4. Check for changes in frontend paths
try {
  const pathArgs = FRONTEND_PATHS.join(' ');
  const diffOutput = execSync(`git diff --name-only ${diffTarget} -- ${pathArgs}`, {
    stdio: ['ignore', 'pipe', 'ignore'],
  }).toString().trim();

  if (diffOutput.length === 0) {
    console.log('🛑 [SKIP] No changes detected in frontend paths:');
    try {
      const allChanged = execSync(`git diff --name-only ${diffTarget}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString().trim().split('\n').slice(0, 15);
      allChanged.forEach(file => console.log(`   - ${file}`));
    } catch {}
    console.log('🛑 Cancelling Vercel build (0 CPU minutes used).');
    process.exit(0);
  } else {
    console.log('✅ [BUILD] Frontend changes detected:');
    diffOutput.split('\n').slice(0, 15).forEach(file => console.log(`   + ${file}`));
    console.log('🚀 Proceeding with Vercel production build.');
    process.exit(1);
  }
} catch (err) {
  console.log('⚠️ [FALLBACK] Git diff command failed. Defaulting to proceed with build.');
  process.exit(1);
}
