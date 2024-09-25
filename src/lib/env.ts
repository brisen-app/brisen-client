export default function environmentVariables() {
  const isDev = process.env.EAS_BUILD_PROFILE === 'development' || __DEV__

  const rcAppleKey = process.env.EXPO_PUBLIC_RC_KEY_APPLE
  if (!rcAppleKey) throw new Error('EXPO_PUBLIC_RC_KEY_APPLE is not defined')
  const rcGoogleKey = process.env.EXPO_PUBLIC_RC_KEY_GOOGLE
  if (!rcGoogleKey) throw new Error('EXPO_PUBLIC_RC_KEY_GOOGLE is not defined')

  let supabaseUrl = undefined
  let supabaseAnon = undefined

  if (isDev) {
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL_DEV
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON_DEV
  } else {
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL_PROD
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON_PROD
  }

  if (!supabaseUrl) throw new Error('EXPO_PUBLIC_SB_URL is not defined')
  if (!supabaseAnon) throw new Error('EXPO_PUBLIC_SB_ANON is not defined')

  return {
    rcAppleKey,
    rcGoogleKey,
    supabaseUrl,
    supabaseAnon,
  }
}
