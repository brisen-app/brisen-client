import { StyleSheet } from 'react-native';
import { Text as ThemedText, TextProps } from './Themed';

export function ExtraLargeTitle(props: TextProps) {
  return <ThemedText {...props} style={styles.extraLargeTitle} />;
}

export function ExtraLargeTitle2(props: TextProps) {
  return <ThemedText {...props} style={styles.extraLargeTitle2} />;
}

export function LargeTitle(props: TextProps) {
  return <ThemedText {...props} style={styles.largeTitle} />;
}

export function Title1(props: TextProps) {
  return <ThemedText {...props} style={styles.title1} />;
}

export function Title2(props: TextProps) {
  return <ThemedText {...props} style={styles.title2} />;
}

export function Title3(props: TextProps) {
  return <ThemedText {...props} style={styles.title3} />;
}

export function Headline(props: TextProps) {
  return <ThemedText {...props} style={styles.headline} />;
}

export function Callout(props: TextProps) {
  return <ThemedText {...props} style={styles.callout} />;
}

export function Subheadline(props: TextProps) {
  return <ThemedText {...props} style={styles.subheadline} />;
}

export function Body(props: TextProps) {
  return <ThemedText {...props} style={styles.body} />;
}

export function Footnote(props: TextProps) {
  return <ThemedText {...props} style={styles.footnote} />;
}

export function Caption1(props: TextProps) {
  return <ThemedText {...props} style={styles.caption1} />;
}

export function Caption2(props: TextProps) {
  return <ThemedText {...props} style={styles.caption2} />;
}

const thin = '100'
const ultraLight = '200'
const light = '300'
const regular = '400'
const medium = '500'
const semibold = '600'
const bold = '700'
const heavy = '800'
const black = '900'

const styles = StyleSheet.create({
    extraLargeTitle: {
      fontWeight: bold,
      fontSize: 36,
      marginTop: 16,
    },
    extraLargeTitle2: {
      fontWeight: bold,
      fontSize: 28,
      marginTop: 16,
    },
    largeTitle: {
      fontWeight: regular,
      fontSize: 34,
      marginTop: 16,
    },
    title1: {
      fontWeight: regular,
      fontSize: 28,
      marginTop: 16,
    },
    title2: {
      fontWeight: regular,
      fontSize: 22,
      marginTop: 8,
    },
    title3: {
      fontWeight: regular,
      fontSize: 20,
      marginTop: 8,
    },
    headline: {
      fontWeight: semibold,
      fontSize: 17,
      marginTop: 8,
    },
    callout: {
      fontWeight: regular,
      fontSize: 16,
      marginTop: 8,
    },
    subheadline: {
      fontWeight: regular,
      fontSize: 15,
      marginTop: 8,
    },
    body: {
      fontWeight: regular,
      fontSize: 17,
    },
    footnote: {
      fontWeight: regular,
      fontSize: 13,
      marginTop: 8,
    },
    caption1: {
      fontWeight: regular,
      fontSize: 12,
    },
    caption2: {
      fontWeight: regular,
      fontSize: 11,
    },
});