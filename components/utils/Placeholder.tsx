import { AnimatableNumericValue, DimensionValue, FlexAlignType, View } from 'react-native'
import Sizes from '@/constants/Sizes'
import Colors from '@/constants/Colors'
import useColorScheme from './useColorScheme'

export type PlaceholderProps = {
    textAlignment?: 'left' | 'center' | 'right'
    lineCount?: number
    isCircle?: boolean
    borderRadius?: AnimatableNumericValue
    height?: DimensionValue
    width?: DimensionValue
}

export default function Placeholder(props: PlaceholderProps) {
    const colorScheme = useColorScheme()
    const { textAlignment, lineCount, isCircle, borderRadius, height, width } = props

    const heightValue = height ?? Sizes.normal
    const borderRadiusValue = borderRadius ?? Sizes.tiny
    const alignmentValue = textAlignment ?? 'left'
    const flexAlignmentValue: FlexAlignType =
        alignmentValue === 'left' ? 'flex-start' : alignmentValue === 'right' ? 'flex-end' : alignmentValue

    if (isCircle)
        return (
            <View
                style={{
                    aspectRatio: 1,
                    height: heightValue,
                    borderRadius: 100000000,
                    backgroundColor: Colors[colorScheme].placeholder,
                }}
            />
        )

    return (
        <View
            style={{
                flexShrink: 1,
                alignItems: flexAlignmentValue,
                borderRadius: borderRadiusValue,
                width: width ?? '100%',
                overflow: 'hidden',
                margin: Sizes.tiny,
            }}
        >
            {Array.from({ length: lineCount ?? 1 }).map((_, index) => (
                <View
                    key={index}
                    style={{
                        height: heightValue,
                        width: index + 1 === lineCount ? '75%' : '100%',
                        backgroundColor: Colors[colorScheme].placeholder,
                        borderBottomRightRadius: index + 2 >= (lineCount ?? 1) ? borderRadiusValue : 0,
                        borderBottomLeftRadius: index + 2 >= (lineCount ?? 1) ? borderRadiusValue : 0,
                    }}
                />
            ))}
        </View>
    )
}
