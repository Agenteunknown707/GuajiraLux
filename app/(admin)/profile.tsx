"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Switch, Animated, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { SIZES, FONTS, SHADOWS } from "../../constants/Colors"
import { AnimatedButton } from "../../components/AnimatedButton"
import { router } from "expo-router"

export default function AdminProfileScreen() {
  const { user, logout } = useAuth()
  const { colors, isDark, toggleTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    secondLastName: user?.secondLastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(30)

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleSave = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    Alert.alert("Éxito", "Perfil actualizado correctamente", [
      {
        text: "OK",
        onPress: () => setIsEditing(false),
      },
    ])
  }

 const handleLogout = () => {
      Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
       { text: "Cancelar", style: "cancel" },
       {
         text: "Cerrar Sesión",
         onPress: () => {
           logout()
           router.replace("/(auth)/login")
         },
       },
     ])
   }

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Image source={{ uri: "/assets/images/uniguajira-logo.png" }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <Text style={styles.headerSubtitle}>Administrador del Sistema</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <Animated.View
          style={[
            styles.photoSection,
            { backgroundColor: colors.surface },
            SHADOWS.small,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: user?.photo || "/placeholder.svg?height=120&width=120" }}
              style={styles.profilePhoto}
            />
            <TouchableOpacity style={[styles.photoEditButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>Administrador del Sistema</Text>
        </Animated.View>

        {/* Personal Information */}
        <Animated.View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
            SHADOWS.small,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Personal</Text>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: isEditing ? colors.success : colors.primary }]}
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Ionicons name={isEditing ? "checkmark" : "create-outline"} size={16} color="#FFFFFF" />
              <Text style={styles.editButtonText}>{isEditing ? "Guardar" : "Editar"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
                  placeholder="Nombre"
                  placeholderTextColor={colors.textTertiary}
                />
              ) : (
                <Text style={[styles.inputValue, { color: colors.text }]}>{formData.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Apellido Paterno</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
                  placeholder="Apellido Paterno"
                  placeholderTextColor={colors.textTertiary}
                />
              ) : (
                <Text style={[styles.inputValue, { color: colors.text }]}>{formData.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Apellido Materno</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.secondLastName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, secondLastName: text }))}
                  placeholder="Apellido Materno"
                  placeholderTextColor={colors.textTertiary}
                />
              ) : (
                <Text style={[styles.inputValue, { color: colors.text }]}>{formData.secondLastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Correo Electrónico</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  placeholder="correo@uniguajira.edu.co"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={[styles.inputValue, { color: colors.text }]}>{formData.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Teléfono</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                  placeholder="+57 300 123 4567"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.inputValue, { color: colors.text }]}>{formData.phone || "No especificado"}</Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Password Section */}
        {isEditing && (
          <Animated.View
            style={[
              styles.section,
              { backgroundColor: colors.surface },
              SHADOWS.small,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Deja en blanco si no deseas cambiar la contraseña
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contraseña Actual</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, currentPassword: text }))}
                placeholder="Contraseña actual"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nueva Contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                value={formData.newPassword}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))}
                placeholder="Nueva contraseña"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirmar Contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirmar nueva contraseña"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
              />
            </View>
          </Animated.View>
        )}

        {/* Settings Section */}
        <Animated.View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
            SHADOWS.small,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuraciones</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.text} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Modo Oscuro</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Cambia la apariencia de la aplicación
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? "#FFFFFF" : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notificaciones</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Recibir alertas del sistema
                </Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Autenticación de Dos Factores</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Seguridad adicional para tu cuenta
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textSecondary}
            />
          </View>
        </Animated.View>

        {/* System Information */}
        <Animated.View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
            SHADOWS.small,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información del Sistema</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Versión de la App</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Universidad</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Universidad de La Guajira</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Último Acceso</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Hoy, 14:30</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sesiones Activas</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>1 dispositivo</Text>
            </View>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.logoutSection,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AnimatedButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="outline"
            style={[styles.logoutButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </Animated.View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: SIZES.lg,
    alignItems: "center" as const,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: SIZES.md,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.size.sm,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  photoSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.xl,
    alignItems: "center" as const,
    marginBottom: SIZES.lg,
  },
  photoContainer: {
    position: "relative" as const,
    marginBottom: SIZES.lg,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoEditButton: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  userName: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
  },
  userRole: {
    fontSize: FONTS.size.md,
  },
  section: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold as any,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.sm,
    marginBottom: SIZES.lg,
  },
  editButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.borderRadiusSmall,
  },
  editButtonText: {
    color: "#FFFFFF",
    marginLeft: SIZES.xs,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  formGrid: {
    gap: SIZES.lg,
  },
  inputGroup: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: SIZES.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: FONTS.size.md,
  },
  inputValue: {
    fontSize: FONTS.size.md,
    paddingVertical: SIZES.md,
  },
  settingItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  settingText: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium as any,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: FONTS.size.sm,
  },
  infoGrid: {
    gap: SIZES.md,
  },
  infoItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: SIZES.sm,
  },
  infoLabel: {
    fontSize: FONTS.size.sm,
  },
  infoValue: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium as any,
  },
  logoutSection: {
    marginBottom: SIZES.xl,
  },
  logoutButton: {
    borderWidth: 2,
  },
})
