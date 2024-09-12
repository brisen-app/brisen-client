import { StyleSheet } from 'react-native'
import Colors from './Colors'

export const Styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
})

export const FontStyles = StyleSheet.create({
  LargeTitle: {
    userSelect: 'none',
    color: Colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  Header: {
    userSelect: 'none',
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  Title: {
    userSelect: 'none',
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  Subheading: {
    userSelect: 'none',
    color: Colors.secondaryText,
  },
  Button: {
    userSelect: 'none',
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  AccentuatedBody: {
    userSelect: 'none',
    color: Colors.text,
    fontSize: 16,
  },
})
