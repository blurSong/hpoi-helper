export interface ComponentTag {
  name: string
  displayName: string
}

export const componentTags = {
  display: { name: 'display', displayName: '显示' },
  utility: { name: 'utility', displayName: '工具' },
  style:   { name: 'style',   displayName: '样式' },
  data:    { name: 'data',    displayName: '数据' },
} as const satisfies Record<string, ComponentTag>
