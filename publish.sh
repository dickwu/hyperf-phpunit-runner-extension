#!/bin/bash
set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# ─── Pre-flight checks ───────────────────────────────────────────────
echo -e "\n${YELLOW}Running pre-flight checks...${NC}\n"

# Check required tools
command -v node >/dev/null  || error "node is not installed"
command -v npm  >/dev/null  || error "npm is not installed"
command -v gh   >/dev/null  || error "gh CLI is not installed"
command -v git  >/dev/null  || error "git is not installed"
info "All required tools are installed"

# Check we're on main/master branch
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
  error "You must be on 'main' or 'master' branch (currently on '$BRANCH')"
fi
info "On branch: $BRANCH"

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  error "You have uncommitted changes. Please commit or stash them first."
fi
info "Working tree is clean"

# Check remote is up to date
git fetch origin "$BRANCH" --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")
if [ "$LOCAL" != "$REMOTE" ]; then
  error "Local branch is not in sync with origin. Please pull/push first."
fi
info "In sync with origin/$BRANCH"

# ─── Build & verify ──────────────────────────────────────────────────
echo -e "\n${YELLOW}Building extension...${NC}\n"

npm ci --silent
info "Dependencies installed"

npm run compile
info "TypeScript compiled successfully"

npx @vscode/vsce package --allow-missing-repository
VSIX_FILE=$(ls -1 *.vsix 2>/dev/null | head -1)
if [ -z "$VSIX_FILE" ]; then
  error "Failed to create .vsix package"
fi
info "Packaged: $VSIX_FILE"

# ─── Version bump ────────────────────────────────────────────────────
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "\n${YELLOW}Current version: v${CURRENT_VERSION}${NC}"
echo ""
echo "  1) patch  (e.g. 0.0.11 → 0.0.12)"
echo "  2) minor  (e.g. 0.0.11 → 0.1.0)"
echo "  3) major  (e.g. 0.0.11 → 1.0.0)"
echo "  4) custom"
echo ""
read -rp "Select bump type [1-4]: " BUMP_CHOICE

case "$BUMP_CHOICE" in
  1) NEW_VERSION=$(npm version patch --no-git-tag-version) ;;
  2) NEW_VERSION=$(npm version minor --no-git-tag-version) ;;
  3) NEW_VERSION=$(npm version major --no-git-tag-version) ;;
  4)
    read -rp "Enter new version (without v prefix): " CUSTOM_VERSION
    NEW_VERSION=$(npm version "$CUSTOM_VERSION" --no-git-tag-version)
    ;;
  *) error "Invalid choice" ;;
esac

info "Version bumped to $NEW_VERSION"

# ─── Commit, tag & push ──────────────────────────────────────────────
echo -e "\n${YELLOW}Pushing to GitHub...${NC}\n"

git add package.json package-lock.json
git commit -m "release: $NEW_VERSION"
info "Committed version bump"

git tag "$NEW_VERSION"
info "Created tag $NEW_VERSION"

git push origin "$BRANCH"
git push origin "$NEW_VERSION"
info "Pushed to origin"

# ─── Create GitHub Release ────────────────────────────────────────────
echo -e "\n${YELLOW}Creating GitHub Release...${NC}\n"

gh release create "$NEW_VERSION" \
  --title "$NEW_VERSION" \
  --generate-notes
info "GitHub Release created — CI will auto-publish to Open VSX"

# ─── Cleanup ──────────────────────────────────────────────────────────
rm -f *.vsix

echo -e "\n${GREEN}🚀 Done! $NEW_VERSION released successfully.${NC}"
echo -e "   Open VSX publish will be handled by GitHub Actions.\n"
