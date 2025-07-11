import React, { useRef } from "react"
import { View, PanResponder, StyleSheet } from "react-native"
import Svg, { Defs, Circle, Path, RadialGradient, Stop, LinearGradient } from "react-native-svg"

const size = 200
const radius = size / 2

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = (angle - 90) * (Math.PI / 180.0)
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  }
}

function angleFromTouch(x: number, y: number) {
  const dx = x - radius
  const dy = y - radius
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  return (angle + 360) % 360
}

function angleToHex(angle: number) {
  const hue = angle
  return `hsl(${hue}, 100%, 50%)`
}

export default function ColorWheelPicker({ onColorChange }: { onColorChange: (color: string) => void }) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const x = gestureState.moveX - gestureState.x0 + radius
        const y = gestureState.moveY - gestureState.y0 + radius
        const angle = angleFromTouch(x, y)
        const color = angleToHex(angle)
        onColorChange(color)
      },
    })
  ).current

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="red" />
            <Stop offset="16.6%" stopColor="orange" />
            <Stop offset="33.3%" stopColor="yellow" />
            <Stop offset="50%" stopColor="green" />
            <Stop offset="66.6%" stopColor="blue" />
            <Stop offset="83.3%" stopColor="indigo" />
            <Stop offset="100%" stopColor="violet" />
          </LinearGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill="url(#grad)" />
        <Path
          d={`M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius - 0.01} 0`}
          fill="none"
          stroke="url(#rainbow)"
          strokeWidth={radius}
        />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 20,
  },
})