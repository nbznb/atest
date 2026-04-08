[English](README.md) | **中文**

# 关注科技动态，而非炒作

一个 AI 驱动的信息聚合工具，追踪重要的科技信息源——官方产品团队、研究机构、工程博客和播客——并将最新变化整理成易于消化的摘要推送给你。

**理念：** 关注一手信息源和有实质内容的更新，而不是炒作周期或二手评论。

## 你会得到什么

每日或每周推送到你常用的通讯工具（Telegram、Discord、WhatsApp 等），包含：

- 顶级 AI 与科技播客新节目的精华摘要
- 精选科技信息源在 X/Twitter 上的重要更新
- 官方工程与产品博客的完整文章
- 所有原始内容的链接
- 支持英文、中文或双语版本

## 快速开始

1. 在你的 AI agent 中安装此 skill（OpenClaw 或 Claude Code）
2. 输入 "set up follow builders" 或执行 `/follow-builders`
3. Agent 会以对话方式引导你完成设置——不需要手动编辑任何配置文件

Agent 会询问你：
- 推送频率（每日或每周）和时间
- 语言偏好
- 推送方式（Telegram、邮件或直接在聊天中显示）

不需要任何 API key——所有内容由中心化服务统一抓取。
设置完成后，你的第一期摘要会立即推送。

## 修改设置

通过对话即可修改推送偏好。直接告诉你的 agent：

- "改成每周一早上推送"
- "语言换成中文"
- "把摘要写得更简短一些"
- "显示我当前的设置"

信息源列表（X 账号、博客和播客）由中心化统一管理和更新——你无需做任何操作即可获得最新的信息源。

## 自定义摘要风格

Skill 使用纯文本 prompt 文件来控制内容的摘要方式。你可以通过两种方式自定义：

**通过对话（推荐）：**
直接告诉你的 agent——"摘要写得更简练一些"、"多关注可操作的洞察"、"用更轻松的语气"。Agent 会自动帮你更新 prompt。

**直接编辑（高级用户）：**
编辑 `prompts/` 文件夹中的文件：
- `summarize-podcast.md` — 播客节目的摘要方式
- `summarize-tweets.md` — X/Twitter 帖子的摘要方式
- `summarize-blogs.md` — 博客文章的摘要方式
- `digest-intro.md` — 整体摘要的格式和语气
- `translate.md` — 英文内容翻译为中文的方式

这些都是纯文本指令，不是代码。修改后下次推送即生效。

## 默认信息源

### 播客（6个）
- [Latent Space](https://www.youtube.com/@LatentSpacePod)
- [Training Data](https://www.youtube.com/playlist?list=PLOhHNjZItNnMm5tdW61JpnyxeYH5NDDx8)
- [No Priors](https://www.youtube.com/@NoPriorsPodcast)
- [Unsupervised Learning](https://www.youtube.com/@RedpointAI)
- [The MAD Podcast with Matt Turck](https://www.youtube.com/@DataDrivenNYC)
- [AI & I by Every](https://www.youtube.com/playlist?list=PLuMcoKK9mKgHtW_o9h5sGO2vXrffKHwJL)

### X 上的科技信息源（10个)
[OpenAI](https://x.com/OpenAI), [Anthropic](https://x.com/AnthropicAI), [Claude](https://x.com/claudeai), [Google DeepMind](https://x.com/GoogleDeepMind), [Google Labs](https://x.com/GoogleLabs), [GitHub](https://x.com/github), [Hugging Face](https://x.com/huggingface), [Microsoft](https://x.com/Microsoft), [Cloudflare](https://x.com/Cloudflare), [Vercel](https://x.com/vercel)

### 官方博客（2个）
- [Anthropic Engineering](https://www.anthropic.com/engineering) — Anthropic 团队的技术深度文章
- [Claude Blog](https://claude.com/blog) — Claude 的产品公告与更新

## 安装

### OpenClaw
```bash
# 从 ClawhHub 安装（即将上线）
clawhub install follow-builders

# 或手动安装
git clone https://github.com/zarazhangrui/follow-builders.git ~/skills/follow-builders
cd ~/skills/follow-builders/scripts && npm install
```

### Claude Code
```bash
git clone https://github.com/zarazhangrui/follow-builders.git ~/.claude/skills/follow-builders
cd ~/.claude/skills/follow-builders/scripts && npm install
```

## 系统要求

- 一个 AI agent（OpenClaw、Claude Code 或类似工具）
- 网络连接（用于获取中心化 feed）

仅此而已。不需要任何 API key。所有内容（博客文章 + YouTube 字幕 + X/Twitter 帖子）由中心化服务每日抓取更新。

## 工作原理

1. 中心化 feed 每日更新，抓取所有信息源的最新内容（博客文章通过网页抓取，YouTube 字幕通过 Supadata，X/Twitter 通过官方 API）
2. 你的 agent 获取 feed——一次 HTTP 请求，不需要 API key
3. 你的 agent 根据你的偏好将原始内容重新混编为易消化的摘要
4. 摘要推送到你的通讯工具（或直接在聊天中显示）

查看 [examples/sample-digest.md](examples/sample-digest.md) 了解输出示例。

## 隐私

- 不发送任何 API key——所有内容由中心化服务获取
- 如果你使用 Telegram/邮件推送，相关 key 仅存储在本地 `~/.follow-builders/.env`
- Skill 只读取公开内容（公开的博客文章、YouTube 视频和 X 帖子）
- 你的配置、偏好和阅读记录都保留在你自己的设备上

## 许可证

MIT
