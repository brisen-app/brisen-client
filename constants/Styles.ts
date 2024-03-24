import { StyleSheet } from 'react-native'

export const Styles = StyleSheet.create({
    absoluteFill: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    shadow: {
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 1,
    },
})

export const FontStyles = StyleSheet.create({
    LargeTitle: {
        userSelect: 'none',
        fontSize: 28,
        fontWeight: '900',
    },
    Title: {
        userSelect: 'none',
        fontSize: 20,
        fontWeight: '900',
    },
    Subheading: {
        userSelect: 'none',
        color: 'gray',
    },
})