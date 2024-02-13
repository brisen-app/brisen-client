import BottomSheet, { BottomSheetBackdrop, useBottomSheet, useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { StyleSheet, useColorScheme, Text } from "react-native";
import { useCallback, useMemo, useRef } from "react";
import { BlurView } from 'expo-blur';
import GameView from '@/components/GameView';
import MenuView from '@/components/MenuView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Color from '@/types/Color';
import Animated from 'react-native-reanimated';

export default function HomeView() {
    let topMargin = 0;

    const isLightMode = useColorScheme() === 'light';
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => [
        insets.bottom + 64, '50%', '100%'
    ], []);


    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const containerView = useCallback(
        (props: any) => <BlurView intensity={100} {...props} />,
        []
    )

    const backdrop = useCallback(
        (props: any) => <BottomSheetBackdrop
            pressBehavior={'collapse'}
            {...props} />,
        []
    )

    return (
        <>
            <GameView />
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backdropComponent={backdrop}
                backgroundStyle={styles.contentContainer}
                backgroundComponent={containerView}
                handleIndicatorStyle={{ backgroundColor: isLightMode ?
                    Color.black.alpha(0.5).value :
                    Color.white.alpha(0.5).value
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
    contentContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Color.white.alpha(0.2).value,
    },
    shadow: {
        shadowColor: 'black',
        shadowOpacity: 0.33,
        shadowRadius: 32,
        elevation: 24,
    }
});