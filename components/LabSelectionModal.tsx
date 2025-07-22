"use client"

import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { FONTS, SHADOWS, SIZES } from "../constants/Colors"
import { globalAuthToken } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { AnimatedButton } from "./AnimatedButton"

interface Lab {
  id: string
  name: string
  isActive: boolean
  activeTeacher: string | null
}

const { width, height } = Dimensions.get("window")

export const LabSelector = () => {
  const [labs, setLabs] = useState<Lab[]>([])
  const [visible, setVisible] = useState(true) // visible por defecto para prueba
  const currentUserId = "123" // reemplaza con el ID real del usuario
  const router = useRouter()

 useEffect(() => {
  const token = globalAuthToken
  if (!token) {
    console.warn('[LabSelector] No hay token global disponible, el usuario no está autenticado o el login falló.')
  } else {
    console.log('[LabSelector] Usando token global:', token)
  }
  fetch("https://756077eced4b.ngrok-free.app/api/maestro/salones", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
  
    .then(res => {
      if (!res.ok) {
        throw new Error("Error al obtener laboratorios")
      }
      return res.json()
    })
    .then(data => {
      // Aquí transformas los datos
      setLabs(
        data.laboratorios.map((lab: any) => ({
          id: lab.id.toString(),
          name: lab.nombre,
          isActive: !lab.disponible,
          activeTeacher: lab.ocupado_por,
        }))
      )
    })
    .catch(error => console.error("Error:", error))
    console.log(`Bearer ${token}`)
}, [])

  const handleSelectLab = async (labId: string) => {
    console.log("Laboratorio seleccionado:", labId)
    // Guardar labId seleccionado
    await AsyncStorage.setItem("selectedLabId", labId)
    // Ocultar el modal
    setVisible(false)
    // Redirigir a la pantalla principal de teacher
    router.replace("/(teacher)")
  }

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <LabSelectionModal
      visible={visible}
      labs={labs}
      onSelectLab={handleSelectLab}
      onClose={handleClose}
      currentUserId={currentUserId}
    />
  )
}

interface LabSelectionModalProps {
  visible: boolean
  labs: Lab[]
  onSelectLab: (labId: string) => void
  onClose: () => void
  currentUserId: string
}

const LabSelectionModal: React.FC<LabSelectionModalProps> = ({
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

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const labCardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: interpolate(opacity.value, [0, 1], [50, 0]) }],
  }))

  const handleLogout = () => {
    router.replace("/(auth)/login")
    Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.")
    onClose()
  }

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

          {/* Lista de labs */}
          <ScrollView style={styles.labsList} showsVerticalScrollIndicator={false}>
            {labs.map((lab) => {
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
            <AnimatedButton title="Cerrar sesión" onPress={handleLogout} variant="outline" />
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
export default LabSelector
export { LabSelectionModal }

