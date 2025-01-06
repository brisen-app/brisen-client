import { ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'

export default function MenuHudView(props: Readonly<ViewProps>) {
  const { style, ...rest } = props
  return <Animated.View {...rest} style={style}></Animated.View>
}
