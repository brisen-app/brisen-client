import { ExpoConfig } from 'expo/config'

let bundleId = 'no.kallerud.brisen'
let appName = 'Brisen'

export const majorVersion = 1 // Marketing version, requires a new build
export const minorVersion = 1 // Requires a new build
export const patchVersion = 1 // Doesn't require a new build

export const appVersion = `${majorVersion}.${minorVersion}.${patchVersion}`
export const runtimeVersion = `${majorVersion}.${minorVersion}`

const environment = process.env.EXPO_PUBLIC_ENV ?? 'ci'
if (environment === 'ci') {
  console.warn('Environment variable EXPO_PUBLIC_ENV is not set, using default value "ci"')
}

if (environment !== 'production') {
  appName += `-${runtimeVersion}`
  bundleId += `.${environment}`
}

export default (): ExpoConfig => ({
  name: appName,
  slug: 'brisen-client',
  description: "Let's get Brisen together!",
  version: appVersion,
  runtimeVersion: runtimeVersion,
  githubUrl: 'https://github.com/brisen-app/brisen-client',
  orientation: 'portrait',
  scheme: appName.toLowerCase(),
  userInterfaceStyle: 'dark',
  assetBundlePatterns: ['**/*'],
  primaryColor: '#f3a000',
  backgroundColor: '#000000',
  platforms: ['ios', 'android'],
  locales: {
    en: {},
    nb: {},
    sv: {},
  },
  androidStatusBar: {
    backgroundColor: '#00000000',
    barStyle: 'light-content',
    translucent: true,
  },
  androidNavigationBar: {
    backgroundColor: '#00000000',
    barStyle: 'light-content',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    icon: {
      light: './src/assets/images/app-icon/icon-ios.png',
      dark: './src/assets/images/app-icon/icon-ios-foreground.png',
      tinted: './src/assets/images/app-icon/icon-ios-adaptive.png',
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
      foregroundImage: './src/assets/images/app-icon/icon-android-foreground.png',
      monochromeImage: './src/assets/images/app-icon/icon-android-adaptive.png',
      backgroundImage: './src/assets/images/app-icon/icon-background.png',
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
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/app-icon/icon-android-foreground.png',
        imageWidth: 200,
        backgroundColor: '#000000',
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
