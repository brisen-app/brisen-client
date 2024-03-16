import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { StyleSheet } from "react-native";
import { useCallback, useMemo, useRef } from "react";
import { BlurView } from 'expo-blur';
import GameView from '@/components/GameView';
import MenuView from '@/components/MenuView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sizes from '@/constants/Sizes';
import useColorScheme from './useColorScheme';
import Colors from '@/constants/Colors';

export default function HomeView() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => [
        insets.bottom + Sizes.big, '50%', '100%'
    ], []);


    const handleSheetChanges = useCallback((index: number) => {
        // console.log('handleSheetChanges', index);
    }, []);

    const containerView = useCallback(
        (props: any) => <BlurView intensity={100} {...props} />,
        []
    )

    const backdrop = useCallback(
        (props: any) => <BottomSheetBackdrop
            opacity={0.75}
            appearsOnIndex={2}
            disappearsOnIndex={0}
            pressBehavior={'collapse'}
            {...props} />,
        []
    )

    return (
        <>
            <GameView />
            <BottomSheet
                ref={bottomSheetRef}
                index={2}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backdropComponent={backdrop}
                backgroundStyle={{
                    borderRadius: 16,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: Sizes.thin,
                    overflow: 'hidden'
                }}
                backgroundComponent={containerView}
                handleIndicatorStyle={{
                    backgroundColor: Colors[colorScheme].stroke,
                }}
                style={styles.shadow}
                topInset={insets.top ?? 8}
            >
                <MenuView />
            </BottomSheet>
        </>
    )
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'black',
        shadowOpacity: 1/3,
        shadowRadius: 32,
        elevation: 24,
    }
});