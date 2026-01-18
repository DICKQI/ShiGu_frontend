# 移动端开发（Capacitor）

本项目使用 [Capacitor](https://capacitorjs.com/) 将 Vue 3 应用打包为原生移动应用，支持 Android 和 iOS 平台。

## 什么是 Capacitor？

Capacitor 是由 Ionic 团队开发的跨平台应用运行时，允许您使用 Web 技术（HTML、CSS、JavaScript/TypeScript）构建原生移动应用，并提供了丰富的原生 API 桥接能力。

**核心优势**：
- ✅ **一次开发，多端运行**：同一套代码可同时构建 Android 和 iOS 应用
- ✅ **原生性能**：使用原生 WebView 容器，性能接近原生应用
- ✅ **丰富的插件生态**：支持访问相机、文件系统、网络状态等原生功能
- ✅ **渐进式迁移**：现有 Web 应用可无缝迁移，无需重写代码
- ✅ **与框架无关**：支持 Vue、React、Angular 等主流前端框架

## 前置要求

### Android 开发环境

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| **Java JDK** | ≥ 17 | 推荐使用 OpenJDK 17 或 Oracle JDK 17 |
| **Android Studio** | ≥ 最新稳定版 | 包含 Android SDK 和 Gradle |
| **Android SDK** | API Level 33+ | 通过 Android Studio SDK Manager 安装 |
| **Gradle** | 8.0+ | 通常随 Android Studio 自动安装 |

**安装步骤**：

1. **安装 Java JDK 17**
   - Windows：下载并安装 [Oracle JDK](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) 或 [OpenJDK](https://adoptium.net/)
   - macOS：使用 Homebrew：`brew install openjdk@17`
   - Linux：使用包管理器：`sudo apt install openjdk-17-jdk`

2. **安装 Android Studio**
   - 下载并安装 [Android Studio](https://developer.android.com/studio)
   - 启动 Android Studio，通过 SDK Manager 安装：
     - Android SDK Platform 33+
     - Android SDK Build-Tools
     - Android SDK Platform-Tools
     - Android Emulator（如需要）

3. **配置环境变量**（Windows）
   ```powershell
   # 添加到系统环境变量
   ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   JAVA_HOME=C:\Program Files\Java\jdk-17
   PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
   ```

4. **配置环境变量**（macOS/Linux）
   ```bash
   # 添加到 ~/.zshrc 或 ~/.bashrc
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   # export ANDROID_HOME=$HOME/Android/Sdk        # Linux
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
   ```

### iOS 开发环境（仅 macOS）

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| **macOS** | ≥ 13.0 (Ventura) | iOS 开发仅支持 macOS 系统 |
| **Xcode** | ≥ 15.0 | 包含 iOS SDK 和模拟器 |
| **CocoaPods** | ≥ 1.13.0 | iOS 依赖管理工具 |
| **Node.js** | ≥ 20.19.0 | 项目运行环境 |

**安装步骤**：

1. **安装 Xcode**
   - 从 App Store 安装 [Xcode](https://apps.apple.com/app/xcode/id497799835)
   - 启动 Xcode，接受许可协议
   - 通过 Xcode → Preferences → Components 安装 iOS 模拟器

2. **安装 Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

3. **安装 CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## 项目配置

### Capacitor 配置文件

项目根目录的 `capacitor.config.ts` 文件包含 Capacitor 的核心配置：

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pickgoods.app',        // 应用唯一标识符（反向域名）
  appName: '拾谷',                 // 应用显示名称
  webDir: 'dist',                 // Web 构建输出目录
  server: {
    androidScheme: 'http',        // Android 使用的 URL Scheme
    cleartext: true               // 允许 HTTP 连接（开发环境）
  }
};

export default config;
```

**配置说明**：
- `appId`：应用的唯一标识符，用于区分不同的应用。建议使用反向域名格式（如 `com.yourcompany.appname`）
- `appName`：应用在设备上显示的名称
- `webDir`：Vue 构建后的输出目录，Capacitor 会将此目录内容复制到原生项目中
- `server.androidScheme`：Android 使用的 URL Scheme，生产环境建议改为 `https`
- `server.cleartext`：允许 HTTP 连接（仅开发环境，生产环境应禁用）

### 已安装的 Capacitor 插件

项目已集成以下 Capacitor 插件：

| 插件 | 版本 | 用途 |
|------|------|------|
| `@capacitor/core` | ^8.0.0 | Capacitor 核心库 |
| `@capacitor/android` | ^8.0.0 | Android 平台支持 |
| `@capacitor/status-bar` | ^8.0.0 | 状态栏样式控制 |
| `@capacitor/network` | ^8.0.0 | 网络状态检测 |
| `@capacitor/camera` | ^8.0.0 | 原生相机访问（拍照、选择照片） |
| `@capacitor-community/http` | ^1.4.1 | HTTP 请求增强（支持 CORS） |

## Android 平台

### 1. 初始化 Android 平台（首次设置）

如果项目中还没有 `android/` 目录，需要初始化 Android 平台：

```bash
# 先构建 Web 应用
pnpm build

# 添加 Android 平台
npx cap add android

# 同步文件（将 Web 构建产物复制到 Android 项目）
npx cap sync android
```

### 2. 开发流程

**步骤 1：构建 Web 应用**

每次修改 Vue 代码后，需要重新构建并同步到原生项目：

```bash
# 构建生产版本
pnpm build

# 同步到 Android 项目（将 dist/ 目录内容复制到 android/app/src/main/assets/public/）
npx cap sync android
```

**步骤 2：在 Android Studio 中打开项目**

```bash
# 使用 Android Studio 打开 Android 项目
npx cap open android
```

或者手动打开：
1. 启动 Android Studio
2. 选择 "Open an Existing Project"
3. 选择项目根目录下的 `android/` 文件夹

**步骤 3：运行应用**

- **在模拟器中运行**：
  1. 在 Android Studio 顶部工具栏选择模拟器
  2. 点击绿色的 "Run" 按钮（或按 `Shift + F10`）

- **在真实设备上运行**：
  1. 启用设备的"开发者选项"和"USB 调试"
  2. 使用 USB 连接设备到电脑
  3. 在 Android Studio 中选择设备，点击 "Run"

**步骤 4：调试**

- **Chrome DevTools**：
  1. 在 Android Studio 中运行应用
  2. 打开 Chrome 浏览器，访问 `chrome://inspect`
  3. 找到设备中的应用，点击 "inspect"

- **Android Studio Logcat**：
  - 在 Android Studio 底部打开 "Logcat" 标签
  - 可以查看应用的日志输出

### 3. 构建 APK/AAB

**构建调试版 APK**：

```bash
# 方法 1：使用 Gradle 命令行
cd android
./gradlew assembleDebug  # macOS/Linux
# gradlew.bat assembleDebug  # Windows

# 生成的 APK 位置：android/app/build/outputs/apk/debug/app-debug.apk
```

**构建发布版 AAB（用于 Google Play）**：

1. 在 Android Studio 中：
   - 菜单栏 → Build → Generate Signed Bundle / APK
   - 选择 "Android App Bundle"
   - 创建或选择签名密钥（Keystore）
   - 选择 Release 构建类型
   - 完成构建

2. 使用 Gradle 命令行：
   ```bash
   cd android
   ./gradlew bundleRelease
   # 生成的 AAB 位置：android/app/build/outputs/bundle/release/app-release.aab
   ```

### 4. Android 特定配置

**AndroidManifest.xml**（`android/app/src/main/AndroidManifest.xml`）：

```xml
<!-- 权限配置（如需要） -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />

<!-- 应用图标和启动画面配置 -->
<!-- 可在 android/app/src/main/res/ 目录下配置 -->
```

**build.gradle**（`android/app/build.gradle`）：

```gradle
android {
    defaultConfig {
        applicationId "com.pickgoods.app"  // 应用包名
        minSdkVersion 22                // 最低支持的 Android 版本
        targetSdkVersion 34             // 目标 Android 版本
        versionCode 1                   // 版本号（整数）
        versionName "1.0"               // 版本名称（字符串）
    }
}
```

## iOS 平台

### 1. 初始化 iOS 平台（首次设置）

如果项目中还没有 `ios/` 目录，需要初始化 iOS 平台：

```bash
# 先构建 Web 应用
pnpm build

# 添加 iOS 平台（仅 macOS）
npx cap add ios

# 安装 CocoaPods 依赖
cd ios/App
pod install
cd ../..

# 同步文件（将 Web 构建产物复制到 iOS 项目）
npx cap sync ios
```

### 2. 开发流程

**步骤 1：构建 Web 应用**

每次修改 Vue 代码后，需要重新构建并同步到原生项目：

```bash
# 构建生产版本
pnpm build

# 同步到 iOS 项目（将 dist/ 目录内容复制到 ios/App/App/public/）
npx cap sync ios
```

**步骤 2：在 Xcode 中打开项目**

```bash
# 使用 Xcode 打开 iOS 项目
npx cap open ios
```

或者手动打开：
1. 启动 Xcode
2. 选择 "Open a project or file"
3. 选择项目根目录下的 `ios/App/App.xcworkspace` 文件（注意：必须是 `.xcworkspace`，不是 `.xcodeproj`）

**步骤 3：配置签名**

1. 在 Xcode 中选择项目（左侧导航栏最上方）
2. 选择 "Signing & Capabilities" 标签
3. 选择你的 Team（需要 Apple Developer 账号）
4. Xcode 会自动生成 Provisioning Profile

**步骤 4：运行应用**

- **在模拟器中运行**：
  1. 在 Xcode 顶部工具栏选择模拟器（如 iPhone 15 Pro）
  2. 点击绿色的 "Run" 按钮（或按 `Cmd + R`）

- **在真实设备上运行**：
  1. 使用 USB 连接设备到 Mac
  2. 在设备上信任此电脑
  3. 在 Xcode 中选择设备，点击 "Run"
  4. 首次运行需要在设备上：设置 → 通用 → VPN 与设备管理 → 信任开发者

**步骤 5：调试**

- **Safari Web Inspector**：
  1. 在 Mac 上打开 Safari
  2. 菜单栏 → 开发 → [设备名称] → [应用名称]
  3. 可以查看控制台、网络请求、调试代码

- **Xcode Console**：
  - 在 Xcode 底部打开 Console 标签
  - 可以查看应用的日志输出

### 3. 构建 IPA

**构建发布版 IPA（用于 App Store）**：

1. **Archive 构建**：
   - 在 Xcode 中选择 "Any iOS Device" 作为目标
   - 菜单栏 → Product → Archive
   - 等待构建完成

2. **上传到 App Store**：
   - 在 Archive 窗口点击 "Distribute App"
   - 选择 "App Store Connect"
   - 选择上传方式（自动或手动）
   - 完成上传

**构建 Ad Hoc 或 Enterprise 版本**：

在 Archive 窗口选择相应的分发方式。

### 4. iOS 特定配置

**Info.plist**（`ios/App/App/Info.plist`）：

```xml
<!-- 权限说明（如需要） -->
<key>NSCameraUsageDescription</key>
<string>需要访问相机以拍摄藏品照片</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册以选择照片</string>
```

**Podfile**（`ios/App/Podfile`）：

```ruby
platform :ios, '13.0'  # 最低支持的 iOS 版本
```

## 开发与调试

### Live Reload（热重载）

Capacitor 支持开发时的 Live Reload，无需每次手动构建和同步：

**方式 1：使用 Capacitor CLI（推荐）**

```bash
# 终端 1：启动 Vite 开发服务器
pnpm dev

# 终端 2：启动 Capacitor Live Reload（Android）
npx cap run android -l --external

# 终端 2：启动 Capacitor Live Reload（iOS）
npx cap run ios -l --external
```

**方式 2：配置 capacitor.config.ts**

```typescript
const config: CapacitorConfig = {
  // ... 其他配置
  server: {
    url: 'http://192.168.1.100:5173',  // 你的本机 IP:Vite 端口
    cleartext: true
  }
};
```

然后在原生应用中运行，代码修改会自动刷新。

### 常用命令

```bash
# 同步 Web 构建产物到原生项目
npx cap sync                    # 同步所有平台
npx cap sync android            # 仅同步 Android
npx cap sync ios                # 仅同步 iOS

# 打开原生项目
npx cap open android            # 在 Android Studio 中打开
npx cap open ios                # 在 Xcode 中打开

# 复制 Web 构建产物（不同步插件）
npx cap copy android
npx cap copy ios

# 更新原生依赖
npx cap update                  # 更新所有平台
npx cap update android
npx cap update ios

# 运行应用（需要已配置开发环境）
npx cap run android
npx cap run ios
```

## 构建与发布

### 构建流程

1. **构建 Web 应用**：
   ```bash
   # 确保环境变量正确
   VITE_API_BASE_URL=https://api.your-domain.com pnpm build
   ```

2. **同步到原生项目**：
   ```bash
   npx cap sync android  # 或 npx cap sync ios
   ```

3. **在原生 IDE 中构建**：
   - Android：在 Android Studio 中构建 APK/AAB
   - iOS：在 Xcode 中 Archive 并导出 IPA

### 版本管理

**Android（`android/app/build.gradle`）**：

```gradle
android {
    defaultConfig {
        versionCode 2        // 每次发布递增（整数）
        versionName "1.0.1"  // 版本号（字符串）
    }
}
```

**iOS（`ios/App/App.xcodeproj/project.pbxproj` 或通过 Xcode）**：

- 在 Xcode 中：选择项目 → General → Identity → Version / Build
- Version：版本号（如 1.0.1）
- Build：构建号（如 2，每次递增）

**同步版本号**：

可以在 `package.json` 中管理版本号，通过脚本同步到原生项目。

## 注意事项

### 1. 网络请求

- **开发环境**：`capacitor.config.ts` 中配置了 `cleartext: true`，允许 HTTP 请求
- **生产环境**：应使用 HTTPS，或配置网络安全策略（Android）和 App Transport Security（iOS）

### 2. API 地址配置

生产环境应用需要使用真实的 API 地址，不能使用 `localhost` 或 `127.0.0.1`。

**方式 1：构建时配置环境变量**
```bash
VITE_API_BASE_URL=https://api.your-domain.com pnpm build
npx cap sync android
```

**方式 2：在原生代码中配置**
- Android：可以在 `MainActivity.java` 中注入全局变量
- iOS：可以在 `AppDelegate.swift` 中注入全局变量

### 3. 状态栏配置

项目已在 `src/main.ts` 中配置了状态栏样式：

```typescript
import { StatusBar, Style } from '@capacitor/status-bar'

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light })  // 浅色状态栏（深色文字）
  StatusBar.setBackgroundColor({ color: '#FFFFFF' })  // 白色背景
}
```

### 4. 安全区域适配

项目已处理了 iOS 和 Android 的安全区域（Safe Area）：

- 使用 CSS `env(safe-area-inset-top)` 适配状态栏
- 在 `src/components/Layout.vue` 中处理了导航栏的 padding

### 5. 插件使用

使用 Capacitor 插件前，需要：

1. **安装插件**：
   ```bash
   pnpm add @capacitor/plugin-name
   ```

2. **同步到原生项目**：
   ```bash
   npx cap sync
   ```

3. **在代码中使用**：
   ```typescript
   import { PluginName } from '@capacitor/plugin-name'
   
   // 使用插件
   await PluginName.method()
   ```

### 6. 相机权限配置

项目已集成 Capacitor Camera 插件，需要在原生项目中配置相机权限：

**Android（`android/app/src/main/AndroidManifest.xml`）**：
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

**iOS（`ios/App/App/Info.plist`）**：
```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机以拍摄藏品照片</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册以选择照片</string>
```

### 7. 性能优化

- **图片优化**：使用 WebP 格式，启用懒加载
- **代码分割**：Vite 已自动进行代码分割
- **资源压缩**：生产构建已自动压缩 JS/CSS
- **缓存策略**：配置 Service Worker（如需要）

## 常见问题

### Q1: Android 构建失败，提示 "SDK location not found"？

**A**: 配置 `ANDROID_HOME` 环境变量，指向 Android SDK 安装目录。

### Q2: iOS 构建失败，提示 "No such module 'Capacitor'"？

**A**: 运行 `cd ios/App && pod install && cd ../..` 安装 CocoaPods 依赖。

### Q3: 应用无法连接到后端 API？

**A**: 
- 检查 `VITE_API_BASE_URL` 是否正确配置
- 确保使用 HTTPS 或配置网络安全策略
- 检查设备网络连接

### Q4: 状态栏样式不正确？

**A**: 
- 检查 `src/main.ts` 中的状态栏配置
- 确保已安装 `@capacitor/status-bar` 插件
- 运行 `npx cap sync` 同步插件

### Q5: Live Reload 不工作？

**A**: 
- 确保设备和电脑在同一网络
- 检查防火墙设置
- 使用 `npx cap run -l --external` 启动，确保使用了正确的 IP 地址

### Q6: Android Studio 提示 Gradle 版本不匹配？

**A**: 
- 更新 Android Studio 到最新版本
- 或在 `android/gradle/wrapper/gradle-wrapper.properties` 中指定 Gradle 版本

### Q7: Xcode 提示签名错误？

**A**: 
- 在 Xcode 中选择正确的 Team
- 确保 Apple Developer 账号已激活
- 检查 Bundle Identifier 是否唯一

### Q8: 如何调试原生代码？

**A**: 
- Android：使用 Android Studio 的 Logcat 和调试器
- iOS：使用 Xcode 的 Console 和调试器
- Web 代码：使用 Chrome DevTools（Android）或 Safari Web Inspector（iOS）

### Q9: 相机功能无法使用？

**A**: 
- 检查是否已安装 `@capacitor/camera` 插件
- 确保已运行 `npx cap sync` 同步插件到原生项目
- 检查原生项目中的权限配置（AndroidManifest.xml 和 Info.plist）
- 在真实设备上测试（模拟器可能不支持相机）

## 参考资源

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Capacitor Android 指南](https://capacitorjs.com/docs/android)
- [Capacitor iOS 指南](https://capacitorjs.com/docs/ios)
- [Android 开发文档](https://developer.android.com/)
- [iOS 开发文档](https://developer.apple.com/documentation/)
- [Capacitor 插件市场](https://capacitorjs.com/docs/plugins)
