"use client"

import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useEffect } from "react"
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { FONTS, SHADOWS, SIZES } from "../constants/Colors"
import { useTheme } from "../context/ThemeContext"
import { AnimatedButton } from "./AnimatedButton"

interface Lab {
  id: string
  name: string
  building: string
  room: string
  isActive: boolean
  activeTeacher: string | null
}

interface LabSelectionModalProps {
  visible: boolean
  labs: Lab[]
  onSelectLab: (labId: string) => void
  onClose: () => void
  currentUserId: string
}

const { width, height } = Dimensions.get("window")

export const LabSelectionModal: React.FC<LabSelectionModalProps> = ({
  visible,
  labs,
  onSelectLab,
  onClose,
  currentUserId,
}) => {
  const { colors } = useTheme()

  const translateY = useSharedValue(height)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 400 })
      translateY.value = withTiming(0, { duration: 400 })
    } else {
      opacity.value = withTiming(0, { duration: 300 })
      translateY.value = withTiming(height, { duration: 300 })
    }
  }, [visible])

  const getLabStatus = (lab: Lab) => {
    if (!lab.isActive) return { status: "available", color: colors.success, text: "Disponible" }
    if (lab.activeTeacher === currentUserId) return { status: "active", color: colors.info, text: "Activo" }
    return { status: "occupied", color: colors.warning, text: "Ocupado" }
  }

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  const labCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          translateX: interpolate(opacity.value, [0, 1], [50, 0]),
        },
      ],
    }
  })

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
        <Animated.View style={[styles.modalContainer, { backgroundColor: colors.background }, modalAnimatedStyle]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name="business" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: colors.text }]}>Seleccionar Laboratorio</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Elige el laboratorio para tu sesión
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Labs List */}
          <ScrollView style={styles.labsList} showsVerticalScrollIndicator={false}>
            {labs.map((lab, index) => {
              const labStatus = getLabStatus(lab)
              const isSelectable = labStatus.status !== "occupied"

              return (
                <Animated.View key={lab.id} style={labCardAnimatedStyle}>
                  <TouchableOpacity
                    style={[
                      styles.labCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: isSelectable ? 1 : 0.6,
                      },
                      SHADOWS.small,
                    ]}
                    onPress={() => isSelectable && onSelectLab(lab.id)}
                    disabled={!isSelectable}
                    activeOpacity={0.8}
                  >
                    <View style={styles.labCardContent}>
                      <View style={styles.labInfo}>
                        <Text style={[styles.labName, { color: colors.text }]}>{lab.name}</Text>
                        <Text style={[styles.labLocation, { color: colors.textSecondary }]}>
                          {lab.building} - {lab.room}
                        </Text>
                      </View>

                      <View style={styles.labStatus}>
                        <View style={[styles.statusBadge, { backgroundColor: labStatus.color }]}>
                          <Text style={styles.statusText}>{labStatus.text}</Text>
                        </View>
                        {isSelectable && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <AnimatedButton title="Cancelar" onPress={onClose} variant="outline" />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: height * 0.8,
    borderTopLeftRadius: SIZES.borderRadiusLarge,
    borderTopRightRadius: SIZES.borderRadiusLarge,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
  },
  subtitle: {
    fontSize: FONTS.size.sm,
    marginTop: 2,
  },
  closeButton: {
    padding: SIZES.sm,
  },
  labsList: {
    flex: 1,
    padding: SIZES.lg,
  },
  labCard: {
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    marginBottom: SIZES.md,
  },
  labCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.lg,
  },
  labInfo: {
    flex: 1,
  },
  labName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: 4,
  },
  labLocation: {
    fontSize: FONTS.size.sm,
  },
  labStatus: {
    alignItems: "center",
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
    marginRight: SIZES.sm,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold as any,
  },
  footer: {
    padding: SIZES.lg,
    borderTopWidth: 1,
  },
})
