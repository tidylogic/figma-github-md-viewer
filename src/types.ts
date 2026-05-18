// 메인 스레드 <-> UI 사이에서 공유하는 타입 정의.

import { EventHandler } from '@create-figma-plugin/utilities'

/** GitHub 링크에서 파싱한 파일 위치 정보. */
export interface GitHubRef {
  owner: string
  repo: string
  branch: string
  path: string
}

/** 마지막으로 보던 문서/섹션 상태. */
export interface LastSettings {
  url?: string
  h1?: string
}

/** 메인 스레드가 clientStorage에서 읽어 UI로 전달하는 초기 상태. */
export interface PluginState {
  pat: string
  recentLinks: string[]
  lastSettings: LastSettings
}

/** 플러그인 창 크기. */
export interface WindowSize {
  width: number
  height: number
}

// --- UI <-> 메인 메시지 핸들러 타입 ---

export interface ResizeHandler extends EventHandler {
  name: 'RESIZE'
  handler: (size: WindowSize) => void
}

export interface SaveSizeHandler extends EventHandler {
  name: 'SAVE_SIZE'
  handler: (size: WindowSize) => void
}

export interface GetStateHandler extends EventHandler {
  name: 'GET_STATE'
  handler: () => void
}

export interface StateHandler extends EventHandler {
  name: 'STATE'
  handler: (state: PluginState) => void
}

export interface SavePatHandler extends EventHandler {
  name: 'SAVE_PAT'
  handler: (pat: string) => void
}

export interface SaveRecentHandler extends EventHandler {
  name: 'SAVE_RECENT'
  handler: (recentLinks: string[]) => void
}

export interface SaveSettingsHandler extends EventHandler {
  name: 'SAVE_SETTINGS'
  handler: (settings: LastSettings) => void
}
