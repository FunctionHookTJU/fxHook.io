# GitHub 在线 VS Code 使用指南

GitHub上使用在线VS Code主要有两种方式，分别是GitHub Codespaces和vscode.dev，前者功能完整，后者更侧重轻量编辑，以下是详细使用攻略：

## 1. GitHub Codespaces（完整云端VS Code环境）

1. **打开仓库：** 进入任意GitHub仓库，点击界面中的"Code"按钮，选择"Open with Codespaces"，再点击"+"创建新的云端环境。
2. **等待加载：** 首次创建需等待几秒到几分钟，加载完成后会呈现完整VS Code界面，包含编辑器、终端、插件市场等功能。
3. **开发操作：** 可像本地VS Code一样编辑文件、通过终端执行命令、调试代码；还能直接在左侧源代码管理面板提交、推送Git更改。
4. **环境管理：** 关闭浏览器后环境会自动暂停，再次打开可恢复工作；也可在GitHub仓库的Codespaces列表中手动删除或重启环境。

## 2. vscode.dev（轻量在线编辑GitHub仓库）

1. **快速打开仓库：** 直接通过URL访问，格式为 `https://vscode.dev/github/<用户名>/<仓库名>` ，比如 `https://vscode.dev/github/microsoft/vscode` 就能打开微软的VS Code仓库。
2. **浏览器插件快捷打开：** 安装Chrome或Edge的vscode.dev扩展，在浏览器搜索栏输入"code"，再输入仓库名（如 `microsoft/vscode` ），即可快速打开对应仓库。
3. **内部切换仓库：** 若已在vscode.dev页面，点击状态栏左下角的远程指示器，选择"打开远程存储库..."，就能切换到其他GitHub仓库。
4. **基础编辑：** 支持语法高亮、搜索文件、安装轻量扩展等，但无终端和代码运行环境，适合快速浏览和轻量修改代码。
