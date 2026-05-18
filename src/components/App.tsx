// 최상위 컴포넌트. 초기 상태 로드, 설정/뷰어 화면 전환을 담당한다.

import { emit, on } from '@create-figma-plugin/utilities'
import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import {
  GetStateHandler,
  LastSettings,
  PluginState,
  SavePatHandler,
  SaveRecentHandler,
  SaveSettingsHandler,
  StateHandler
} from '../types'
import { ResizeHandle } from './ResizeHandle'
import { SettingsView } from './SettingsView'
import { ViewerView } from './ViewerView'

export function App() {
  const [ready, setReady] = useState(false)
  const [pat, setPat] = useState('')
  const [recentLinks, setRecentLinks] = useState<string[]>([])
  const [lastSettings, setLastSettings] = useState<LastSettings>({})
  const [view, setView] = useState<'settings' | 'viewer'>('settings')

  // 메인 스레드에서 저장된 상태를 불러온다.
  useEffect(function () {
    const unsubscribe = on<StateHandler>('STATE', function (state: PluginState) {
      setPat(state.pat)
      setRecentLinks(state.recentLinks)
      setLastSettings(state.lastSettings)
      setView(state.pat === '' ? 'settings' : 'viewer')
      setReady(true)
    })
    emit<GetStateHandler>('GET_STATE')
    return unsubscribe
  }, [])

  function handleSavePat(nextPat: string) {
    setPat(nextPat)
    emit<SavePatHandler>('SAVE_PAT', nextPat)
    if (nextPat !== '') {
      setView('viewer')
    }
  }

  function handleRecents(links: string[]) {
    setRecentLinks(links)
    emit<SaveRecentHandler>('SAVE_RECENT', links)
  }

  function handleSaveSettings(settings: LastSettings) {
    emit<SaveSettingsHandler>('SAVE_SETTINGS', settings)
  }

  let content: JSX.Element
  if (!ready) {
    content = <div class="status">불러오는 중…</div>
  } else if (view === 'settings') {
    content = (
      <SettingsView
        pat={pat}
        onSave={handleSavePat}
        onCancel={pat === '' ? undefined : () => setView('viewer')}
      />
    )
  } else {
    content = (
      <ViewerView
        pat={pat}
        recentLinks={recentLinks}
        initialUrl={lastSettings.url || ''}
        initialH1={lastSettings.h1 || ''}
        onRecents={handleRecents}
        onSaveSettings={handleSaveSettings}
        onOpenSettings={() => setView('settings')}
      />
    )
  }

  return (
    <div class="app">
      {content}
      <ResizeHandle />
    </div>
  )
}
