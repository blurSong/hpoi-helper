import { settings } from '../core/settings'
import { getAllComponents, enableComponent, disableComponent } from '../components/loader'
import type { ComponentMetadata } from '../components/types'

// ---------------------------------------------------------------------------
// Styles (isolated in Shadow DOM — no conflict with hpoi.net)
// ---------------------------------------------------------------------------

const CSS = `
  :host {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  /* ── Floating button ── */
  .fab {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    background: #6366f1;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s, transform .1s;
    user-select: none;
  }
  .fab:hover  { background: #4f46e5; }
  .fab:active { transform: scale(.94); }

  /* ── Panel ── */
  .panel {
    position: absolute;
    bottom: 52px;
    right: 0;
    width: 300px;
    max-height: 480px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    transition: opacity .15s, transform .15s;
  }
  .panel[hidden] {
    display: none;
  }

  /* ── Panel header ── */
  .panel-head {
    padding: 12px 14px;
    background: #6366f1;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .panel-title {
    font-weight: 600;
    font-size: 14px;
    letter-spacing: .3px;
  }
  .btn-close {
    background: none;
    border: none;
    color: #fff;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    opacity: .75;
    transition: opacity .1s;
  }
  .btn-close:hover { opacity: 1; }

  /* ── Scrollable body ── */
  .panel-body {
    overflow-y: auto;
    flex: 1;
  }

  /* ── Component row ── */
  .comp-row {
    padding: 10px 14px;
    border-bottom: 1px solid #f0f0f0;
  }
  .comp-row:last-child { border-bottom: none; }

  .comp-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .comp-info { flex: 1; min-width: 0; }
  .comp-name {
    font-weight: 500;
    font-size: 13px;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .comp-desc {
    font-size: 11.5px;
    color: #999;
    margin-top: 2px;
  }

  /* ── Options ── */
  .opts {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f4f4f4;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .opt-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .opt-label {
    font-size: 12px;
    color: #555;
    flex: 1;
  }
  .opt-input {
    width: 58px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 5px;
    font-size: 12px;
    text-align: right;
    outline: none;
  }
  .opt-input:focus { border-color: #6366f1; }
  .opt-select {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 12px;
    outline: none;
  }
  .opt-select:focus { border-color: #6366f1; }

  /* ── Toggle switch ── */
  .switch {
    position: relative;
    width: 34px;
    height: 19px;
    flex-shrink: 0;
  }
  .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .track {
    position: absolute;
    inset: 0;
    background: #ccc;
    border-radius: 19px;
    cursor: pointer;
    transition: background .2s;
  }
  .track::before {
    content: '';
    position: absolute;
    width: 13px;
    height: 13px;
    left: 3px;
    top: 3px;
    background: #fff;
    border-radius: 50%;
    transition: transform .2s;
  }
  input:checked + .track              { background: #6366f1; }
  input:checked + .track::before      { transform: translateX(15px); }
  input:disabled + .track             { opacity: .45; cursor: not-allowed; }

  /* ── Empty state ── */
  .empty {
    padding: 24px;
    text-align: center;
    color: #aaa;
    font-size: 13px;
  }
`

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSwitch(
  checked: boolean,
  onChange: (v: boolean) => void,
  disabled = false,
): HTMLLabelElement {
  const label = document.createElement('label')
  label.className = 'switch'
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = checked
  input.disabled = disabled
  input.addEventListener('change', () => onChange(input.checked))
  const track = document.createElement('span')
  track.className = 'track'
  label.appendChild(input)
  label.appendChild(track)
  return label
}

