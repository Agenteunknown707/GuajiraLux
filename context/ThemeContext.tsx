"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { COLORS } from "../constants/Colors"

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  colors: typeof COLORS
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem("theme")
      if (storedTheme) {
        setIsDark(storedTheme === "dark")
      }
    } catch (error) {
      console.error("Error loading theme:", error)
    }
  }

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark
      setIsDark(newTheme)
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light")
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  const colors = {
    ...COLORS,
    background: isDark ? COLORS.darkBackground : COLORS.background,
    surface: isDark ? COLORS.darkSurface : COLORS.surface,
    text: isDark ? COLORS.darkText : COLORS.text,
    textSecondary: isDark ? COLORS.darkTextSecondary : COLORS.textSecondary,
    border: isDark ? COLORS.darkBorder : COLORS.border,
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}