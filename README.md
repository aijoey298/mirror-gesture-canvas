# Mirror Gesture Canvas

一个基于浏览器摄像头和 MediaPipe Hands 的手势画板小工具。你可以在摄像头前通过手势绘画、切换颜色、清空画布、保存截图，并触发爱心雨、火焰、兔耳等互动特效。

这个项目是我第一次用 AI 辅助完成的网页小工具之一。它不追求复杂，但适合用来体验“把一个想法快速做成可运行作品”的过程。

## 功能

- 拇指 + 食指捏合：在画布上绘画
- 拇指 + 中指捏合：切换画笔颜色
- 单手握拳：清空画布
- 双手十字相框：保持约 1 秒后触发截图倒计时
- 双手比心：触发爱心雨特效
- 金属礼手势：触发火焰特效
- 剪刀手：触发兔耳特效
- 手部关键点实时显示，颜色与当前画笔颜色同步
- 摄像头画面只在本机浏览器处理，不上传到服务器

## 在线或本地运行

这个项目是纯前端项目，不需要安装依赖。

最简单的方式：

1. 下载或克隆仓库。
2. 用浏览器打开 `index.html`。
3. 允许浏览器访问摄像头。
4. 保持光线充足，把手放在摄像头画面中间开始操作。

如果浏览器限制本地摄像头权限，可以启动一个本地静态服务器：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

## 手势说明

| 手势 | 功能 |
| --- | --- |
| 拇指 + 食指捏合 | 绘画 |
| 拇指 + 中指捏合 | 切换颜色 |
| 单手握拳 | 清空画布 |
| 双手十字相框 | 保存截图 |
| 双手比心 | 爱心雨 |
| 金属礼 | 火焰特效 |
| 剪刀手 | 兔耳特效 |

## 项目结构

```text
.
├── index.html
├── css/
│   ├── base.css
│   ├── ui-components.css
│   ├── effects.css
│   └── animations.css
├── js/
│   ├── main.js
│   ├── config.js
│   ├── state-manager.js
│   ├── dom-manager.js
│   ├── camera-manager.js
│   ├── gesture-detector.js
│   ├── drawing-manager.js
│   ├── screenshot-manager.js
│   ├── ui-manager.js
│   ├── effects/
│   │   ├── base-effect.js
│   │   ├── effect-manager.js
│   │   ├── heart-effect.js
│   │   ├── rock-effect.js
│   │   └── victory-effect.js
│   └── utils/
│       └── utils.js
├── docs/
│   └── heart-gesture-notes.md
├── DEV_LOG.md
└── GESTURE_ROADMAP.md
```

## 技术栈

- MediaPipe Hands：手部关键点识别
- Canvas 2D API：绘画、画面合成和截图
- html2canvas：截图辅助
- 原生 JavaScript、HTML、CSS

## 使用建议

- 推荐使用 Chrome 或 Edge。
- 摄像头画面中只保留手部和上半身，减少背景干扰。
- 光线越稳定，手势识别越稳定。
- 截图手势需要保持约 1 秒，不要太快松开。
- 如果某个特效误触，可以优先调整 `js/config.js` 中的阈值。

## 隐私说明

本项目不会主动上传摄像头画面。摄像头数据仅在浏览器本地用于 MediaPipe Hands 识别和 Canvas 绘制。

项目会从 CDN 加载 MediaPipe 相关脚本。如果你需要完全离线运行，可以自行下载对应依赖并改成本地引用。

## 开发记录

- `DEV_LOG.md`：主要开发和重构记录。
- `GESTURE_ROADMAP.md`：早期手势特效设计方案和取舍记录。
- `docs/heart-gesture-notes.md`：爱心手势识别思路。

## License

MIT License
