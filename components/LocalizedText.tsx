import { useQuery } from '@tanstack/react-query';
import { Text, TextProps } from './Themed';
import Placeholder, { PlaceholderProps } from './Placeholder';
import { useContext } from 'react';
import { LanguageContext } from './AppContext';
import Supabase from '@/lib/supabase';

type LocalizationProps = {
    localeKey: string;
    forcePlaceholder?: boolean;
    placeHolderStyle?: PlaceholderProps;
};

export type LocalizedTextProps = LocalizationProps & TextProps;

export function LocalizedText(props: LocalizedTextProps) {
    const { language } = useContext(LanguageContext);
    const { localeKey, placeHolderStyle, forcePlaceholder, ...otherProps } = props;

    const { data: localization, error, isLoading } = useQuery(
        Supabase.getLocalizationQuery(localeKey, language)
    );

    if (error) console.warn(error);
    if (isLoading || forcePlaceholder) return <Placeholder {...placeHolderStyle} />;

    return <Text {...otherProps} >{localization?.value ?? localeKey}</Text>;
}
