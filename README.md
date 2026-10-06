# opencode-zen-free

在 Magpie 和 OpenCode 中使用 OpenCode Zen 免费模型。
供应商 ID：`opencode-zen-free`。

## 安装

```sh
magpie plugin add github:xiaozhou26/magpie-opencode-zen-free
magpie plugin login opencode-zen-free
```

也可以在 Magpie「添加插件」中填写上面的 GitHub 地址，或本地目录
`D:\magpie-opencode-zen-free`。

## 登录

密钥填写 `public`，无需个人 API Key。登录信息由 OpenCode 保存在
`auth.json`，或由 Magpie 保存在 `plugin-auth.json`。

## 模型

自动获取 Zen 当前提供的免费模型、上下文窗口和推理档位。
模型名格式为 `opencode-zen-free/<模型 ID>`，例如
`opencode-zen-free/big-pickle`。

已弃用模型和 SystemOne 模型不在列表中。模型可用性和限流由 Zen 决定；
插件没有剩余额度数据。

## 请求

直接连接 `https://opencode.ai/zen/v1`，支持 Chat Completions、Responses
和 Anthropic Messages，以及流式和普通 JSON 响应。

保留客户端已有工具。上游调用补充工具时，名称会映射到客户端唯一的
大小写匹配，例如 `bash → Bash`；没有对应工具则返回错误。
工具由客户端执行。
