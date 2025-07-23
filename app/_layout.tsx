/**
 * Proyecto: WajiraLux - Sistema de iluminación inteligente para laboratorios universitarios
 * Autores:
 *  - Jocelin Esmeralda Martinez Mejia
 *  - Carlos Roberto Rosales Sanchez
 *  - Galilea Estrella Serrano Ruiz
 * Institución:
 *  - Instituto Tecnológico Nacional de México - Campus Colima
 * En colaboración con:
 *  - Universidad de La Guajira (Riohacha, Colombia)
 * Año: 2025
 * Licencia: MIT
 */
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
