// Paleta de colores extraída del logo oficial de la Universidad de La Guajira
export const COLORS = {
  // Colores principales del logo UniGuajira
  primary: "#00BFD8", // Turquesa principal del logo
  secondary: "#FF6B35", // Naranja/Coral del texto inferior
  accent: "#FFC107", // Amarillo dorado del diseño geométrico
  tertiary: "#4CAF50", // Verde del diseño geométrico
  quaternary: "#E91E63", // Rosa/magenta del diseño

  // Variaciones de los colores principales
  primaryLight: "#4DD0E1",
  primaryDark: "#00ACC1",
  secondaryLight: "#FF8A65",
  secondaryDark: "#F4511E",
  accentLight: "#FFD54F",
  accentDark: "#FFA000",

  // Colores del sistema
  background: "#FFFFFF",
  surface: "#F8F9FA",
  surfaceVariant: "#F1F3F4",
  text: "#212121",
  textSecondary: "#757575",
  textTertiary: "#9E9E9E",
  border: "#E0E0E0",
  borderLight: "#F0F0F0",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",

  // Modo oscuro
  darkBackground: "#121212",
  darkSurface: "#1E1E1E",
  darkSurfaceVariant: "#2C2C2C",
  darkText: "#FFFFFF",
  darkTextSecondary: "#CCCCCC",
  darkTextTertiary: "#999999",
  darkBorder: "#333333",

  // Gradientes basados en el logo
  primaryGradient: ["#00BFD8", "#00ACC1"],
  secondaryGradient: ["#FF6B35", "#F4511E"],
  accentGradient: ["#FFC107", "#FFA000"],
  logoGradient: ["#00BFD8", "#FF6B35", "#FFC107", "#4CAF50"],
}

export const SIZES = {
  // Espaciado
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Padding y margin
  padding: 16,
  margin: 16,

  // Border radius
  borderRadius: 12,
  borderRadiusLarge: 20,
  borderRadiusSmall: 8,

  // Iconos
  iconXS: 16,
  iconSM: 20,
  iconMD: 24,
  iconLG: 32,
  iconXL: 48,

  // Header
  headerHeight: 60,
  tabBarHeight: 60,
}

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
  },
  weight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
}

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}

export const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
}

