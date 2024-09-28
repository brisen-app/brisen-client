import { ActivityIndicator, Text, View, ViewProps } from 'react-native'
import Colors from '../constants/Colors'

type ActivityIndicatorViewProps = ViewProps & {
  text?: string
}

export default function ActivityIndicatorView(props: Readonly<ActivityIndicatorViewProps>) {
  const { text, style, ...rest } = props
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
          gap: 16,
        },
        style,
      ]}
    >
      <ActivityIndicator size='large' color={Colors.text} {...rest} />
      {!!text && <Text style={{ color: Colors.text }}>{text}</Text>}
    </View>
  )
}
