// 플러그인 UI 전체 CSS.
// Figma가 플러그인 iframe에 자동 주입하는 --figma-color-* 토큰을 사용하므로
// 라이트/다크 테마가 자동으로 반영된다. (괄호 안 값은 Figma 외 환경용 fallback)

export const CSS = `
* { box-sizing: border-box; }
html, body, #create-figma-plugin { height: 100%; }
body {
  margin: 0;
  font-family: Inter, -apple-system, system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: var(--figma-color-text, #1e1e1e);
  background-color: var(--figma-color-bg, #ffffff);
}
input, select, button, textarea { font: inherit; }

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* --- 공통 컨트롤 --- */
.input, .select {
  height: 28px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid var(--figma-color-border, #e6e6e6);
  background-color: var(--figma-color-bg, #ffffff);
  color: var(--figma-color-text, #1e1e1e);
}
.settings .input { width: 100%; }
.toolbar .input { flex: 1; min-width: 0; }
.input:focus, .select:focus {
  outline: 1px solid var(--figma-color-border-selected, #0d99ff);
  outline-offset: -1px;
}
.btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--figma-color-border, #e6e6e6);
  background-color: var(--figma-color-bg-secondary, #f5f5f5);
  color: var(--figma-color-text, #1e1e1e);
}
.btn:hover:not(:disabled) { background-color: var(--figma-color-bg-hover, #f0f0f0); }
.btn-primary {
  background-color: var(--figma-color-bg-brand, #0d99ff);
  color: var(--figma-color-text-onbrand, #ffffff);
  border-color: transparent;
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--figma-color-bg-brand-hover, #0a85e0);
}
.btn:disabled { opacity: 0.4; cursor: default; }
.row { display: flex; gap: 6px; align-items: center; }
.row > .select { flex: 1; min-width: 0; }

/* --- 설정 화면 --- */
.settings {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}
.settings h2 { margin: 0; font-size: 13px; }
.hint { color: var(--figma-color-text-secondary, #757575); font-size: 11px; }
.hint code {
  background-color: var(--figma-color-bg-secondary, #f5f5f5);
  padding: 1px 4px;
  border-radius: 3px;
}

/* --- 뷰어 툴바 --- */
.toolbar {
  flex: none;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid var(--figma-color-border, #e6e6e6);
  background-color: var(--figma-color-bg, #ffffff);
}
.icon-btn {
  height: 28px;
  width: 28px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* --- 본문/상태 --- */
.md-scroll { flex: 1; overflow: auto; padding: 16px; }
.status {
  padding: 24px 16px;
  text-align: center;
  color: var(--figma-color-text-secondary, #757575);
}
.error {
  flex: none;
  padding: 8px 12px;
  font-size: 11px;
  color: var(--figma-color-text-danger, #f24822);
  background-color: var(--figma-color-bg-danger-tertiary, #fdeceb);
  border-bottom: 1px solid var(--figma-color-border, #e6e6e6);
}

/* --- 렌더된 markdown 본문 (테마 토큰 사용) --- */
.md-body { color: var(--figma-color-text, #1e1e1e); word-wrap: break-word; }
.md-body > *:first-child { margin-top: 0; }
.md-body h1, .md-body h2, .md-body h3,
.md-body h4, .md-body h5, .md-body h6 {
  margin: 20px 0 8px;
  line-height: 1.3;
  font-weight: 600;
}
.md-body h1 { font-size: 18px; }
.md-body h2 {
  font-size: 15px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--figma-color-border, #e6e6e6);
}
.md-body h3 { font-size: 13px; }
.md-body h4, .md-body h5, .md-body h6 { font-size: 12px; }
.md-body p, .md-body ul, .md-body ol, .md-body blockquote, .md-body table {
  margin: 8px 0;
}
.md-body ul, .md-body ol { padding-left: 20px; }
.md-body li { margin: 2px 0; }
.md-body a { color: var(--figma-color-text-brand, #0d99ff); }
.md-body code {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 11px;
  background-color: var(--figma-color-bg-secondary, #f5f5f5);
  padding: 1px 4px;
  border-radius: 3px;
}
.md-body pre {
  background-color: var(--figma-color-bg-secondary, #f5f5f5);
  border: 1px solid var(--figma-color-border, #e6e6e6);
  border-radius: 6px;
  padding: 10px 12px;
  overflow: auto;
}
.md-body pre code { background: none; padding: 0; }
.md-body blockquote {
  margin-left: 0;
  padding: 2px 12px;
  border-left: 3px solid var(--figma-color-border, #e6e6e6);
  color: var(--figma-color-text-secondary, #757575);
}
.md-body hr {
  border: none;
  border-top: 1px solid var(--figma-color-border, #e6e6e6);
  margin: 16px 0;
}
.md-body img { max-width: 100%; height: auto; border-radius: 4px; }
.md-body img.md-img-error {
  display: inline-block;
  min-width: 120px;
  padding: 8px;
  border: 1px dashed var(--figma-color-border, #e6e6e6);
  color: var(--figma-color-text-secondary, #757575);
  font-size: 11px;
}
.md-body table { border-collapse: collapse; width: 100%; }
.md-body th, .md-body td {
  border: 1px solid var(--figma-color-border, #e6e6e6);
  padding: 4px 8px;
  text-align: left;
}
.md-body th { background-color: var(--figma-color-bg-secondary, #f5f5f5); }

/* --- 리사이즈 핸들 --- */
.resize-handle {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  color: var(--figma-color-icon-tertiary, #b3b3b3);
  z-index: 10;
}
`
