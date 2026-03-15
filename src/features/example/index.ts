import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'

export const component = defineComponent({
  name: 'example',
  displayName: '示例组件',
  description: '验证框架是否正常运行',
  tags: [componentTags.utility],
  enabledByDefault: true,
  entry: () => {
    console.log('[Hpoi Helper] 示例组件已加载 ✓')
  },
})
