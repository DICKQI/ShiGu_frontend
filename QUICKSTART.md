# 快速启动指南

## 0. 安装 pnpm（如果还没有）

```bash
npm install -g pnpm
# 或访问 https://pnpm.io/installation 查看其他安装方式
```

## 1. 安装依赖

```bash
pnpm install
```

这将安装以下主要依赖：
- Vue 3 + TypeScript
- Element Plus + Icons
- Pinia (状态管理)
- Vue Router (路由)
- Axios (HTTP 客户端)
- lodash-es (工具函数)

## 2. 配置环境变量

确保 `.env` 文件存在并配置了正确的后端 API 地址：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5173`

## 4. 确保后端服务运行

确保 Django 后端服务已启动并运行在 `http://127.0.0.1:8000`

## 5. 功能测试

### 云展柜页面 (`/showcase`)
- 测试搜索功能（输入关键词，观察防抖效果）
- 测试筛选功能（选择 IP、角色、品类等）
- 点击谷子卡片查看详情抽屉

### 位置管理页面 (`/location`)
- 查看位置树结构
- 点击位置节点查看详情
- 测试新增/编辑/删除位置

### 资产录入页面 (`/goods/new`)
- 填写表单
- 测试 IP 和角色的联动选择
- 提交表单

## 常见问题

### 1. 依赖安装失败
如果遇到依赖安装问题，尝试：
```bash
pnpm store prune
pnpm install
```

### 2. API 请求失败
- 检查后端服务是否运行
- 检查 `.env` 文件中的 `VITE_API_BASE_URL` 是否正确
- 检查浏览器控制台的网络请求

### 3. 类型错误
运行类型检查：
```bash
pnpm type-check
```

### 4. 样式问题
确保所有样式文件都已正确导入：
- `src/styles/variables.css`
- `src/styles/index.css`
- `src/styles/element-plus-theme.css`

## 下一步

1. 根据实际后端 API 调整接口地址
2. 配置图片上传功能
3. 从后端 API 获取 IP、角色、品类等元数据（目前使用模拟数据）
4. 根据实际需求调整 Element Plus 主题色
5. 添加用户认证功能（如需要）

