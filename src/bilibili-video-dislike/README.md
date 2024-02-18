## 脚本功能

为哔哩哔哩视频页增加点踩功能，按钮在视频下方工具栏最右边更多菜单中（别问为什么不放点赞旁边，放那里可能会导致B站页面初始化出问题，很怪）

左键单击为点踩，右击为取消点踩，操作后在视频左下角会出现 Toast 提示

![](https://i.jpg.dog/a6f108fe2bf6b8fc810bc730306f68dc.png)

## 其他说明

脚本通过手机客户端 API 进行点踩操作，需要获取 access_key，获取行为会在访问视频页面时自动进行，获取成功后保存在脚本储存中，后续使用不会重复获取

获取 access_key 使用了 [lzghzr/TampermonkeyJS 中的工具](https://github.com/lzghzr/TampermonkeyJS/blob/master/libBilibiliToken/libBilibiliToken.js)，获取时会收到一条扫码登录通知

若更换帐号或其他原因需要重新获取 access_key，请点击脚本菜单中的“重置 access_key”
