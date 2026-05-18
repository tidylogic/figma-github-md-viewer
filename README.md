# GitHub PRD Viewer (Figma Plugin)

Figma 안에서 디자인 옆에 GitHub private repo의 PRD markdown 문서를 띄워 보는 플러그인.

## 기능

- GitHub markdown 링크를 붙여넣으면 해당 문서를 렌더해서 보여줌
- private repo 지원 (GitHub Personal Access Token 사용, 토큰은 로컬에만 저장)
- 최근 본 문서 목록에서 빠르게 재선택
- 특정 h1을 고르면 그 섹션만 표시 (스크롤도 그 범위로 제한)
- PRD 안의 이미지 표시 (상대경로 이미지를 인증 fetch)
- 창 가로/세로 리사이즈 (크기 저장)
- Figma 라이트/다크 테마 자동 반영
- **read-only 동작**: 문서를 변경하는 API를 일절 호출하지 않아 편집 권한이
  없는(view-only) 계정에서도 사용 가능

## 개발 / 빌드

```bash
npm install
npm run build     # 1회 빌드 (manifest.json + build/ 생성)
npm run watch     # 변경 감지 빌드
```

## Figma에 설치

### 일반 사용자 (빌드 불필요)

1. [Releases](https://github.com/tidylogic/figma-github-md-viewer/releases)에서
   최신 `figma-github-md-viewer-vX.Y.Z.zip` 다운로드 후 압축 해제
2. Figma 데스크톱 앱 → `Plugins → Development → Import plugin from manifest…`
3. 압축 푼 폴더의 `manifest.json` 선택

### 개발자 (소스에서)

1. `npm run build` 실행
2. Figma 데스크톱 앱 → `Plugins → Development → Import plugin from manifest…`
3. 이 폴더의 `manifest.json` 선택

## 새 버전 릴리스

```bash
npm version minor      # package.json 버전 올리고 커밋 (patch/minor/major)
npm run release        # 빌드 -> zip -> 태그 -> GitHub 릴리스 생성
```

`npm run release`(`scripts/release.sh`)는 작업 트리가 깨끗한지 확인하고,
빌드 산출물을 zip으로 묶어 해당 태그의 GitHub Release에 첨부합니다.
`gh` CLI 로그인이 필요합니다.

## 사용법

1. 최초 실행 시 GitHub PAT 입력
   - fine-grained PAT 권장. 대상 repo에 **Contents: Read-only** 권한만 부여
   - 토큰은 `figma.clientStorage`(이 컴퓨터)에만 저장됨
2. PRD markdown 링크 붙여넣기
   - `https://github.com/{owner}/{repo}/blob/{branch}/{path}.md`
   - `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}.md`
3. h1 드롭다운에서 섹션을 고르면 그 부분만 표시
4. 우하단 모서리를 드래그해 창 크기 조절
5. GitHub 문서가 수정되면 "열기"를 다시 눌러 최신 내용 반영

## 구조

```
src/
  main.ts                 # 메인 스레드 (clientStorage, resize, showUI)
  ui.tsx                  # UI 진입점
  styles.ts               # 전체 CSS (--figma-color-* 테마 토큰)
  types.ts                # 공유 타입 / 메시지 핸들러 타입
  components/
    App.tsx               # 화면 전환
    SettingsView.tsx       # PAT 입력
    ViewerView.tsx         # 링크 입력 + 섹션 선택 + 렌더
    ResizeHandle.tsx       # 리사이즈 핸들
  lib/
    github.ts             # 링크 파싱, Contents API fetch
    markdown.ts           # 토큰화, h1 섹션 추출, 렌더, 이미지 처리
```

> 브랜치 이름은 단일 세그먼트(`main` 등)로 가정합니다. `feature/x`처럼 슬래시가
> 든 브랜치는 URL만으로 경로와 구분할 수 없습니다.
