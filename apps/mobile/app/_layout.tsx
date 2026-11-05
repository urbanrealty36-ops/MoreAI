import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";
import { nativeTheme } from "../../../packages/design-tokens/src";

const fontSources = {
  [nativeTheme.typography.fontFamily.sans]: {
    uri: "https://raw.githubusercontent.com/google/fonts/fbe81817505e8aeadc53cc7a38a2b76fb57c333e/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf",
  },
  [nativeTheme.typography.fontFamily.mono]: {
    uri: "https://raw.githubusercontent.com/google/fonts/fbe81817505e8aeadc53cc7a38a2b76fb57c333e/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
  },
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
