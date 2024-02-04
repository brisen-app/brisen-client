import React from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import Card from '@/types/Card';
import Colors from '@/constants/Colors';
import Category from '@/types/Category';

export default function GameCard(props: Readonly<{ card: Card | null, onPress?: () => void }>) {
    const [category, setCategory] = React.useState<Category | null>(null);
    const [categoryTitle, setCategoryTitle] = React.useState<string | null>(null);

    React.useEffect(() => {
        setCategoryTitle(null);
        props.card?.category.then((category) => {
            setCategory(category);
            category?.title.then((title) => {
                setCategoryTitle(title);
            }).catch((reason) => {
                console.error("Failed to fetch category title", reason.message);
                setCategoryTitle(reason.message);
            })
        }).catch((reason) => {
            console.error("Failed to fetch category", reason.message);
            setCategory(null);
        })
    }, [props.card])

    if (!props.card) return <Text>Error: No card provided</Text>;

    return (
        <Pressable style={styles.container} onPress={props.onPress}>
            <View style={styles.view}>
                {(category && categoryTitle) ?
                    <Text style={styles.title}>{`${category?.icon ?? "-"} ${categoryTitle}`}</Text> :
                    <ActivityIndicator />
                }
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
        alignItems: 'center',
        padding: 32,
    },
    title : {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        userSelect: 'none',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
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
