"use client"

import type React from "react"
import { TouchableOpacity, Text, Animated, type ViewStyle, type TextStyle } from "react-native"
import { COLORS, SIZES, ANIMATIONS, FONTS } from "../constants/Colors"

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
  const scaleValue = new Animated.Value(1)

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      duration: ANIMATIONS.duration.fast,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      duration: ANIMATIONS.duration.fast,
      useNativeDriver: true,
    }).start()
  }

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
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Text style={[getTextStyle(), textStyle]}>{loading ? "Cargando..." : title}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}
