import { ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'
import { ConfigurationManager } from '../managers/ConfigurationManager'

export default function MenuHudView(props: Readonly<ViewProps>) {
  const { style, ...rest } = props
  const closedSheetHeight = ConfigurationManager.get('bottom_sheet_min_position')?.number ?? 64

  return <Animated.View {...rest} style={style}></Animated.View>
}
