import { useQuery } from '@tanstack/react-query'
import { Text, TextProps } from './Themed'
import Placeholder, { PlaceholderProps } from './Placeholder'
// import { useContext } from 'react';
// import { LanguageContext } from './AppContext';
import { LocalizationManager } from '@/lib/LocalizationManager'

type LocalizationProps = {
    id: string
    forcePlaceholder?: boolean
    placeHolderStyle?: PlaceholderProps
    textCase?: 'uppercase' | 'lowercase' | 'capitalize'
}

export type LocalizedTextProps = LocalizationProps & TextProps

export function LocalizedText(props: LocalizedTextProps) {
    // const { language } = useContext(LanguageContext);
    const { id, placeHolderStyle, forcePlaceholder, textCase, ...otherProps } = props

    const { data: localization, error, isLoading } = useQuery(LocalizationManager.getFetchQuery(id))

    if (error) console.warn(error)
    if (isLoading || forcePlaceholder) return <Placeholder {...placeHolderStyle} />

    if (!localization?.value) return <Text {...otherProps}>{id}</Text>

    let value = localization.value
    switch (textCase) {
        case 'uppercase':
            value = localization.value.toUpperCase()
            break
        case 'lowercase':
            value = localization.value.toLowerCase()
            break
        case 'capitalize':
            value = localization.value.charAt(0).toUpperCase() + localization.value.slice(1)
            break
    }

    return <Text {...otherProps}>{value}</Text>
}
