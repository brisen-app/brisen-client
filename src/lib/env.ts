function environmentVariables() {
  const environment = process.env.EXPO_PUBLIC_ENV
  if (!environment) throw new Error('EXPO_PUBLIC_ENV is not defined')
  const isProd = environment === 'production'

  const rcAppleKey = process.env.EXPO_PUBLIC_RC_KEY_APPLE
  if (!rcAppleKey) throw new Error('EXPO_PUBLIC_RC_KEY_APPLE is not defined')
  const rcGoogleKey = process.env.EXPO_PUBLIC_RC_KEY_GOOGLE
  if (!rcGoogleKey) throw new Error('EXPO_PUBLIC_RC_KEY_GOOGLE is not defined')

  let supabaseUrl = undefined
  let supabaseAnon = undefined

  if (isProd) {
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL_PROD
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON_PROD
  } else {
    supabaseUrl = process.env.EXPO_PUBLIC_SB_URL_DEV
    supabaseAnon = process.env.EXPO_PUBLIC_SB_ANON_DEV
  }

  if (!supabaseUrl) throw new Error(`EXPO_PUBLIC_SB_URL is not defined (${environment})`)
  if (!supabaseAnon) throw new Error(`EXPO_PUBLIC_SB_ANON is not defined (${environment})`)

  return {
    rcAppleKey,
    rcGoogleKey,
    supabaseUrl,
    supabaseAnon,
    environment,
    isProd,
  }
}

const env = environmentVariables()
export default env
