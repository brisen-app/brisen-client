import { useQuery } from '@tanstack/react-query';
import { Text, TextProps } from './Themed';
import Localization from '@/types/Localization';
import { AnimatableNumericValue, DimensionValue, View, useColorScheme } from 'react-native';
import Color from '@/types/Color';
import Language from '@/types/Language';

type LocalizationProps = {
    localeKey: string;
    forcePlaceholder?: boolean;
    placeHolerStyle: {
        borderRadius?: AnimatableNumericValue;
        width?: DimensionValue;
        height: DimensionValue;
    }
};

export type LocalizedTextProps = LocalizationProps & TextProps;

export function LocalizedText(props: LocalizedTextProps) {
    const isLightMode = useColorScheme() === 'light';
    const language = Language.getCurrent();
    const { localeKey, placeHolerStyle,forcePlaceholder, ...otherProps } = props;

    const { data: localization, isLoading } = useQuery({
        queryKey: [Localization.tableName, language.id, localeKey],
        queryFn: async () => {
            return await Localization.fetchWithLang(localeKey, language);
        }
    });

    if (isLoading || forcePlaceholder) return <View style={{
        flexGrow: placeHolerStyle?.width === null ? 1 : 0,
        height: placeHolerStyle?.height ?? 16,
        width: placeHolerStyle?.width ?? 'auto',
        backgroundColor: (isLightMode ? Color.black : Color.white).alpha(0.25).string,
        borderRadius: placeHolerStyle.borderRadius ?? 4,
    }} />

    return <Text {...otherProps} >{localization?.value ?? localeKey}</Text>;
}
