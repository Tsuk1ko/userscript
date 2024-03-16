## 关于 BV 转 av

该脚本会按以下优先级获取 `aid`

1. ~~`window.__INITIAL_STATE__.videoData.aid`~~ 弃用，在无刷新跳转视频时更新不及时
2. ~~`window.__INITIAL_STATE__.aid`~~ 弃用，在无刷新跳转视频时更新不及时
3. ~~`window.aid`~~ 弃用，无了
4. 使用 URL 中的 `bvid` 进行计算，[算法来源](https://github.com/mrhso/IshisashiWebsite/blob/master/%E4%B9%B1%E5%86%99%E7%A8%8B%E5%BC%8F/BV%20%E5%8F%B7%E8%B7%8B%E6%89%88%E3%80%80%EF%BD%9E%20Who%20done%20it!.js)

另外会从 URL 中去掉 search string 中除了 `p` 和 `t` 以外的参数，hash 部分则会完整保留以保护评论跳转行为

## 关于 /s/video/xxx 重定向

从某些搜索引擎进入的视频页可能会是 `https://www.bilibili.com/s/video/BV***`，脚本会自动重定向至 `https://www.bilibili.com/video/BV***`

该能力默认启用，你可以在脚本菜单中开启或关闭

## 关于稍后再看

由于稍后再看不支持 av 地址，因此脚本不会对稍后再看地址进行转换，否则会影响前进、后退、刷新等行为
