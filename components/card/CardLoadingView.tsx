import { View } from 'react-native'
import Sizes from '@/constants/Sizes'
import Placeholder from '../utils/Placeholder'

export function CardLoadingView() {
  // TODO: Add card skeleton
  return (
    <View>
      {/* <View style={{ flexDirection: 'row', width: '75%', alignItems: 'center' }}>
            <Placeholder isCircle height={Sizes.big} />
            <Placeholder height={Sizes.large} />
        </View> */}
      <Placeholder lineCount={3} height={Sizes.large} textAlignment={'center'} />
    </View>
  )
}
