import React from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

export default function MyComponent() {
  const opacity = useSharedValue(0)

  // Animación de opacidad de 0 a 1
  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 })
  }, [])

  // Hook para aplicar estilos animados
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  return React.createElement(
    Animated.View,
    {
      style: [{ width: 100, height: 100, backgroundColor: 'blue' }, animatedStyle]
    }
  );
}
