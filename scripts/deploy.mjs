// Publishes the built site (dist/) to GitHub Pages.
//
//   npm run build
//   npm run deploy
//
// It keeps a copy of the Pages repository in .deploy/ (ignored by git), replaces
// its contents with dist/, commits, and pushes. The first push opens a GitHub
// sign-in window. The site updates a minute or two after the push.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO = process.env.PAGES_REPO ?? 'https://github.com/hari20050803-beep/hari20050803-beep.github.io.git';
const BRANCH = 'main';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const work = path.join(root, '.deploy');

const run = (args, options = {}) => execFileSync('git', args, { cwd: work, stdio: 'inherit', ...options });
const read = (args) => {
  try {
    return execFileSync('git', args, { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

if (!existsSync(path.join(work, '.git'))) {
  execFileSync('git', ['clone', REPO, work], { stdio: 'inherit' });
}

// A brand-new repository has no branch yet; otherwise catch up with it first.
if (read(['ls-remote', '--heads', 'origin', BRANCH])) {
  run(['fetch', 'origin', BRANCH]);
  run(['checkout', '-B', BRANCH, `origin/${BRANCH}`]);
} else {
  run(['checkout', '-B', BRANCH]);
}

// Keep files byte-for-byte as built, whatever the computer's line-ending setting.
run(['config', 'core.autocrlf', 'false']);

// Commits are made with GitHub's private no-reply address unless git already has an identity.
if (!read(['config', 'user.email'])) {
  run(['config', 'user.name', 'Harenthira Ravishangar']);
  run(['config', 'user.email', 'hari20050803-beep@users.noreply.github.com']);
}

for (const entry of readdirSync(work)) {
  if (entry !== '.git') rmSync(path.join(work, entry), { recursive: true, force: true });
}
cpSync(dist, work, { recursive: true });
// Serve every file as-is, without GitHub's Jekyll processing.
writeFileSync(path.join(work, '.nojekyll'), '');

run(['add', '--all']);
if (!read(['status', '--porcelain'])) {
  console.log('Nothing has changed since the last deploy.');
  process.exit(0);
}

run(['commit', '--quiet', '-m', `Publish site ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`]);
run(['push', '-u', 'origin', BRANCH]);
console.log('\nPushed. The site updates at https://hari20050803-beep.github.io/ in a minute or two.');
