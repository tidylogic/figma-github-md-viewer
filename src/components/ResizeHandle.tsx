// 우하단 드래그 핸들. 가로/세로를 함께 조절한다.

import { emit } from '@create-figma-plugin/utilities'
import type { JSX } from 'preact'

import { ResizeHandler, SaveSizeHandler, WindowSize } from '../types'

const MIN_WIDTH = 320
const MIN_HEIGHT = 360

function sizeFromEvent(
  event: JSX.TargetedPointerEvent<HTMLDivElement>
): WindowSize {
  return {
    width: Math.max(MIN_WIDTH, Math.floor(event.clientX + 6)),
    height: Math.max(MIN_HEIGHT, Math.floor(event.clientY + 6))
  }
}

export function ResizeHandle() {
  function handlePointerDown(event: JSX.TargetedPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: JSX.TargetedPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }
    emit<ResizeHandler>('RESIZE', sizeFromEvent(event))
  }

  function handlePointerUp(event: JSX.TargetedPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    // 드래그 종료 시점에만 크기를 저장한다.
    emit<SaveSizeHandler>('SAVE_SIZE', sizeFromEvent(event))
  }

  return (
    <div
      class="resize-handle"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M15 6 L6 15 M15 11 L11 15"
          stroke="currentColor"
          stroke-width="1.5"
        />
      </svg>
    </div>
  )
}
