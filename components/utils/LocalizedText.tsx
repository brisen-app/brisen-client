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
}

export type LocalizedTextProps = LocalizationProps & TextProps

export function LocalizedText(props: LocalizedTextProps) {
    // const { language } = useContext(LanguageContext);
    const { id, placeHolderStyle, forcePlaceholder, ...otherProps } = props

    const { data: localization, error, isLoading } = useQuery(LocalizationManager.getFetchQuery(id))

    if (error) console.warn(error)
    if (isLoading || forcePlaceholder) return <Placeholder {...placeHolderStyle} />

    return <Text {...otherProps}>{localization?.value ?? id}</Text>
}
