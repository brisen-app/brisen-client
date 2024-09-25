export default function environmentVariables(buildProfile = process.env.EAS_BUILD_PROFILE) {
  if (!buildProfile) throw new Error('EAS_BUILD_PROFILE is not defined')

  const rcAppleKey = process.env.EXPO_PUBLIC_RC_APPLE_KEY
  if (!rcAppleKey) throw new Error('EXPO_PUBLIC_RC_APPLE_KEY is not defined')
  const rcGoogleKey = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY
  if (!rcGoogleKey) throw new Error('EXPO_PUBLIC_RC_GOOGLE_KEY is not defined')

  let supabaseUrl = undefined
  let supabaseAnon = undefined

  if (buildProfile === 'production') {
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL_PROD
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON_PROD
  }

  if (buildProfile === 'develop') {
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL_DEV
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON_DEV
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
