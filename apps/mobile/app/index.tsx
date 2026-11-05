import { StyleSheet, Text, View } from "react-native";
import { nativeTheme } from "../../../packages/design-tokens/src";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MoreAI Native</Text>
      <Text style={styles.description}>
        Application foundation; native UI parity is implemented in later phases.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: nativeTheme.spacing.lg,
    backgroundColor: nativeTheme.colors.canvas,
  },
  title: {
    color: nativeTheme.colors.ink,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontSize: nativeTheme.typography.size.heading2,
    fontWeight: "800",
  },
  description: {
    marginTop: nativeTheme.spacing.sm,
    color: nativeTheme.colors.muted,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontSize: nativeTheme.typography.size.bodySmall,
    textAlign: "center",
  },
});
