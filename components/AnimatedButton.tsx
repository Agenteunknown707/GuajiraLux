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
import { TouchableOpacity, Text, type ViewStyle, type TextStyle } from "react-native"
import { COLORS, SIZES, FONTS } from "../constants/Colors"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated"

interface AnimatedButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "small" | "medium" | "large"
  loading?: boolean
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = "primary",
  size = "medium",
  loading = false,
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
    opacity.value = withTiming(0.8, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    opacity.value = withTiming(1, { duration: 100 })
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: SIZES.borderRadius,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }

    const sizeStyles = {
      small: { paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
      medium: { paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md },
      large: { paddingHorizontal: SIZES.xl, paddingVertical: SIZES.lg },
    }

    const variantStyles = {
      primary: { backgroundColor: disabled ? COLORS.textTertiary : COLORS.primary },
      secondary: { backgroundColor: disabled ? COLORS.textTertiary : COLORS.secondary },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: disabled ? COLORS.textTertiary : COLORS.primary,
      },
      ghost: { backgroundColor: "transparent" },
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    }
  }

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: FONTS.weight.semibold as any,
    }

    const sizeStyles = {
      small: { fontSize: FONTS.size.sm },
      medium: { fontSize: FONTS.size.md },
      large: { fontSize: FONTS.size.lg },
    }

    const variantStyles = {
      primary: { color: "#FFFFFF" },
      secondary: { color: "#FFFFFF" },
      outline: { color: disabled ? COLORS.textTertiary : COLORS.primary },
      ghost: { color: disabled ? COLORS.textTertiary : COLORS.primary },
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    }
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <Text style={[getTextStyle(), textStyle]}>{loading ? "Cargando..." : title}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
