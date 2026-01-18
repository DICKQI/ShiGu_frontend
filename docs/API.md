# API 接口文档

本文档详细介绍了前端 API 接口封装和类型定义。

## 谷子相关（Goods）

| 方法 | 路径 | 说明 | 封装文件 |
|------|------|------|----------|
| `GET` | `/api/goods/` | 列表查询（支持分页、筛选、搜索） | `src/api/goods.ts` |
| `GET` | `/api/goods/{id}/` | 详情查询 | `src/api/goods.ts` |
| `POST` | `/api/goods/` | 创建谷子 | `src/api/goods.ts` |
| `PUT` | `/api/goods/{id}/` | 更新谷子 | `src/api/goods.ts` |
| `DELETE` | `/api/goods/{id}/` | 删除谷子 | `src/api/goods.ts` |
| `POST` | `/api/goods/{id}/upload-main-photo/` | 上传/更新主图 | `src/api/goods.ts` |
| `POST` | `/api/goods/{id}/upload-additional-photos/` | 上传/更新补充图片（支持批量上传、标签管理） | `src/api/goods.ts` |
| `DELETE` | `/api/goods/{id}/additional-photos/{photoId}/` | 删除单张补充图片 | `src/api/goods.ts` |
| `DELETE` | `/api/goods/{id}/additional-photos/` | 批量删除补充图片 | `src/api/goods.ts` |

### 查询参数（`GET /api/goods/`）

- `ip` - IP 作品 ID
- `character` - 角色 ID
- `characters__in` - 多角色过滤（如：`5,6`）
- `category` - 品类 ID
- `status` - 状态（`in_cabinet`、`outdoor`、`sold`）
- `status__in` - 多状态过滤（如：`in_cabinet,sold`）
- `location` - 位置 ID
- `search` - 搜索关键词（模糊匹配）
- `page` - 页码（默认 1）
- `page_size` - 每页数量（默认 20）

---

## 位置相关（Location）

| 方法 | 路径 | 说明 | 封装文件 |
|------|------|------|----------|
| `GET` | `/api/location/tree/` | 获取位置树（树形结构） | `src/api/location.ts` |
| `GET` | `/api/location/nodes/` | 获取位置节点列表（扁平结构） | `src/api/location.ts` |
| `GET` | `/api/location/{id}/` | 获取位置详情 | `src/api/location.ts` |
| `POST` | `/api/location/nodes/` | 创建位置节点 | `src/api/location.ts` |
| `PUT` | `/api/location/nodes/{id}/` | 更新位置节点 | `src/api/location.ts` |
| `DELETE` | `/api/location/nodes/{id}/` | 删除位置节点 | `src/api/location.ts` |

---

## 元数据相关（Metadata）

### IP 作品（IP）

| 方法 | 路径 | 说明 | 封装文件 |
|------|------|------|----------|
| `GET` | `/api/ips/` | IP 作品列表 | `src/api/metadata.ts` |
| `POST` | `/api/ips/` | 创建 IP 作品 | `src/api/metadata.ts` |
| `GET` | `/api/ips/{id}/` | IP 作品详情 | `src/api/metadata.ts` |
| `PUT` | `/api/ips/{id}/` | 更新 IP 作品 | `src/api/metadata.ts` |
| `DELETE` | `/api/ips/{id}/` | 删除 IP 作品 | `src/api/metadata.ts` |
| `GET` | `/api/ips/{id}/characters/` | 获取 IP 下的角色列表 | `src/api/metadata.ts` |

### 角色（Character）

| 方法 | 路径 | 说明 | 封装文件 |
|------|------|------|----------|
| `GET` | `/api/characters/` | 角色列表 | `src/api/metadata.ts` |
| `POST` | `/api/characters/` | 创建角色 | `src/api/metadata.ts` |
| `GET` | `/api/characters/{id}/` | 角色详情 | `src/api/metadata.ts` |
| `PUT` | `/api/characters/{id}/` | 更新角色 | `src/api/metadata.ts` |
| `DELETE` | `/api/characters/{id}/` | 删除角色 | `src/api/metadata.ts` |

