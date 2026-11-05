import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { nativeTheme } from "../../../packages/design-tokens/src";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>MOREAI · NAVIGATION</Text>
        <Text accessibilityRole="header" style={styles.title}>Halaman tidak ditemukan</Text>
        <Text style={styles.description}>
          Alamat yang dibuka tidak tersedia. Kembali ke ruang kerja MoreAI.
        </Text>
        <Link href="/" asChild>
          <Pressable accessibilityRole="button" style={styles.button}>
            <Text style={styles.buttonText}>Kembali ke Beranda</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: nativeTheme.spacing.lg,
    backgroundColor: nativeTheme.colors.canvas,
  },
  card: {
    padding: nativeTheme.spacing["2xl"],
    backgroundColor: nativeTheme.colors.white,
    borderWidth: nativeTheme.border.standard,
    borderColor: nativeTheme.colors.ink,
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
  },
  title: {
    marginTop: nativeTheme.spacing.md,
    color: nativeTheme.colors.ink,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontSize: nativeTheme.typography.size.heading2,
    fontWeight: "800",
  },
  description: {
    marginTop: nativeTheme.spacing.md,
    color: nativeTheme.colors.charcoal,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontSize: nativeTheme.typography.size.body,
    lineHeight: 24,
  },
  button: {
    minHeight: nativeTheme.interaction.mobileTapTargetMin,
    marginTop: nativeTheme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: nativeTheme.colors.accent.mint,
    borderWidth: nativeTheme.border.standard,
    borderColor: nativeTheme.colors.ink,
    borderRadius: nativeTheme.radius.md,
    paddingHorizontal: nativeTheme.spacing.lg,
  },
  buttonText: {
    color: nativeTheme.colors.ink,
    fontFamily: nativeTheme.typography.fontFamily.sans,
    fontWeight: "700",
  },
});
