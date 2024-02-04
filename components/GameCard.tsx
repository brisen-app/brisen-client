import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '@/types/Card';
import Colors from '@/constants/Colors';

export default function GameCard(props: Readonly<{ card: Card, onPress?: () => void }>) {
    return (
        <Pressable style={styles.container} onPress={props.onPress}>
            <View style={styles.view}>
                <Text style={styles.text}>{props.card.content}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 32,
        backgroundColor: Colors.accentColor,
        margin: 16,
        overflow: 'hidden',
    },
    view: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
    },
    text: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        userSelect: 'none',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
    }
});