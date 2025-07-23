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

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  )
}
