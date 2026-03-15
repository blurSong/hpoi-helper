# Hpoi Helper

[hpoi.net](https://www.hpoi.net) 增强脚本——基于 Tampermonkey，使用 TypeScript + Vite 构建。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 从 [Releases](../../releases) 下载最新的 `hpoi-helper.user.js`，或直接点击安装链接
3. Tampermonkey 会弹出安装确认页，点击「安装」

## 功能列表

| 功能 | 说明 | 默认 |
|---|---|---|
| **屏蔽噪音内容** | 分别屏蔽首页和手办页的广告、推荐、排行榜等干扰内容 | 关闭 |

### 屏蔽噪音内容（详细开关）

| 开关 | 效果 |
|---|---|
| 【首页】屏蔽右栏广告 banner | 隐藏首页右栏的广告轮播及快捷入口图片 |
| 【首页】屏蔽右栏近期发售榜 | 隐藏首页右栏的近期发售/周边期待榜 |
| 【首页】屏蔽右栏热门推荐 | 隐藏首页右栏的热门推荐文章列表 |
| 【首页】屏蔽左栏商品推荐 | 隐藏首页左栏的淘宝自营商品推荐 |
| 【首页】屏蔽左栏获赞排行榜 | 隐藏首页左栏的获赞排行榜 |
| 【手办页】屏蔽顶部广告区 | 隐藏手办分区首页顶部的活动轮播和自营店广告图 |

> 当首页右栏三项全部开启时，中间信息流自动扩展至 75% 宽度。

## 开发

```bash
pnpm install
pnpm dev      # 启动开发服务器（Tampermonkey 安装代理脚本后自动热重载）
pnpm build    # 生产构建 → dist/hpoi-helper.user.js
pnpm test     # 运行测试
```

详见 [CLAUDE.md](./CLAUDE.md)。

## 参考项目

架构参考 [Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved)（作为 git submodule 收录于本仓库）。

## License

MIT