function renderComponentRow(meta: ComponentMetadata, body: HTMLElement): void {
  const compSettings = settings.getComponent(meta.name, meta.options ?? {})

  const row = document.createElement('div')
  row.className = 'comp-row'

  // Component header: name + enable toggle
  const header = document.createElement('div')
  header.className = 'comp-header'

  const info = document.createElement('div')
  info.className = 'comp-info'
  const name = document.createElement('div')
  name.className = 'comp-name'
  name.textContent = meta.displayName
  info.appendChild(name)
  if (meta.description) {
    const desc = document.createElement('div')
    desc.className = 'comp-desc'
    desc.textContent = meta.description
    info.appendChild(desc)
  }
  header.appendChild(info)

  // Component-level enabled toggle — omitted for alwaysOn components
  if (!meta.alwaysOn) {
    header.appendChild(
      makeSwitch(compSettings.enabled, async (enabled) => {
        if (enabled) {
          await enableComponent(meta.name)
        } else {
          disableComponent(meta.name)
        }
        // Re-render this row to show/hide option controls
        const updated = body.querySelector(`[data-comp="${meta.name}"]`)
        if (updated) {
          const fresh = document.createElement('div')
          fresh.setAttribute('data-comp', meta.name)
          renderComponentRow(meta, fresh)
          updated.replaceWith(fresh.firstChild!)
        }
      }),
    )
  }
  row.appendChild(header)

  // Option controls — always shown for alwaysOn components; otherwise only when enabled
  const schema = meta.options
  const showOptions = meta.alwaysOn ? true : compSettings.enabled
  if (showOptions && schema && Object.keys(schema).length > 0) {
    const opts = document.createElement('div')
    opts.className = 'opts'

    for (const [key, def] of Object.entries(schema)) {
      const path = `components.${meta.name}.options.${key}`
      const value = settings.get(path) ?? def.defaultValue

      const optRow = document.createElement('div')
      optRow.className = 'opt-row'

      const label = document.createElement('span')
      label.className = 'opt-label'
      label.textContent = def.displayName
      optRow.appendChild(label)

      if (typeof def.defaultValue === 'boolean') {
        optRow.appendChild(
          makeSwitch(value as boolean, (v) => settings.set(path, v)),
        )
      } else if (typeof def.defaultValue === 'number') {
        const input = document.createElement('input')
        input.type = 'number'
        input.className = 'opt-input'
        input.value = String(value)
        input.addEventListener('change', () => settings.set(path, Number(input.value)))
        optRow.appendChild(input)
      } else if (Array.isArray(def.choices) && def.choices.length > 0) {
        const sel = document.createElement('select')
        sel.className = 'opt-select'
        for (const choice of def.choices) {
          const opt = document.createElement('option')
          opt.value = String(choice)
          opt.textContent = String(choice)
          if (choice === value) opt.selected = true
          sel.appendChild(opt)
        }
        sel.addEventListener('change', () => settings.set(path, sel.value))
        optRow.appendChild(sel)
      } else {
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'opt-input'
        input.style.width = '90px'
        input.value = String(value)
        input.addEventListener('change', () => settings.set(path, input.value))
        optRow.appendChild(input)
      }

      opts.appendChild(optRow)
    }
    row.appendChild(opts)
  }

  // Wrap in a keyed container so we can replace just this row on toggle
  const wrapper = document.createElement('div')
  wrapper.setAttribute('data-comp', meta.name)
  wrapper.appendChild(row)
  body.appendChild(wrapper)
}

function renderBody(body: HTMLElement): void {
  body.innerHTML = ''
  const components = getAllComponents()
  if (components.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty'
    empty.textContent = '暂无可配置的功能'
    body.appendChild(empty)
    return
  }
  for (const meta of components) renderComponentRow(meta, body)
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

export function mountSettingsPanel(): void {
  // Use Shadow DOM to fully isolate styles from hpoi.net
  const host = document.createElement('div')
  host.id = 'hpoi-helper-settings'
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = CSS
  shadow.appendChild(style)

  // Floating action button
  const fab = document.createElement('button')
  fab.className = 'fab'
  fab.title = 'Hpoi Helper 设置'
  fab.textContent = '⚙'
  shadow.appendChild(fab)

  // Panel
  const panel = document.createElement('div')
  panel.className = 'panel'
  panel.hidden = true
  shadow.appendChild(panel)

  // Panel header
  const head = document.createElement('div')
  head.className = 'panel-head'
  const title = document.createElement('span')
  title.className = 'panel-title'
  title.textContent = '⚙ Hpoi Helper'
  const closeBtn = document.createElement('button')
  closeBtn.className = 'btn-close'
  closeBtn.title = '关闭'
  closeBtn.textContent = '×'
  closeBtn.addEventListener('click', () => { panel.hidden = true })
  head.appendChild(title)
  head.appendChild(closeBtn)
  panel.appendChild(head)

  // Panel body
  const body = document.createElement('div')
  body.className = 'panel-body'
  panel.appendChild(body)

  // Toggle panel; re-render body each open to reflect current settings state
  fab.addEventListener('click', () => {
    panel.hidden = !panel.hidden
    if (!panel.hidden) renderBody(body)
  })
}
