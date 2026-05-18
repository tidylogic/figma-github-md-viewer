// GitHub 링크 파싱 + Contents API fetch.
// private repo는 raw 링크로 못 가져오므로 Contents API + PAT를 사용한다.

import { GitHubRef } from '../types'

const API_BASE = 'https://api.github.com'

/**
 * GitHub blob URL 또는 raw URL을 파싱한다.
 * - https://github.com/{owner}/{repo}/blob/{branch}/{path}
 * - https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
 *
 * 주의: 브랜치 이름은 단일 세그먼트로 가정한다(예: `main`).
 * `feature/x` 처럼 슬래시가 든 브랜치는 URL만으로 구분이 불가능하다.
 */
export function parseGitHubLink(input: string): GitHubRef {
  const trimmed = input.trim()
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('올바른 URL이 아닙니다.')
  }

  const segments = url.pathname
    .replace(/^\/+/, '')
    .split('/')
    .filter((s) => s.length > 0)
    .map((s) => decodeURIComponent(s))

  if (url.hostname === 'raw.githubusercontent.com') {
    const [owner, repo, branch, ...rest] = segments
    if (!owner || !repo || !branch || rest.length === 0) {
      throw new Error(
        'raw.githubusercontent.com 링크는 .../{owner}/{repo}/{branch}/{path} 형식이어야 합니다.'
      )
    }
    return { owner, repo, branch, path: rest.join('/') }
  }

  if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
    const [owner, repo, kind, branch, ...rest] = segments
    if (
      !owner ||
      !repo ||
      (kind !== 'blob' && kind !== 'raw') ||
      !branch ||
      rest.length === 0
    ) {
      throw new Error(
        'github.com 링크는 .../{owner}/{repo}/blob/{branch}/{path} 형식이어야 합니다.'
      )
    }
    return { owner, repo, branch, path: rest.join('/') }
  }

  throw new Error('github.com 또는 raw.githubusercontent.com 링크만 지원합니다.')
}

/** Contents API 요청. raw media type으로 파일 내용을 그대로 받는다. */
async function contentsRequest(ref: GitHubRef, pat: string): Promise<Response> {
  const encodedPath = ref.path
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/')
  const url =
    `${API_BASE}/repos/${encodeURIComponent(ref.owner)}/` +
    `${encodeURIComponent(ref.repo)}/contents/${encodedPath}` +
    `?ref=${encodeURIComponent(ref.branch)}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.raw',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      cache: 'no-store'
    })
  } catch {
    throw new Error('네트워크 오류로 GitHub에 연결하지 못했습니다.')
  }

  if (res.ok) {
    return res
  }
  if (res.status === 401) {
    throw new Error('PAT 인증에 실패했습니다 (401). 토큰을 다시 확인하세요.')
  }
  if (res.status === 404) {
    throw new Error(
      '파일을 찾을 수 없습니다 (404). 링크/브랜치/경로 또는 PAT의 repo 접근 권한을 확인하세요.'
    )
  }
  if (res.status === 403) {
    if (res.headers.get('x-ratelimit-remaining') === '0') {
      throw new Error('GitHub API 요청 한도를 초과했습니다 (403). 잠시 후 다시 시도하세요.')
    }
    throw new Error('접근이 거부되었습니다 (403). PAT 권한을 확인하세요.')
  }
  throw new Error(`GitHub 요청에 실패했습니다 (${res.status}).`)
}

/** markdown 파일의 원문 텍스트를 가져온다. */
export async function fetchMarkdown(ref: GitHubRef, pat: string): Promise<string> {
  const res = await contentsRequest(ref, pat)
  return await res.text()
}

/** 이미지 등 에셋을 data URL로 가져온다. */
export async function fetchAssetAsDataUrl(
  ref: GitHubRef,
  assetPath: string,
  pat: string
): Promise<string> {
  const res = await contentsRequest({ ...ref, path: assetPath }, pat)
  const blob = await res.blob()
  return await blobToDataUrl(blob)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('이미지를 변환하지 못했습니다.'))
    reader.readAsDataURL(blob)
  })
}

/** 경로의 디렉터리 부분을 반환한다. (`docs/prd/a.md` -> `docs/prd`) */
export function dirname(path: string): string {
  const i = path.lastIndexOf('/')
  return i === -1 ? '' : path.slice(0, i)
}

/**
 * markdown 내 상대 이미지 경로를 repo 루트 기준 경로로 정규화한다.
 * `/`로 시작하면 repo 루트 기준, 아니면 baseDir 기준으로 합친 뒤 `.`/`..`을 정리한다.
 */
export function resolveRepoPath(baseDir: string, relative: string): string {
  const combined = relative.startsWith('/')
    ? relative.slice(1)
    : baseDir
      ? `${baseDir}/${relative}`
      : relative

  const out: string[] = []
  for (const segment of combined.split('/')) {
    if (segment === '' || segment === '.') {
      continue
    }
    if (segment === '..') {
      out.pop()
    } else {
      out.push(segment)
    }
  }
  return out.join('/')
}
