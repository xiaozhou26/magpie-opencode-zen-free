# OpenCode Zen Free · Magpie 插件

独立的 Magpie / OpenCode 供应商插件的免费模型发现和请求兼容逻辑实现，直接连接 `https://opencode.ai/zen/v1`。

供应商 ID：`opencode-zen-free`。插件按 [Magpie 插件开发文档](https://usemagpie.ai/docs/zh/plugins) 实现 `config`、`auth`、`provider.models` 和 `chat.headers` 钩子。

## 在 Magpie 中安装

### 从 GitHub 安装

```sh
magpie plugin add github:xiaozhou26/magpie-opencode-zen-free#v0.1.0
magpie plugin login opencode-zen-free
```

密钥填写 `public`。Magpie 图形界面「添加插件」也接受上面的 `github:…` 地址。

### 从本地目录安装

1. 打开 **插件 → 添加插件**，填入文件夹路径：

   ```text
   D:\magpie-opencode-zen-free
   ```

2. 在 **OpenCode Zen Free** 供应商一行点击 **登录**，选择 **Zen 免费访问（密钥填写 public）**。如果 Magpie 显示密钥输入框，填入 `public`；插件固定保存并使用该公开凭证。
3. 刷新模型列表，在模型选择器中选择 `opencode-zen-free/<模型 ID>`。

插件初次加载会提供少量离线初始模型；登录后读取 Zen 的实时模型列表和官方能力目录。添加目录本身即可加载，安装过程无需 `npm install` 或编译。

### PowerShell 命令

当前机器的 Magpie 可执行文件位于下载目录：

```powershell
$magpie = "$env:USERPROFILE\Downloads\magpie-windows-amd64.exe"
& $magpie plugin add 'D:\magpie-opencode-zen-free'
& $magpie plugin login opencode-zen-free
& $magpie plugin --json
& $magpie provider test opencode-zen-free big-pickle
```

Windows 桌面版可执行文件可能直接返回提示符；图形界面可查看加载与登录结果。已安装 `magpie` 命令的机器可以直接使用该命令。

agent 使用的完整模型名例如：

```text
opencode-zen-free/big-pickle
opencode-zen-free/space-bunny-free
opencode-zen-free/muse-spark-1.3-contributor-free
```

模型是否实际可用以当次 Zen 响应为准；免费模型会更新、下架或限流。

## 实现范围

- 模型发现同时使用 Zen `/models`、`models.opencode.ai/api.json` 和 Zen 官方端点文档。
- 展示实时列表中名称含 `free` 或输入、输出价格均为零的模型；排除已弃用模型和不支持的协议。
- 支持 Chat Completions、OpenAI Responses、Anthropic Messages；由 Magpie 负责 agent 与原生协议之间的转换。
- 自动添加免费通道所需的 `bash`、`edit`、`glob`、`grep`、`read` 工具声明，并保留客户端已有的同名定义。插件只传递声明；工具执行由 agent 负责。使用自有工具集的客户端应处理这些工具名称，缺失的工具实现可能导致执行失败。
- 上游统一使用流式请求。客户端请求 `stream: true` 时直接传递响应流；普通请求将 SSE 合并成相应协议的 JSON，保留文本、思考、工具调用和 usage。
- 保留会话标识、取消信号、HTTP 错误状态和 `Retry-After`；插件自身不轮换身份或重试生成。Magpie 按自己的策略处理失败。
- 发现服务暂时失败时保留已确认的数据，并使用 Magpie 的回退标记。插件进程重启后依靠离线初始模型和重新发现恢复。
- `auth.usage` 只报告免费套餐名称，额度窗口为空；Zen 未提供可供此插件读取的匿名剩余额度接口。
- SystemOne 模型（例如 `jev-1.13-free`）不在本插件的可用模型列表中。

本插件固定使用 `public`，并且只允许已发现的免费模型。登录不会读取 `opencode2api` 的本地 Key、Zen 付费 Key、Go Key 或原有配置文件。

## 选项

默认设置即可直连 Zen。Magpie 的代理功能会作用于插件的标准 `fetch`，可在供应商或账号上设置代理。

插件支持以下可选设置，主要用于自托管兼容服务与本地测试：

| 选项         | 默认值                                |
| ------------ | ------------------------------------- |
| `baseURL`    | `https://opencode.ai/zen/v1`          |
| `catalogURL` | `https://models.opencode.ai/api.json` |
| `docsURL`    | Zen 官方 GitHub `zen.mdx` 地址        |

在 Magpie `plugins.json` 对应插件项的 `options` 中设置：

```json
{
  "plugins": [
    {
      "spec": "D:\\magpie-opencode-zen-free",
      "options": {
        "baseURL": "https://opencode.ai/zen/v1"
      }
    }
  ]
}
```

在现有文件中合并对应插件项。登录记录由 Magpie 保存到其配置目录内的 `plugin-auth.json`。本插件不额外写入凭证文件。

## 开发与验证

Node.js 22+ 或 Bun 可运行测试：

```powershell
Set-Location D:\magpie-opencode-zen-free
npm test
bun test
npm run check
npm run smoke
npm run smoke -- --model muse-spark-1.3-contributor-free --stream
```

`npm test` 使用本地 HTTP 服务和合成 SSE，不访问真实供应商。`npm run smoke` 读取实时目录并发出一条短请求，输出模型列表、HTTP 状态和响应摘要；实际推理失败时返回非零退出码。

在 Magpie 中修改后，将插件关闭再打开；终端命令每次都重新加载当前文件。

### 独立 Magpie 测试目录

下面命令仅影响当前 PowerShell 进程的环境变量，Magpie 配置写入临时目录。`$magpie` 在覆盖用户目录之前保存：

```powershell
$magpie = "$env:USERPROFILE\Downloads\magpie-windows-amd64.exe"
$sandbox = Join-Path $env:TEMP ('zen-free-test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force $sandbox | Out-Null
$env:HOME = $sandbox
$env:USERPROFILE = $sandbox
$env:XDG_CONFIG_HOME = Join-Path $sandbox '.config'
$env:XDG_CACHE_HOME = Join-Path $sandbox '.cache'
$env:APPDATA = Join-Path $sandbox 'AppData\Roaming'
$env:LOCALAPPDATA = Join-Path $sandbox 'AppData\Local'
$env:MAGPIE_ADDR = '127.0.0.1:3499'
$env:MAGPIE_PLUGIN_MARKET = 'off'
& $magpie plugin add 'D:\magpie-opencode-zen-free'
& $magpie plugin login opencode-zen-free
& $magpie provider test opencode-zen-free big-pickle
```

## 文件与来源

- `index.mjs`：Magpie/OpenCode 插件入口、登录、请求和模型刷新。
- `models.mjs`：免费筛选、协议发现、能力映射和离线初始模型。
- `stream.mjs`：三种协议的 SSE 聚合。
- `*.test.mjs`：本地回归测试。
- `smoke.mjs`：可重复运行的真实上游验证。

参考实现：`opencode2api/internal/gateway/upstream.go`、`internal/models/discovery.go`、`internal/models/pricing.go`、`internal/protocol/`。本目录独立运行，原 Go 项目保持不变。
