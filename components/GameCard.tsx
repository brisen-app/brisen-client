import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Card } from '@/types/Card';
import { BlurView } from 'expo-blur';

export default function GameCard(props: Readonly<{ card: Card, onPress?: () => void }>) {
    return (
        <TouchableOpacity style={styles.container} onPress={props.onPress} activeOpacity={1}>
            <BlurView intensity={100} tint='dark' style={styles.blurView}>
                <Text style={styles.text}>{props.card.content}</Text>
            </BlurView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'red',
        borderRadius: 32,
        margin: 16,
        overflow: 'hidden',
    },
    blurView: {
        flex: 1,
        // alignItems: 'center',
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