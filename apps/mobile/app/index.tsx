import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { nativeTheme } from "../../../packages/design-tokens/src";

export default function Home() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>AI WORKSPACE & NETWORK PLATFORM</Text>
          <Text style={styles.title}>MoreAI</Text>
          <Text style={styles.description}>
            Application foundation; native product journeys are activated in their official implementation phases.
          </Text>
          <Text style={styles.meta}>DESIGN SYSTEM · PHASE 03</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: nativeTheme.colors.canvas,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: nativeTheme.spacing.lg,
    paddingVertical: nativeTheme.spacing["2xl"],
  },
  card: {
    padding: nativeTheme.spacing["2xl"],
    backgroundColor: nativeTheme.colors.white,
    borderColor: nativeTheme.colors.ink,
    borderWidth: nativeTheme.border.standard,
    borderRadius: nativeTheme.radius.lg,
    shadowColor: nativeTheme.colors.ink,
    shadowOffset: { width: 3.5, height: 3.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  eyebrow: {
    color: nativeTheme.colors.muted,
    fontFamily: nativeTheme.typography.fontFamily.mono,
    fontSize: nativeTheme.typography.size.micro,
    letterSpacing: 0.6,
  },
  title: {
    marginTop: nativeTheme.spacing.md,
    color: nativeTheme.colors.ink,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontSize: nativeTheme.typography.size.displayL,
    fontWeight: "800",
  },
  description: {
    marginTop: nativeTheme.spacing.md,
    color: nativeTheme.colors.charcoal,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontSize: nativeTheme.typography.size.body,
    lineHeight: 24,
  },
  meta: {
    marginTop: nativeTheme.spacing["2xl"],
    color: nativeTheme.colors.ink,
    fontFamily: nativeTheme.typography.fontFamily.mono,
    fontSize: nativeTheme.typography.size.caption,
    fontWeight: "600",
  },
});
