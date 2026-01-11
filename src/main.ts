
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

import App from './App.vue'
import router from './router'
import './styles/index.css'
import './styles/element-plus-theme.css'

// 初始化 StatusBar（仅在 Capacitor 环境中）
if (Capacitor.isNativePlatform()) {
  // 异步初始化状态栏，确保配置正确应用
  StatusBar.setOverlaysWebView({ overlay: false }).then(() => {
    // 设置状态栏样式为浅色（深色文字，适合白色背景）
    StatusBar.setStyle({ style: Style.Light })
    // 设置状态栏背景色为白色，与导航栏背景色一致
    StatusBar.setBackgroundColor({ color: '#FFFFFF' })
  }).catch((err) => {
    console.warn('StatusBar 初始化失败:', err)
  })
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
