[English](README.md) | **中文**

# Follow USTC

一个 AI 驱动的信息摘要项目，用于跟踪中科大官方信息、教务通知、精选科技资讯和科研论文动态，并将其整理成简洁摘要。

## 你会得到什么

每日或每周摘要，包含：

- USTC 官方新闻与通知
- 教务处与教学相关公告
- 公开科技资讯源的精选内容
- 公开论文 feed 的研究亮点
- 所有原始链接
- 英文、中文或双语输出

## 快速开始

1. 在 agent 中安装该 skill
2. 输入 “set up follow USTC”
3. agent 会通过对话完成设置

内容源不需要 API key，公共内容由中心化 feed 获取。

## 架构

- `config/default-sources.json` 定义数据源
- `scripts/generate-feed.js` 抓取并生成 feeds
- `scripts/prepare-digest.js` 汇总 feeds、prompts 和配置给 LLM
- `scripts/deliver.js` 负责 stdout、Telegram 或邮件投递
- `prompts/` 控制摘要风格

## 默认内容分类

- USTC 官方新闻与通知
- USTC 教务处更新
- 公开科技资讯 feed
- 公开科研论文 feed

## 安装

### Claude Code
```bash
cd ~/.claude/skills/follow-USTC/scripts && npm install
```

## 系统要求

- Claude Code 或类似 AI agent
- 网络连接

## 工作原理

1. 中心化 feed 定时从公开来源更新
2. agent 拉取 feed 与本地配置
3. LLM 将原始条目重组为摘要
4. 摘要在聊天中展示或通过所选渠道发送

## 许可证

MIT
