# 设计规范与主题配置

本文档介绍了拾谷 PickGoods 的设计规范、主题配置和样式定制方法。

## 🎨 设计规范

### 主题风格：香槟镭射（Champagne Laser）

| 颜色 | 色值 | 用途 |
|------|------|------|
| **主色** | `#D4AF37`（香槟金） | 边框、图标高亮、强调色 |
| **辅助色** | `#F5F5F7`（明亮灰） | 卡片背景、次要背景 |
| **点缀色** | `#A29BFE`（镭射紫） | 主要按钮、渐变效果、链接色 |

### 视觉规范

- **圆角规范**：卡片 20px，按钮 8px，输入框 4px
- **间距规范**：基于 8px 网格系统
- **响应式断点**：移动端 < 768px，平板 768px - 1024px，PC 端 > 1024px
- **性能目标**：首屏加载位置树 + 谷子列表 ≤ 1.5s（内网环境）

### 交互细节

- ✅ 香槟金边框与高亮效果
- ✅ 镭射动效与渐变背景
- ✅ 毛玻璃效果（分页器、下拉菜单）
- ✅ 流畅的过渡动画
- ✅ 友好的加载状态与错误提示

## ⚙️ 主题配置

### 主题文件结构

主题配置集中在以下文件中：

| 文件 | 说明 |
|------|------|
| `src/styles/variables.css` | CSS 变量定义（主题色、间距、圆角等） |
| `src/styles/element-plus-theme.css` | Element Plus 组件主题定制 |

### 自定义主题

1. **修改 CSS 变量**：编辑 `src/styles/variables.css` 中的 CSS 变量
2. **定制 Element Plus**：编辑 `src/styles/element-plus-theme.css` 中的组件样式

### CSS 变量示例

```css
/* src/styles/variables.css */
:root {
  /* 主题色 */
  --color-primary: #D4AF37;      /* 香槟金 */
  --color-secondary: #F5F5F7;    /* 明亮灰 */
  --color-accent: #A29BFE;       /* 镭射紫 */
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 20px;
}
```

### 静态资源

| 目录 | 说明 |
|------|------|
| `public/` | 静态资源目录（图片、图标等），构建时直接复制到 `dist/` |
| `src/assets/` | 可通过模块系统导入的资源（建议使用相对路径） |

## 🎨 组件样式定制

### 组件样式规则

- **Scoped CSS**：组件样式使用 `<style scoped>`，避免样式污染
- **CSS 变量**：优先使用 CSS 变量，便于主题切换
- **响应式设计**：使用 CSS 媒体查询适配不同屏幕尺寸

### 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) {
  /* 移动端样式 */
}

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 平板样式 */
}

/* PC 端 */
@media (min-width: 1024px) {
  /* PC 端样式 */
}
```

### Element Plus 主题定制

Element Plus 主题定制通过覆盖 CSS 变量实现：

```css
/* src/styles/element-plus-theme.css */
:root {
  --el-color-primary: #D4AF37;
  --el-color-primary-light-3: #E5C558;
  --el-color-primary-dark-2: #B8951F;
  
  --el-border-radius-base: 8px;
  --el-border-radius-small: 4px;
}
```
