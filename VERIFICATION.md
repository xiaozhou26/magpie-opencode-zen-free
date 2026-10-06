# 验证记录

日期：2026-10-06。上游统一使用公开凭证 `public`。

## 本地测试

- Node.js 24.16.0：53 个测试通过。
- Bun 1.3.14：53 个测试通过。
- JavaScript 语法检查通过。
- `npm pack --dry-run` 确认入口和全部运行时模块均包含在包中。

覆盖免费模型筛选、协议识别、原生请求格式、会话 ID、工具保留、流式与普通响应、断流、错误事件、取消传播、模型目录失败回退及 SystemOne 排除。

## Magpie 集成

在独立临时配置目录 `%TEMP%\opencode-zen-free-magpie-test` 中验证，保持用户日常 Magpie 配置不变。

- 目录插件成功加载并使用 `public` 登录。
- `magpie plugin --json` 显示供应商已登录，发现 10 个免费模型。
- `magpie provider test opencode-zen-free big-pickle`：Chat 检查通过。
- `magpie provider test opencode-zen-free muse-spark-1.3-contributor-free`：Responses 检查通过。
- 网关 `/v1/chat/completions` → Big Pickle：HTTP 200，文本 `OK`。
- 网关 `/v1/messages` → Muse Spark 原生 Responses：HTTP 200，Anthropic 格式文本 `OK`。
- 浏览器检查插件页面、供应商详情、模型刷新、网关模型列表、路由和用量页面；两次网关调用正确出现在用量页面。
- 插件停用、重新启用后恢复加载。

## 真实模型响应

Magpie 页面测试的当次结果：

| 模型 | 结果 |
| --- | --- |
| big-pickle | 成功 |
| muse-spark-1.3-contributor-free | 成功 |
| mimo-v2.6-flash-free | 成功 |
| space-bunny-free | 成功 |
| longcat-2.5-preview-free | 成功 |
| nemotron-3.5-lightning-free | 成功 |
| ling-3.0-flash-fin-free | 上游 400：Endpoint is unavailable |
| nemotron-3-ultra-free | 流内 503：Service temporarily overloaded |
| fledge-alpha-free | 上游 403：This model is not available in your country |
| ling-3.1-flash-free | 上游 429：Endpoint is unavailable |

这些结果描述验证时刻的上游状态。模型目录可见与当次推理成功是两个独立结果。

插件全部源码位于独立目录 `D:\magpie-opencode-zen-free`。
