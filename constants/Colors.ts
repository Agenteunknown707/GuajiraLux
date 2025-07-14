// Paleta de colores institucional con modo oscuro
export const COLORS = {
  // Colores principales
  primary: "#00BFD8",       // Turquesa institucional
  secondary: "#FF6A6A",     // Rojo coral
  accent: "#FBB03B",        // Amarillo complementario
  
  // Colores de fondo
  background: "#121212",    // Fondo oscuro principal
  surface: "#1E1E1E",       // Superficie de componentes
  surfaceVariant: "#2D2D2D", // Variante de superficie
  surfaceHighlight: "#383838", // Para resaltar elementos
  
  // Texto y bordes
  text: "#FFFFFF",          // Texto principal
  textSecondary: "#B0B0B0",  // Texto secundario
  textTertiary: "#f1e8e8ff",   // Texto terciario/deshabilitado
  border: "#444444",        // Bordes y separadores
  
  // Estados y retroalimentación
  success: "#4CAF50",       // Éxito
  warning: "#FFC107",       // Advertencia
  error: "#F44336",         // Error
  info: "#2196F3",          // Información
  
  // Variaciones para interactividad
  primaryLight: "#4DD0E1",
  primaryDark: "#008BA3",
  secondaryLight: "#FF8A80",
  secondaryDark: "#C62828",
  accentLight: "#FFD54F",
  accentDark: "#FF8F00",
  borderLight: "#444444",
  
  // Gradientes
  primaryGradient: ["#00BFD8", "#008BA3"],
  secondaryGradient: ["#FF6A6A", "#C62828"],
  accentGradient: ["#FBB03B", "#FF8F00"],
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
