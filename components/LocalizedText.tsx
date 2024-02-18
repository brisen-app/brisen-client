import { useQuery } from '@tanstack/react-query';
import { Text, TextProps } from './Themed';
import Localization from '@/types/Localization';
import { AnimatableNumericValue, DimensionValue, StyleProp, ViewStyle, useColorScheme } from 'react-native';
import Color from '@/types/Color';
import Language from '@/types/Language';
import Placeholder, { PlaceholderProps } from './Placeholder';
import { useContext } from 'react';
import { languageContext } from './AppContext';

type LocalizationProps = {
    localeKey: string;
    forcePlaceholder?: boolean;
    placeHolderStyle: PlaceholderProps;
};

export type LocalizedTextProps = LocalizationProps & TextProps;

export function LocalizedText(props: LocalizedTextProps) {
    const { language } = useContext(languageContext);
    const { localeKey, placeHolderStyle: placeHolerStyle, forcePlaceholder, ...otherProps } = props;

    const { data: localization, error, isLoading } = useQuery({
        queryKey: [Localization.tableName, language.id, localeKey],
        queryFn: async () => {
            return await Localization.get(localeKey, language.id);
        }
    });

    if (error) console.warn(error);
    if (isLoading || forcePlaceholder) return <Placeholder {...placeHolerStyle} />;

    return <Text {...otherProps} >{localization?.value ?? localeKey}</Text>;
}
