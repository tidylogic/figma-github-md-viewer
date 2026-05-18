// UI 진입점. create-figma-plugin이 생성한 HTML이 이 모듈의 default export를 호출한다.

import { render } from '@create-figma-plugin/ui'

import { App } from './components/App'
import { CSS } from './styles'

// 플러그인 스타일 주입. (--figma-color-* 토큰으로 라이트/다크 자동 대응)
const styleElement = document.createElement('style')
styleElement.textContent = CSS
document.head.appendChild(styleElement)

export default render(App)
