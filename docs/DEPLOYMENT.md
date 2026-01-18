# 部署说明

本文档介绍了如何构建和部署拾谷 PickGoods 前端应用。

## 📦 构建生产版本

### 基础构建

```bash
# 构建生产版本（包含类型检查）
pnpm build

# 仅构建，不进行类型检查（更快）
pnpm build-only
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
# 本地预览生产构建结果
pnpm preview
```

## 🚀 部署选项

### 选项 1：静态文件服务器（推荐）

将 `dist/` 目录部署到静态文件服务器（如 Nginx、Apache、Vercel、Netlify 等）。

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 选项 2：CDN 部署

将 `dist/` 目录上传到 CDN（如阿里云 OSS、腾讯云 COS、AWS S3 等）。

### 选项 3：容器化部署

使用 Docker 构建镜像：

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ⚙️ 环境变量配置

生产环境需配置 `VITE_API_BASE_URL` 环境变量，指向后端 API 服务地址。

### 方式 1：构建时设置

```bash
VITE_API_BASE_URL=https://api.your-domain.com pnpm build
```

### 方式 2：运行时配置（需修改代码）

通过 `window.__ENV__` 等全局变量注入配置。

> **注意**：
> - 开发环境下，`vite.config.ts` 已配置代理，将 `/api` 请求转发至后端服务，无需手动处理跨域。
> - 环境变量仅用于提供**默认后端地址**，实际运行时会优先使用设置页中配置并保存在本地存储的地址。
