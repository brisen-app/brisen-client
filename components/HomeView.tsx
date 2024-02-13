import BottomSheet from '@gorhom/bottom-sheet';
import { StyleSheet } from "react-native";
import { useCallback, useMemo, useRef } from "react";
import { BlurView } from 'expo-blur';
import GameView from '@/components/GameView';
import MenuView from '@/components/MenuView';

export default function HomeView() {

    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    // variables
    const snapPoints = useMemo(() => ['15%', '66%', '100%'], []);

    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const containerView = useCallback(
        (props: any) => <BlurView intensity={100} {...props} />,
        []
    )

    return (
        <>
            <GameView />
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backgroundStyle={styles.contentContainer}
                backgroundComponent={containerView}
                handleIndicatorStyle={{ backgroundColor: 'white' }}
            >
                <MenuView />
            </BottomSheet>
        </>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        borderRadius: 16,
        overflow: 'hidden'
    },
});