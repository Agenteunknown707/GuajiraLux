import { Stack } from "expo-router"
import { PaperProvider } from "react-native-paper"
import { AuthProvider } from "../context/AuthContext"
import { LabProvider } from "../context/LabContext"
import { ThemeProvider } from "../context/ThemeContext"

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LabProvider>
          <PaperProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(teacher)" />
              <Stack.Screen name="(admin)" />
            </Stack>
          </PaperProvider>
        </LabProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
