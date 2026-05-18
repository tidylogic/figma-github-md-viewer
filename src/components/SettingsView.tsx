// GitHub PAT 입력/저장 화면.

import type { JSX } from 'preact'
import { useState } from 'preact/hooks'

interface SettingsViewProps {
  pat: string
  onSave: (pat: string) => void
  onCancel?: () => void
}

export function SettingsView(props: SettingsViewProps) {
  const [value, setValue] = useState(props.pat)

  return (
    <div class="settings">
      <h2>GitHub 연결 설정</h2>
      <p class="hint">
        Private repo의 PRD를 읽으려면 GitHub Personal Access Token이 필요합니다.
        대상 repo에 <code>Contents: Read-only</code> 권한만 가진 fine-grained
        토큰을 권장합니다. 토큰은 이 컴퓨터(<code>figma.clientStorage</code>)에만
        저장되며 외부로 전송되지 않습니다.
      </p>
      <input
        class="input"
        type="password"
        placeholder="github_pat_..."
        value={value}
        onInput={(event: JSX.TargetedEvent<HTMLInputElement>) => {
          setValue(event.currentTarget.value)
        }}
      />
      <div class="row">
        <button
          class="btn btn-primary"
          disabled={value.trim() === ''}
          onClick={() => props.onSave(value.trim())}
        >
          저장
        </button>
        {props.onCancel ? (
          <button class="btn" onClick={props.onCancel}>
            취소
          </button>
        ) : null}
      </div>
    </div>
  )
}
