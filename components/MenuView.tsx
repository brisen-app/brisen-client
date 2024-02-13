import { View, Text, useColorScheme } from "react-native";

export default function MenuView() {

    return (
        <View style={{ flex: 1, padding: 16, overflow: 'visible' }}>
            <Text style={{color: 'white'}}>My menu 🎉</Text>
        </View>
    );
}