## 关于 BV 转 av

该脚本会按以下优先级获取 `aid`

1. ~~`window.__INITIAL_STATE__.videoData.aid`~~ 弃用，在无刷新跳转视频时更新不及时
2. ~~`window.__INITIAL_STATE__.aid`~~ 弃用，在无刷新跳转视频时更新不及时
3. `window.aid`
4. 使用 URL 中的 `bvid` 进行计算，[算法来源](https://www.zhihu.com/question/381784377/answer/1099438784)

另外会从 URL 中去掉 search string 中除了 `p` 和 `t` 以外的参数，hash 部分则会完整保留以保护评论跳转行为

## 关于 /s/video/xxx 重定向

从某些搜索引擎进入的视频页可能会是 `https://www.bilibili.com/s/video/BV***`，脚本会自动重定向至 `https://www.bilibili.com/video/BV***`

该能力默认启用，你可以在脚本菜单中开启或关闭

## 关于稍后再看

由于稍后再看不支持 av 地址，因此脚本不会对稍后再看地址进行转换，否则会影响前进、后退、刷新等行为
