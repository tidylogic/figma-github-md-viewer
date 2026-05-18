#!/usr/bin/env bash
#
# 릴리스 자동화 스크립트.
#
# 사용법:
#   1. package.json 의 "version" 을 올리고 커밋한다
#      (예: npm version minor  또는  직접 수정 후 git commit)
#   2. npm run release
#
# 동작: 빌드 -> zip 패키징 -> git 태그 -> GitHub 릴리스 생성(zip 첨부)

set -euo pipefail

VERSION="$(node -p "require('./package.json').version")"
TAG="v${VERSION}"
ZIP="figma-github-md-viewer-${TAG}.zip"

echo "▶ 릴리스 준비: ${TAG}"

# 1. 작업 트리가 깨끗한지 확인 (버전 bump 커밋이 끝난 상태여야 함)
if [ -n "$(git status --porcelain)" ]; then
  echo "✗ 커밋되지 않은 변경사항이 있습니다. 먼저 커밋하세요." >&2
  exit 1
fi

# 2. 같은 태그가 이미 있으면 중단 (package.json 버전을 올려야 함)
if git rev-parse "${TAG}" >/dev/null 2>&1; then
  echo "✗ 태그 ${TAG} 가 이미 존재합니다. package.json 의 version 을 올리세요." >&2
  exit 1
fi

# 3. 빌드 (manifest.json + build/ 생성)
echo "▶ 빌드 중…"
npm run build

# 4. zip 패키징 (manifest.json 과 build/ 를 함께 묶음)
echo "▶ ${ZIP} 생성 중…"
rm -f "${ZIP}"
zip -r -q "${ZIP}" manifest.json build

# 5. 태그 생성 및 푸시
echo "▶ 태그 푸시 중…"
git tag "${TAG}"
git push origin HEAD
git push origin "${TAG}"

# 6. GitHub 릴리스 생성 (zip 첨부)
echo "▶ GitHub 릴리스 생성 중…"
gh release create "${TAG}" \
  --title "${TAG}" \
  --notes "$(cat <<EOF
Figma 플러그인 ${TAG}.

## 설치 (빌드 불필요)
1. 아래 \`${ZIP}\` 다운로드 후 압축 해제
2. Figma 데스크톱 앱 → \`Plugins → Development → Import plugin from manifest…\`
3. 압축 푼 폴더의 \`manifest.json\` 선택
EOF
)" \
  "${ZIP}"

# 7. 정리
rm -f "${ZIP}"

echo "✓ 완료: $(gh release view "${TAG}" --json url --jq .url)"
