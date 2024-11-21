import { ExpoConfig } from 'expo/config'

let bundleId = 'no.kallerud.brisen'
let appName = 'Brisen'
const appVersion = '1.0.0'

const environment = process.env.EXPO_PUBLIC_ENV
if (!environment) throw new Error('EXPO_PUBLIC_ENV not set')

if (environment !== 'production') {
  if (environment === 'release') appName += `-${appVersion}`
  else appName += `-${environment}`
  bundleId += `.${environment}`
}

export default (): ExpoConfig => ({
  name: appName,
  slug: 'brisen-client',
  description: "Let's get Brisen together!",
  version: appVersion,
  runtimeVersion: '1',
  githubUrl: 'https://github.com/brisen-app/brisen-client',
  orientation: 'portrait',
  scheme: 'no.kallerud',
  userInterfaceStyle: 'dark',
  assetBundlePatterns: ['**/*'],
  primaryColor: '#f3a000',
  backgroundColor: '#000000',
  platforms: ['ios', 'android'],
  splash: {
    image: './src/assets/images/splash-screen/splash-screen.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  locales: {
    en: {},
    nb: {},
    sv: {},
  },
  androidStatusBar: {
    backgroundColor: '#00000000',
    barStyle: 'light-content',
  },
  androidNavigationBar: {
    backgroundColor: '#00000000',
    barStyle: 'light-content',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    icon: {
      light: './src/assets/images/app-icon/icon.png',
      dark: './src/assets/images/app-icon/foreground.png',
      tinted: './src/assets/images/app-icon/mono.png',
    },
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
    },
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      foregroundImage: './src/assets/images/app-icon/foreground.png',
      monochromeImage: './src/assets/images/app-icon/mono.png',
      backgroundImage: './src/assets/images/app-icon/background.png',
    },
    allowBackup: false,
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 24,
        },
        ios: {
          deploymentTarget: '15.1',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'ea66c9bc-ab42-4370-b12b-b6db5bf784c8',
    },
  },
  owner: 'brisen',
  updates: {
    url: 'https://u.expo.dev/ea66c9bc-ab42-4370-b12b-b6db5bf784c8',
  },
})
