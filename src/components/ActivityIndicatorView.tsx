import { ActivityIndicator, ActivityIndicatorProps, StyleProp, View, ViewStyle } from 'react-native'
import Colors from '../constants/Colors'

export default function ActivityIndicatorView(
  props: Readonly<{ style?: StyleProp<ViewStyle & ActivityIndicatorProps> }>
) {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        },
        props.style,
      ]}
    >
      <ActivityIndicator size='large' color={Colors.text} {...props} />
    </View>
  )
}
