#!/bin/bash
# release.sh — Automacao completa de release
# Uso: bash scripts/release.sh [--minor|--major|--patch]

set -euo pipefail

BUMP_TYPE="${1:---minor}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== AIOS Release Automation ==="

# 1. Verificar working tree limpa (exceto staged changes)
if [[ -n "$(git -C "$ROOT" status --porcelain | grep -v '^[MADRC]' || true)" ]]; then
  echo "Working tree com alteracoes nao staged. Commite ou stash primeiro."
  exit 1
fi

# 2. Rodar version-bump (atualiza package.json + CHANGELOG.md)
echo "Bumping versao..."
node "$ROOT/scripts/version-bump.js" "$BUMP_TYPE" --force

# 3. Extrair nova versao
NEW_VERSION=$(node -e "console.log(require('$ROOT/package.json').version)")
echo "Nova versao: v$NEW_VERSION"

# 4. Verificar docs obrigatorios foram alterados
REQUIRED_DOCS=("README.md" "guia-pratico.md" ".claude/CLAUDE.md")
MISSING=()
for doc in "${REQUIRED_DOCS[@]}"; do
  if ! git -C "$ROOT" diff --name-only HEAD 2>/dev/null | grep -q "$doc"; then
    MISSING+=("$doc")
  fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo ""
  echo "Documentos possivelmente nao atualizados:"
  for m in "${MISSING[@]}"; do echo "   - $m"; done
  echo ""
  read -p "Continuar mesmo assim? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelado."
    exit 1
  fi
fi

# 5. Stage, commit e tag
echo "Staging e committing..."
git -C "$ROOT" add package.json CHANGELOG.md README.md guia-pratico.md .claude/CLAUDE.md 2>/dev/null || true
git -C "$ROOT" add -A
git -C "$ROOT" commit -m "chore(release): v$NEW_VERSION"
git -C "$ROOT" tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo ""
echo "Release v$NEW_VERSION preparado localmente."
echo ""
echo "Para publicar no GitHub:"
echo "   git push && git push --tags"
echo ""
echo "Para criar GitHub Release:"
echo "   gh release create v$NEW_VERSION --title 'v$NEW_VERSION' --notes-from-tag"