### 品类（Category）

| 方法 | 路径 | 说明 | 封装文件 |
|------|------|------|----------|
| `GET` | `/api/categories/` | 品类列表 | `src/api/metadata.ts` |
| `POST` | `/api/categories/` | 创建品类 | `src/api/metadata.ts` |
| `GET` | `/api/categories/{id}/` | 品类详情 | `src/api/metadata.ts` |
| `PUT` | `/api/categories/{id}/` | 更新品类 | `src/api/metadata.ts` |
| `DELETE` | `/api/categories/{id}/` | 删除品类 | `src/api/metadata.ts` |

---

## BGM 导入相关

| 方法 | 路径 | 说明 | 封装文件 |
|------|------|------|----------|
| `POST` | `/api/bgm/search-characters/` | 搜索 Bangumi 作品并获取角色列表 | `src/api/metadata.ts` |
| `POST` | `/api/bgm/create-characters/` | 批量创建 IP 和角色（支持自动创建 IP） | `src/api/metadata.ts` |

### BGM 搜索请求

```typescript
{
  "query": "作品名称"
}
```

### BGM 批量创建请求

```typescript
{
  "items": [
    {
      "ip_name": "作品名称",
      "character_name": "角色名称",
      "subject_type": 2  // 可选：1=书籍, 2=动画, 3=音乐, 4=游戏, 6=三次元/特摄
    }
  ]
}
```

---

## 类型定义

所有 API 类型定义在 `src/api/types.ts` 中，包括：

- `GoodsListItem` - 谷子列表项
- `GoodsDetail` - 谷子详情
- `StorageNode` - 位置节点
- `IP` - IP 作品
- `Character` - 角色
- `Category` - 品类
- `PaginatedResponse<T>` - 分页响应
- `BGMSearchResponse` - BGM 搜索响应
- `BGMCreateCharactersResponse` - BGM 批量创建响应

> **注意**：具体 API 规范以后端 `api.md` 为准，前端接口封装在 `src/api/*` 中。

## 错误处理

| HTTP 状态码 | 说明 | 前端处理 |
|------------|------|----------|
| `200` | 成功 | 正常返回数据 |
| `400` | 请求错误 | 显示错误消息 |
| `404` | 资源未找到 | 显示 404 错误提示 |
| `409` | 冲突（如重复创建） | 显示友好的冲突提示 |
| `429` | 请求限流 | 显示限流提示："搜索太快了，请稍后再试" |
| `500` | 服务器错误 | 显示服务器错误提示 |

错误处理逻辑在 `src/utils/request.ts` 的响应拦截器中实现。

## HTTP 请求配置

HTTP 请求封装在 `src/utils/request.ts` 中，核心特性包括：

- **基础配置**：超时时间 10s，默认 `Content-Type: application/json`
- **运行时后端地址配置**：
  - 默认地址优先顺序：本地存储 `pickgoods_api_base_url`（兼容旧键 `shigu_api_base_url`） → 环境变量 `VITE_API_BASE_URL` → `protocol://hostname:8000`
  - 提供 `updateBaseURL`、`getCurrentBaseURL`、`resetBaseURL` 等工具函数，供 `Settings` 页面调用
  - 每次请求前都会重新计算 `baseURL`，确保设置页修改后立即生效
- **请求拦截**：
  - 自动处理 FormData（移除 `Content-Type` 让浏览器自动设置 boundary）
  - 预留 Token 注入位置，可按需扩展认证逻辑
- **响应拦截**：统一错误处理（429 限流、409 冲突、404 未找到等），通过 `ElMessage` 提示用户

### 开发服务器代理

开发服务器已配置代理，无需手动处理跨域：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
},
```
