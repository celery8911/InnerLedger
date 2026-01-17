## 一、 设计语言 (Design System)

* **风格关键词**：禅意 (Zen)、轻盈 (Lightweight)、呼吸感 (Spacious)。
* **配色方案**：
* **主色**：`#F8F9FA` (极简白) / `#E0F2F1` (薄荷淡绿 - 呼吸感)。
* **强调色**：`#6366F1` (Monad 紫) - 用于钱包连接和关键操作。
* **文字**：`#2D3436` (深灰 - 易读性)。


* **字体**：系统默认无衬线字体 (Inter / PingFang SC)。

---

## 二、 核心页面设计

### 1. 登录页 (Landing & Connect)

这是用户的起点，强调愿景。

* **Header**: 极简 Logo “长了么？”。
* **Hero Section**: 居中大字 —— “AI 理解你，区块链记住你”。
* **Action**: 巨大的 `Connect Wallet` 按钮（使用 RainbowKit 样式）。
* **Footer**: 实时滚动显示 Monad 网络当前的极低 Gas 费（如：$0.007）。

---

### 2. 冥想体验页 (Meditation Hub)

核心功能：去除所有干扰，引导呼吸。

* **画面中心**：一个缓慢扩张和缩收的淡色圆形（呼吸动画，使用 Framer Motion）。
* **状态文字**：随着圆圈变大显示“呼”，变小显示“吸”。
* **计时器**：极细的数字（如 04:59），不突出，减少焦虑。
* **操作**：底部一个半透明的 `End Session` 按钮。

---

### 3. 觉察输入与 AI 交互页 (Awareness & AI)

冥想结束后的反馈环节。

* **顶部问题**：**“刚才，有什么被你注意到了？”**
* **输入框**：无边框的大文本区域，底部有渐变阴影。
* **情绪选择 (P0)**：😊 / 😐 / 😔 三个圆润的 Emoji 按钮。
* **AI 反馈区**：
* 当用户停止输入 2 秒后，文字以“打字机效果”缓缓出现。
* 内容：“你察觉到了呼吸的变化，这种平静弥足珍贵。”


* **Action**: `Mint to InnerLedger` 按钮。

---

### 4. 成长时间轴 (Journey Timeline)

展示“人格履历”的核心。

* **左侧轴线**：一条细灰线，连接着每一个节点。
* **节点卡片**：
* **Meta**: 日期 + 时间。
* **Insight**: AI 提炼的关键词（如“深度觉察”）。
* **Proof**: 一个带有 Monad Logo 的小徽章，点击跳转区块浏览器。


* **热力图**：页面顶部展示类似 GitHub 的“觉察贡献图”，绿色深浅代表冥想时长或觉察频率。

---

### 5. Growth SBT 收藏馆 (Milestone Gallery)

展示不可转让的成长凭证。

* **卡片设计**：
* 采用玻璃拟态 (Glassmorphism) 效果。
* 动态背景：根据 SBT 类型产生不同的流光。
* **关键信息**：里程碑名称（如 "Journey Begins"）、达成日期、Token ID。


* **不可转让标识**：卡片右下角印有“Non-Transferable”或“Soulbound”的水印。

---

## 三、 技术实现建议 (MVP 快速构建)

| 组件 | 推荐库 | 实现重点 |
| --- | --- | --- |
| **呼吸动画** | `framer-motion` | `animate={{ scale: [1, 1.2, 1] }}` 配合 `transition={{ duration: 8, repeat: Infinity }}`。 |
| **钱包交互** | `RainbowKit` + `wagmi` | 默认配置连接 Monad Testnet。 |
| **AI 打字效果** | `typewriter-effect` | 模拟 AI 思考并吐字的过程。 |
| **链上状态** | `lucide-react` | 使用 `ShieldCheck` 图标表示已上链。 |

---

