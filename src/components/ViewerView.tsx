// PRD 뷰어: 링크 입력 + 최근 목록 + h1 섹션 선택 + markdown 렌더.

import type { TokensList } from 'marked'
import type { JSX } from 'preact'
import { Fragment } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import { fetchMarkdown, parseGitHubLink } from '../lib/github'
import {
  extractH1Titles,
  hydrateImages,
  lexMarkdown,
  renderHtml,
  sliceSection
} from '../lib/markdown'
import { GitHubRef, LastSettings } from '../types'

interface ViewerViewProps {
  pat: string
  recentLinks: string[]
  initialUrl: string
  initialH1: string
  onRecents: (links: string[]) => void
  onSaveSettings: (settings: LastSettings) => void
  onOpenSettings: () => void
}

export function ViewerView(props: ViewerViewProps) {
  const [url, setUrl] = useState(props.initialUrl)
  const [loadedRef, setLoadedRef] = useState<GitHubRef | null>(null)
  const [tokens, setTokens] = useState<TokensList | null>(null)
  const [h1List, setH1List] = useState<string[]>([])
  const [selectedH1, setSelectedH1] = useState(props.initialH1)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bodyRef = useRef<HTMLDivElement>(null)

  async function load(targetUrl: string): Promise<void> {
    const trimmed = targetUrl.trim()
    if (trimmed === '') {
      return
    }
    setLoading(true)
    setError('')
    try {
      const ref = parseGitHubLink(trimmed)
      const markdown = await fetchMarkdown(ref, props.pat)
      const lexed = lexMarkdown(markdown)
      const titles = extractH1Titles(lexed)
      // 이전에 보던 섹션이 새 문서에도 있으면 유지, 없으면 전체 보기로.
      const keepH1 = titles.indexOf(selectedH1) !== -1 ? selectedH1 : ''

      setLoadedRef(ref)
      setTokens(lexed)
      setH1List(titles)
      setSelectedH1(keepH1)

      const nextRecents = [
        trimmed,
        ...props.recentLinks.filter((link) => link !== trimmed)
      ].slice(0, 10)
      props.onRecents(nextRecents)
      props.onSaveSettings({ url: trimmed, h1: keepH1 })
    } catch (caught) {
      setLoadedRef(null)
      setTokens(null)
      setH1List([])
      setHtml('')
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setLoading(false)
    }
  }

  // 첫 진입 시 마지막으로 보던 문서를 자동으로 불러온다.
  useEffect(function () {
    if (props.initialUrl.trim() !== '') {
      void load(props.initialUrl)
    }
  }, [])

  // 토큰 또는 선택 섹션이 바뀌면 HTML을 다시 렌더한다.
  useEffect(
    function () {
      if (tokens === null) {
        setHtml('')
        return
      }
      const section = sliceSection(tokens, selectedH1 === '' ? null : selectedH1)
      setHtml(renderHtml(section))
    },
    [tokens, selectedH1]
  )

  // HTML 갱신 후 스크롤을 맨 위로 올리고 이미지를 인증 fetch한다.
  useEffect(
    function () {
      const container = bodyRef.current
      if (container === null || html === '' || loadedRef === null) {
        return
      }
      const scroller = container.closest('.md-scroll')
      if (scroller !== null) {
        scroller.scrollTop = 0
      }
      void hydrateImages(container, loadedRef, props.pat)
    },
    [html]
  )

  function handleH1Change(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const next = event.currentTarget.value
    setSelectedH1(next)
    props.onSaveSettings({ url: url.trim(), h1: next })
  }

  function handleRecentPick(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const picked = event.currentTarget.value
    event.currentTarget.value = ''
    if (picked !== '') {
      setUrl(picked)
      void load(picked)
    }
  }

  const showEmptyState =
    tokens === null && loading === false && error === ''

  return (
    <Fragment>
      <div class="toolbar">
        <div class="row">
          <input
            class="input"
            type="text"
            placeholder="GitHub markdown 링크 (.../blob/main/docs/prd.md)"
            value={url}
            onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => {
              setUrl(event.currentTarget.value)
            }}
            onKeyDown={(event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                void load(url)
              }
            }}
          />
          <button
            class="btn btn-primary"
            disabled={loading}
            onClick={() => void load(url)}
          >
            {loading ? '로딩…' : '열기'}
          </button>
        </div>

        <div class="row">
          <select class="select" onChange={handleRecentPick}>
            <option value="">최근 문서…</option>
            {props.recentLinks.map((link) => (
              <option key={link} value={link}>
                {link}
              </option>
            ))}
          </select>
          <button
            class="btn icon-btn"
            title="GitHub 토큰 설정"
            onClick={props.onOpenSettings}
          >
            ⚙
          </button>
        </div>

        {h1List.length > 0 ? (
          <div class="row">
            <select
              class="select"
              value={selectedH1}
              onChange={handleH1Change}
            >
              <option value="">전체 문서</option>
              {h1List.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {error !== '' ? <div class="error">{error}</div> : null}

      <div class="md-scroll">
        {showEmptyState ? (
          <div class="status">
            GitHub markdown 링크를 입력하고 “열기”를 누르세요.
          </div>
        ) : (
          <div
            class="md-body"
            ref={bodyRef}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </Fragment>
  )
}
