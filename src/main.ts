// 메인(샌드박스) 스레드.
//
// 중요: 이 파일은 read-only 계정에서도 동작해야 하므로 문서를 변경하는 API
// (노드 생성, setPluginData, figma.root 쓰기 등)를 절대 호출하지 않는다.
// figma.showUI / figma.ui.resize / figma.clientStorage / 메시지 핸들러만 사용한다.

import { emit, on, showUI } from '@create-figma-plugin/utilities'

import {
  GetStateHandler,
  LastSettings,
  PluginState,
  ResizeHandler,
  SavePatHandler,
  SaveRecentHandler,
  SaveSettingsHandler,
  SaveSizeHandler,
  StateHandler,
  WindowSize
} from './types'

const DEFAULT_SIZE: WindowSize = { width: 440, height: 640 }
const MIN_SIZE: WindowSize = { width: 320, height: 360 }

function clampSize(size: WindowSize): WindowSize {
  return {
    width: Math.max(MIN_SIZE.width, Math.round(size.width)),
    height: Math.max(MIN_SIZE.height, Math.round(size.height))
  }
}

export default async function (): Promise<void> {
  const storedSize = await figma.clientStorage.getAsync('windowSize')
  const size = clampSize((storedSize as WindowSize) || DEFAULT_SIZE)

  showUI(size)

  // 창 리사이즈 (드래그 중 연속 호출)
  on<ResizeHandler>('RESIZE', function (next) {
    const clamped = clampSize(next)
    figma.ui.resize(clamped.width, clamped.height)
  })

  // 리사이즈 종료 시점에만 크기를 저장
  on<SaveSizeHandler>('SAVE_SIZE', async function (next) {
    await figma.clientStorage.setAsync('windowSize', clampSize(next))
  })

  // UI가 켜질 때 저장된 상태를 요청
  on<GetStateHandler>('GET_STATE', async function () {
    const pat = ((await figma.clientStorage.getAsync('pat')) as string) || ''
    const recentLinks =
      ((await figma.clientStorage.getAsync('recentLinks')) as string[]) || []
    const lastSettings =
      ((await figma.clientStorage.getAsync('lastSettings')) as LastSettings) || {}
    const state: PluginState = { pat, recentLinks, lastSettings }
    emit<StateHandler>('STATE', state)
  })

  on<SavePatHandler>('SAVE_PAT', async function (pat) {
    await figma.clientStorage.setAsync('pat', pat)
  })

  on<SaveRecentHandler>('SAVE_RECENT', async function (recentLinks) {
    await figma.clientStorage.setAsync('recentLinks', recentLinks)
  })

  on<SaveSettingsHandler>('SAVE_SETTINGS', async function (settings) {
    await figma.clientStorage.setAsync('lastSettings', settings)
  })
}
