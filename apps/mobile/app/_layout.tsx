import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";
import { nativeTheme } from "../../../packages/design-tokens/src";

const fontSources = {
  [nativeTheme.typography.fontFamily.sans]: require("../assets/fonts/PlusJakartaSans.ttf"),
  [nativeTheme.typography.fontFamily.mono]: require("../assets/fonts/JetBrainsMono.ttf"),
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontSources);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingTitle}>MoreAI</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: nativeTheme.colors.canvas },
      }}
    />
  );
}

const styles = {
  loading: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: nativeTheme.colors.canvas,
  },
  loadingTitle: {
    color: nativeTheme.colors.ink,
    fontSize: nativeTheme.typography.size.heading2,
    fontWeight: "800" as const,
  },
};
