import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pickgoods.app',
  appName: '拾谷',
  webDir: 'dist',
  server: {
    androidScheme: 'http', 
    cleartext: true
  }
};

export default config;