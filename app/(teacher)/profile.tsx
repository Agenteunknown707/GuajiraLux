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

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import { AnimatedButton } from "../../components/AnimatedButton"
import { FONTS, SHADOWS, SIZES } from "../../constants/Colors"
import { useAuth } from "../../context/AuthContext"
import { useLab } from "../../context/LabContext"
import { useTheme } from "../../context/ThemeContext"

export default function TeacherProfileScreen() {
  const { user, logout } = useAuth()
  const { colors} = useTheme()
  const { labs } = useLab()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    secondLastName: user?.secondLastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    photo: user?.photo || "", // Assuming user.photo is a URL or local path
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const userLabs = labs.filter((lab) => user?.assignedLabs?.includes(lab.id))

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.headerText}>
          <Text style={styles.headerespacio}></Text>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <Text style={styles.headerSubtitle}>Docente</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={[styles.photoSection, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <View style={styles.photoContainer}>
            <Image
              source={user?.photo ? { uri: user.photo } : require("../../assets/images/perfil.png")}
              style={styles.profilePhoto}
            />
            <TouchableOpacity style={[styles.photoEditButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userDepartment, { color: colors.textSecondary }]}>{user?.department}</Text>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsSection, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="business" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>{userLabs.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Laboratorios</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {userLabs.filter((lab) => lab.isActive).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Activos</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="bulb" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {userLabs.reduce((sum, lab) => sum + lab.lights.length, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Focos</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Personal</Text>
            <TouchableOpacity>
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
        </View>

        {/* Password Section 
        {isEditing && (
          <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
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
          </View>
        )}*/}

        {/* Assigned Labs */}
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Laboratorios Asignados</Text>

          {userLabs.map((lab) => (
            <View
              key={lab.id}
              style={[styles.labCard, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <View style={styles.labInfo}>
                <Text style={[styles.labName, { color: colors.text }]}>{lab.name}</Text>
                <Text style={[styles.labLocation, { color: colors.textSecondary }]}>
                  {lab.building} - {lab.room}
                </Text>
                <View style={styles.labStats}>
                  <View style={styles.labStat}>
                    <Ionicons name="bulb-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.labStatText, { color: colors.textSecondary }]}>{lab.lights.length} focos</Text>
                  </View>
                  <View style={styles.labStat}>
                    <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.labStatText, { color: colors.textSecondary }]}>
                      {lab.capacity} estudiantes
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[styles.labStatus, { backgroundColor: lab.isActive ? colors.success : colors.textTertiary }]}
              >
                <Text style={styles.labStatusText}>{lab.isActive ? "Activo" : "Inactivo"}</Text>
              </View>
            </View>
          ))}

          {userLabs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes laboratorios asignados</Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuraciones</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notificaciones</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Recibir alertas de laboratorio
                </Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>

        {/* App Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }, SHADOWS.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información de la App</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Versión</Text>
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
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <AnimatedButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="outline"
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
    alignItems: "center" as const,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
  },
  logo: {
    width: 80,
    height: 60,
    marginBottom: SIZES.md,
    backgroundColor: "#FFFFFF",
    borderRadius: SIZES.borderRadius,
  },
  headerText: {
    marginLeft: SIZES.md,
    alignItems: "center" as const,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
    alignContent: "center" as const,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FONTS.size.sm,
  },
  headerespacio: {
    fontSize: 5,
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
  userDepartment: {
    fontSize: FONTS.size.md,
  },
  statsSection: {
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  statsGrid: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
  },
  statCard: {
    alignItems: "center" as const,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: SIZES.sm,
  },
  statNumber: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold as any,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: FONTS.size.sm,
    textAlign: "center" as const,
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
  labCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  labInfo: {
    flex: 1,
  },
  labName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold as any,
    marginBottom: SIZES.xs,
  },
  labLocation: {
    fontSize: FONTS.size.sm,
    marginBottom: SIZES.sm,
  },
  labStats: {
    flexDirection: "row" as const,
    gap: SIZES.md,
  },
  labStat: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  labStatText: {
    fontSize: FONTS.size.xs,
    marginLeft: SIZES.xs,
  },
  labStatus: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.borderRadiusSmall,
  },
  labStatusText: {
    color: "#FFFFFF",
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold as any,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: SIZES.xl,
  },
  emptyText: {
    fontSize: FONTS.size.md,
    textAlign: "center" as const,
    marginTop: SIZES.md,
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
