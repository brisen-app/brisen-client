import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
    let dynamicConfig = {}

    switch (process.env.ENVIRONMENT) {
        case 'production':
            dynamicConfig = {
                extra: {
                    ...config.extra,
                    supabaseURL: process.env.SB_URL,
                    supabaseAnon: process.env.SB_ANON,
                },
            }
        default:
            dynamicConfig = {
                extra: {
                    ...config.extra,
                    supabaseURL: process.env.SB_URL_DEV,
                    supabaseAnon: process.env.SB_ANON_DEV,
                },
            }
    }

    return {
        name: config.name!,
        slug: config.slug!,
        ...config,
        ...dynamicConfig,
    }
}
