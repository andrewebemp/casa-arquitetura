#!/usr/bin/env node

/**
 * version-bump.js - Automated semantic version bumping
 *
 * Analyzes conventional commits since last git tag,
 * recommends version bump, updates package.json,
 * generates CHANGELOG entry, and creates git tag.
 *
 * Usage:
 *   node scripts/version-bump.js              # Interactive (auto-detect)
 *   node scripts/version-bump.js --patch      # Force patch bump
 *   node scripts/version-bump.js --minor      # Force minor bump
 *   node scripts/version-bump.js --major      # Force major bump
 *   node scripts/version-bump.js --dry-run    # Preview without changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

// --- Helpers ---

function exec(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function getLastTag() {
  return exec('git describe --tags --abbrev=0 2>/dev/null') || null;
}

function getCommitsSinceTag(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const log = exec(`git log ${range} --pretty=format:"%H|||%s|||%b|||%an|||%aI" --no-merges`);
  if (!log) return [];

  return log.split('\n').filter(Boolean).map(line => {
    const [hash, subject, body, author, date] = line.split('|||');
    return { hash: hash.slice(0, 8), subject, body: body || '', author, date };
  });
}

function parseConventionalCommit(subject) {
  // feat!: ... or fix!: ... (breaking)
  const breakingMatch = subject.match(/^(\w+)!\s*:\s*(.+)/);
  if (breakingMatch) {
    return { type: breakingMatch[1], description: breakingMatch[2], breaking: true };
  }

  // feat: ..., fix: ..., docs: ..., etc.
  const match = subject.match(/^(\w+)(?:\(.+?\))?\s*:\s*(.+)/);
  if (match) {
    return { type: match[1], description: match[2], breaking: false };
  }

  return { type: 'other', description: subject, breaking: false };
}

function detectBumpType(commits) {
  let hasBreaking = false;
  let hasFeature = false;
  let hasFix = false;

  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.subject);

    // Check body for BREAKING CHANGE:
    if (parsed.breaking || commit.body.includes('BREAKING CHANGE:') || commit.body.includes('BREAKING:')) {
      hasBreaking = true;
    }

    if (['feat', 'feature'].includes(parsed.type)) hasFeature = true;
    if (['fix', 'bugfix', 'hotfix'].includes(parsed.type)) hasFix = true;
  }

  if (hasBreaking) return 'major';
  if (hasFeature) return 'minor';
  if (hasFix) return 'patch';
  return 'patch'; // default
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: return current;
  }
}

function groupCommits(commits) {
  const groups = {
    breaking: [],
    feat: [],
    fix: [],
    docs: [],
    refactor: [],
    test: [],
    chore: [],
    other: []
  };

  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.subject);

    if (parsed.breaking || commit.body.includes('BREAKING CHANGE:')) {
      groups.breaking.push({ ...parsed, hash: commit.hash });
    }

    const key = groups[parsed.type] !== undefined ? parsed.type : 'other';
    groups[key].push({ ...parsed, hash: commit.hash });
  }

  return groups;
}

function generateChangelogEntry(version, groups, date) {
  const sections = [];

  const sectionMap = {
    breaking: '### BREAKING CHANGES',
    feat: '### Adicionado',
    fix: '### Corrigido',
    docs: '### Documentação',
    refactor: '### Refatorado',
    test: '### Testes',
    chore: '### Manutenção',
    other: '### Outros'
  };

  for (const [key, title] of Object.entries(sectionMap)) {
    if (groups[key] && groups[key].length > 0) {
      sections.push(title);
      for (const item of groups[key]) {
        sections.push(`- ${item.description} (\`${item.hash}\`)`);
      }
      sections.push('');
    }
  }

  return `## [${version}] - ${date}\n\n${sections.join('\n')}`;
}

function updateChangelog(newEntry, newVersion, prevVersion) {
  let content = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

  // Insert new entry after the header section
  const insertPoint = content.indexOf('\n## [');
  if (insertPoint !== -1) {
    content = content.slice(0, insertPoint) + '\n' + newEntry + content.slice(insertPoint);
  } else {
    // No existing entries, append
    content += '\n' + newEntry;
  }

  // Add comparison link at the bottom
  const compareLink = `[${newVersion}]: https://github.com/andrewebemp/casa-arquitetura/compare/v${prevVersion}...v${newVersion}`;
  if (!content.includes(`[${newVersion}]:`)) {
    content = content.trimEnd() + '\n' + compareLink + '\n';
  }

  fs.writeFileSync(CHANGELOG_PATH, content);
}

function updateVersionInfo(newVersion) {
  const versionInfoPath = path.join(ROOT, '.aios', 'version-info.json');
  if (!fs.existsSync(versionInfoPath)) return;

  const info = JSON.parse(fs.readFileSync(versionInfoPath, 'utf-8'));
  info.previous_version = info.current_version;
  info.current_version = newVersion;
  info.last_updated = new Date().toISOString();
  fs.writeFileSync(versionInfoPath, JSON.stringify(info, null, 2));
}

function validateDocsUpdated() {
  const docsFiles = ['README.md', 'guia-pratico.md', '.claude/CLAUDE.md', 'CHANGELOG.md'];
  const changedFiles = exec('git diff --cached --name-only').split('\n').filter(Boolean);

  const missingDocs = docsFiles.filter(doc => !changedFiles.includes(doc));

  if (missingDocs.length > 0) {
    console.warn('\n\u26a0\ufe0f  Documentos NAO atualizados neste release:');
    missingDocs.forEach(doc => console.warn(`   - ${doc}`));
    console.warn('\n   Considere atualizar antes de finalizar o release.');
    console.warn('   Use --force para ignorar este aviso.\n');

    if (!process.argv.includes('--force')) {
      return false;
    }
  }
  return true;
}

// --- Main ---

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceType = ['--major', '--minor', '--patch'].find(a => args.includes(a))?.replace('--', '') || null;

  // Read current version
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf-8'));
  const currentVersion = pkg.version;
  console.log(`\n📦 Versão atual: ${currentVersion}`);

  // Get last tag
  const lastTag = getLastTag();
  console.log(`🏷️  Última tag: ${lastTag || '(nenhuma)'}`);

  // Get commits
  const commits = getCommitsSinceTag(lastTag);
  if (commits.length === 0) {
    console.log('\n⚠️  Nenhum commit novo desde a última tag. Nada a fazer.');
    process.exit(0);
  }
  console.log(`📝 Commits desde última tag: ${commits.length}`);

  // Detect bump type
  const detectedType = detectBumpType(commits);
  const bumpType = forceType || detectedType;
  const newVersion = bumpVersion(currentVersion, bumpType);

  console.log(`\n🔍 Tipo detectado: ${detectedType}${forceType ? ` (forçado: ${forceType})` : ''}`);
  console.log(`🚀 Nova versão: ${currentVersion} → ${newVersion}\n`);

  // Group and display commits
  const groups = groupCommits(commits);

  const labels = {
    breaking: '💥 Breaking Changes',
    feat: '✨ Features',
    fix: '🐛 Fixes',
    docs: '📚 Docs',
    refactor: '♻️  Refactor',
    test: '🧪 Tests',
    chore: '🔧 Chore',
    other: '📌 Other'
  };

  for (const [key, label] of Object.entries(labels)) {
    if (groups[key] && groups[key].length > 0) {
      console.log(`  ${label}:`);
      for (const item of groups[key]) {
        console.log(`    - ${item.description} (${item.hash})`);
      }
    }
  }

  if (dryRun) {
    console.log('\n🔸 Dry run - nenhuma alteração feita.');
    process.exit(0);
  }

  // Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`\n✅ package.json atualizado para ${newVersion}`);

  // Update CHANGELOG.md
  const today = new Date().toISOString().split('T')[0];
  const entry = generateChangelogEntry(newVersion, groups, today);
  updateChangelog(entry, newVersion, currentVersion);
  console.log(`✅ CHANGELOG.md atualizado`);

  // Update version-info.json if exists
  updateVersionInfo(newVersion);

  // Validate docs updated (advisory)
  validateDocsUpdated();

  // Git operations
  console.log(`\n📌 Para finalizar a release, execute:`);
  console.log(`   git add package.json CHANGELOG.md`);
  console.log(`   git commit -m "chore(release): v${newVersion}"`);
  console.log(`   git tag -a v${newVersion} -m "Release v${newVersion}"`);
  console.log(`   git push && git push --tags`);
}

main();
