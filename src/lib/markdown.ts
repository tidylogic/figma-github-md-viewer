// markdown 토큰화 / h1 섹션 추출 / HTML 렌더 / 이미지 후처리.

import DOMPurify from 'dompurify'
import { marked, type Token, type TokensList } from 'marked'

import { GitHubRef } from '../types'
import { dirname, fetchAssetAsDataUrl, resolveRepoPath } from './github'

marked.setOptions({ gfm: true, breaks: false })

// 링크는 항상 새 탭으로 열리도록 한다.
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/** markdown 원문을 토큰 리스트로 변환한다. */
export function lexMarkdown(md: string): TokensList {
  return marked.lexer(md)
}

/** 문서에 포함된 모든 h1 제목을 순서대로 반환한다. (섹션 선택 드롭다운용) */
export function extractH1Titles(tokens: TokensList): string[] {
  const titles: string[] = []
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      titles.push(token.text)
    }
  }
  return titles
}

/**
 * 지정한 h1 섹션(그 h1부터 다음 h1 직전까지)만 잘라낸다.
 * h1Text가 비어 있거나 찾지 못하면 전체 토큰을 그대로 반환한다.
 */
export function sliceSection(
  tokens: TokensList,
  h1Text: string | null
): Token[] {
  if (!h1Text) {
    return tokens
  }
  const start = tokens.findIndex(
    (t) => t.type === 'heading' && t.depth === 1 && t.text === h1Text
  )
  if (start === -1) {
    return tokens
  }
  let end = tokens.length
  for (let i = start + 1; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'heading' && t.depth === 1) {
      end = i
      break
    }
  }
  const sliced = tokens.slice(start, end) as TokensList
  // 참조 링크 정의를 보존한다.
  sliced.links = tokens.links
  return sliced
}

/** 토큰을 안전하게 정제된 HTML 문자열로 렌더한다. */
export function renderHtml(tokens: Token[]): string {
  const rawHtml = marked.parser(tokens)
  return DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] })
}

/**
 * 렌더된 컨테이너 내부의 상대경로 이미지(`<img>`)를 GitHub에서 인증 fetch하여
 * data URL로 교체한다. 절대 URL(http/https)이나 data URL은 그대로 둔다.
 */
export async function hydrateImages(
  container: HTMLElement,
  ref: GitHubRef,
  pat: string
): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'))
  const baseDir = dirname(ref.path)

  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute('src') || ''
      if (src === '' || /^(https?:)?\/\//i.test(src) || src.startsWith('data:')) {
        return
      }
      try {
        const cleanSrc = decodeURIComponent(src.split('#')[0].split('?')[0])
        const assetPath = resolveRepoPath(baseDir, cleanSrc)
        img.setAttribute('src', await fetchAssetAsDataUrl(ref, assetPath, pat))
      } catch {
        img.classList.add('md-img-error')
        img.removeAttribute('src')
        if (!img.getAttribute('alt')) {
          img.setAttribute('alt', '이미지를 불러오지 못했습니다')
        }
      }
    })
  )
}
