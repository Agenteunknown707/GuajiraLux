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
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Dimensions, PanResponder, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg"
import { useTheme } from "../context/ThemeContext"
import { SIZES, FONTS, SHADOWS } from "../constants/Colors"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"

interface HSVColor {
  hue: number // 0-360
  saturation: number // 0-1000
  value: number // 0-1000
}

interface ColorWheelPickerProps {
  selectedColor: string
  intensity: number
  onColorChange: (color: string, hsv: HSVColor) => void
  onIntensityChange: (intensity: number, hsv: HSVColor) => void
  size?: number
  showHSVValues?: boolean
}

const { width } = Dimensions.get("window")

export const ColorWheelPicker: React.FC<ColorWheelPickerProps> = ({
  selectedColor,
  intensity,
  onColorChange,
  onIntensityChange,
  size = Math.min(width * 0.6, 200),
  showHSVValues = true,
}) => {
  const { colors } = useTheme()
  const [currentHSV, setCurrentHSV] = useState<HSVColor>({ hue: 0, saturation: 1000, value: intensity * 10 })
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 })

  // Shared values para animaciones
  const selectorScale = useSharedValue(1)

  useEffect(() => {
    // Convertir el color RGB actual a HSV al inicializar
    const hsv = rgbToHsv(selectedColor)
    setCurrentHSV({ ...hsv, value: intensity * 10 })
    updateSelectorPosition(hsv.hue, hsv.saturation)
  }, [selectedColor, intensity])

  // Función para convertir RGB hex a HSV
  const rgbToHsv = (hex: string): HSVColor => {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6
      } else if (max === g) {
        h = (b - r) / diff + 2
      } else {
        h = (r - g) / diff + 4
      }
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360

    const s = max === 0 ? 0 : Math.round((diff / max) * 1000)
    const v = Math.round(max * 1000)

    return { hue: h, saturation: s, value: v }
  }

  // Función para convertir HSV a RGB hex
  const hsvToRgb = (h: number, s: number, v: number): string => {
    const hNorm = h / 360
    const sNorm = s / 1000
    const vNorm = v / 1000

    const c = vNorm * sNorm
    const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1))
    const m = vNorm - c

    let r = 0,
      g = 0,
      b = 0

    if (hNorm >= 0 && hNorm < 1 / 6) {
      r = c
      g = x
      b = 0
    } else if (hNorm >= 1 / 6 && hNorm < 2 / 6) {
      r = x
      g = c
      b = 0
    } else if (hNorm >= 2 / 6 && hNorm < 3 / 6) {
      r = 0
      g = c
      b = x
    } else if (hNorm >= 3 / 6 && hNorm < 4 / 6) {
      r = 0
      g = x
      b = c
    } else if (hNorm >= 4 / 6 && hNorm < 5 / 6) {
      r = x
      g = 0
      b = c
    } else {
      r = c
      g = 0
      b = x
    }

    const rFinal = Math.round((r + m) * 255)
    const gFinal = Math.round((g + m) * 255)
    const bFinal = Math.round((b + m) * 255)

    return `#${rFinal.toString(16).padStart(2, "0")}${gFinal.toString(16).padStart(2, "0")}${bFinal.toString(16).padStart(2, "0")}`
  }

  // Actualizar la posición del selector basado en HSV
  const updateSelectorPosition = (hue: number, saturation: number) => {
    const angle = (hue * Math.PI) / 180
    const radius = (saturation / 1000) * (size / 2 - 30)
    const centerX = size / 2
    const centerY = size / 2

    const x = centerX + radius * Math.cos(angle - Math.PI / 2)
    const y = centerY + radius * Math.sin(angle - Math.PI / 2)

    setSelectorPosition({ x, y })
  }

  // Calcular HSV desde la posición del toque
  const calculateHSVFromPosition = (x: number, y: number) => {
    const centerX = size / 2
    const centerY = size / 2
    const deltaX = x - centerX
    const deltaY = y - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxRadius = size / 2 - 30

    // Calcular ángulo (hue)
    let angle = Math.atan2(deltaY, deltaX) + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    const hue = Math.round((angle * 180) / Math.PI)

    // Calcular saturación basada en la distancia del centro
    const saturation = Math.min(Math.round((distance / maxRadius) * 1000), 1000)

    return { hue, saturation }
  }

  // PanResponder para manejar gestos
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      selectorScale.value = withSpring(1.3)
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent
      const centerX = size / 2
      const centerY = size / 2
      const deltaX = locationX - centerX
      const deltaY = locationY - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxRadius = size / 2 - 30

      if (distance <= maxRadius) {
        const { hue, saturation } = calculateHSVFromPosition(locationX, locationY)
        const newHSV = { hue, saturation, value: currentHSV.value }
        const newColor = hsvToRgb(hue, saturation, currentHSV.value)

        setCurrentHSV(newHSV)
        setSelectorPosition({ x: locationX, y: locationY })
        onColorChange(newColor, newHSV)
      }
    },
    onPanResponderRelease: () => {
      selectorScale.value = withSpring(1)
    },
  })

  // Manejar cambio de intensidad
  const handleIntensityChange = (newIntensity: number) => {
    const newValue = newIntensity * 10 // Convertir de 0-100 a 0-1000
    const newHSV = { ...currentHSV, value: newValue }
    const newColor = hsvToRgb(currentHSV.hue, currentHSV.saturation, newValue)

    setCurrentHSV(newHSV)
    onIntensityChange(newIntensity, newHSV)
  }

  // Estilos animados para el selector
  const selectorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: selectorScale.value }],
    }
  })

  // Crear colores para la rueda
  const createColorStops = () => {
    const stops = []
    for (let i = 0; i <= 360; i += 30) {
      const color = hsvToRgb(i, 1000, 1000)
      stops.push(<Stop key={i} offset={`${(i / 360) * 100}%`} stopColor={color} />)
    }
    return stops
  }

  return (
    <View style={styles.container}>
      {/* Rueda de color */}
      <View style={[styles.wheelContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.colorWheel}>
          <Defs>
            <RadialGradient id="saturationGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Círculos de color para crear la rueda */}
          {Array.from({ length: 360 }, (_, i) => {
            const angle = (i * Math.PI) / 180
            const radius = size / 2 - 20
            const x = size / 2 + radius * Math.cos(angle - Math.PI / 2)
            const y = size / 2 + radius * Math.sin(angle - Math.PI / 2)
            const color = hsvToRgb(i, 1000, 1000)

            return <Circle key={i} cx={x} cy={y} r="2" fill={color} />
          })}

          {/* Gradiente de saturación */}
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 20} fill="url(#saturationGradient)" />
        </Svg>

        {/* Área táctil para gestos */}
        <View style={[styles.gestureArea, { width: size, height: size }]} {...panResponder.panHandlers}>
          {/* Selector de color */}
          <Animated.View
            style={[
              styles.colorSelector,
              {
                left: selectorPosition.x - 12,
                top: selectorPosition.y - 12,
              },
              selectorAnimatedStyle,
            ]}
          >
            <View style={[styles.selectorRing, { borderColor: colors.text }]}>
              <View
                style={[
                  styles.selectorCenter,
                  { backgroundColor: hsvToRgb(currentHSV.hue, currentHSV.saturation, currentHSV.value) },
                ]}
              />
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Control de intensidad */}
      <View style={styles.intensityContainer}>
        <Text style={[styles.intensityLabel, { color: colors.textSecondary }]}>
          Intensidad: {Math.round(intensity)}%
        </Text>
        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={[styles.sliderButton, { backgroundColor: colors.cardElevated }]}
            onPress={() => handleIntensityChange(Math.max(0, intensity - 10))}
          >
            <Ionicons name="remove" size={10} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.sliderFill, { backgroundColor: colors.primary, width: `${intensity}%` }]} />
          </View>

          <TouchableOpacity
            style={[styles.sliderButton, { backgroundColor: colors.cardElevated }]}
            onPress={() => handleIntensityChange(Math.min(100, intensity + 10))}
          >
            <Ionicons name="add" size={10} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mostrar valores HSV 
      {showHSVValues && (
        <View style={[styles.hsvDisplay, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
          <Text style={[styles.hsvTitle, { color: colors.text }]}>Valores HSV:</Text>
          <View style={styles.hsvValues}>
            <Text style={[styles.hsvText, { color: colors.textSecondary }]}>
              {JSON.stringify(
                {
                  hue: currentHSV.hue,
                  saturation: currentHSV.saturation,
                  value: currentHSV.value,
                },
                null,
                2,
              )}
            </Text>
          </View>
        </View>
        
      )}
      */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  wheelContainer: {
    position: "relative" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  colorWheel: {
    position: "absolute" as const,
  },
  gestureArea: {
    position: "absolute" as const,
  },
  colorSelector: {
    position: "absolute" as const,
    width: 24,
    height: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  selectorRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FFFFFF",
    ...SHADOWS.medium,
  },
  selectorCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  intensityContainer: {
    width: "100%",
    marginTop: SIZES.lg,
  },
  intensityLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    textAlign: "center" as const,
    marginBottom: SIZES.md,
  },
  sliderContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...SHADOWS.small,
  },
  sliderTrack: {
    flex: 1,
    height: 10,
    borderRadius: 4,
    marginHorizontal: SIZES.md,
    overflow: "hidden" as const,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  hsvDisplay: {
    width: "100%",
    marginTop: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
  },
  hsvTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.sm,
  },
  hsvValues: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: SIZES.sm,
    borderRadius: SIZES.borderRadiusSmall,
  },
  hsvText: {
    fontSize: FONTS.size.xs,
    fontFamily: "monospace",
    lineHeight: 16,
  },
})