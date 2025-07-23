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

import AsyncStorage from "@react-native-async-storage/async-storage"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { MOCK_USERS } from "../constants/Data"

interface User {
  id: string
  email: string
  name: string
  role: "teacher" | "admin"
  assignedLabs?: string[]
  firstName?: string
  lastName?: string
  secondLastName?: string
  phone?: string
  department?: string
  photo?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: 'teacher' | 'admin' }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Variable global para el token
export let globalAuthToken: string | null = null

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStoredUser()
  }, [])

  const loadStoredUser = async () => {
    try {
      // Simular un pequeño delay para mostrar la pantalla de carga
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const storedUser = await AsyncStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Error loading stored user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Nueva función para login real
  const loginApi = async (email: string, password: string): Promise<{ success: boolean; role?: 'teacher' | 'admin' }> => {
    console.log('[LOGIN API] Enviando datos:', { correo: email, password })
    try {
      const response = await fetch('https://756077eced4b.ngrok-free.app/api/maestro/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, password }),
      })
      const data = await response.json()
      console.log('[LOGIN API] Respuesta recibida:', data)
      if (data.message === 'Inicio de sesión exitoso' && data.usuario) {
        // Guardar token globalmente
        globalAuthToken = data.usuario.token
        console.log('[LOGIN API] Token guardado globalmente:', globalAuthToken)
        // Construir el objeto de usuario
        const userSession: User = {
          id: data.usuario.id.toString(),
          email: data.usuario.correo,
          name: data.usuario.nombre,
          role: data.usuario.rol === 'maestro' ? 'teacher' : 'admin',
        }
        setUser(userSession)
        await AsyncStorage.setItem('user', JSON.stringify(userSession))
        return { success: true, role: userSession.role }
      } else {
        return { success: false }
      }
    } catch (error) {
      console.error('[LOGIN API] Error durante login:', error)
      return { success: false }
    }
  }

  // Modificar login para usar loginApi
  const login = async (email: string, password: string): Promise<{ success: boolean; role?: 'teacher' | 'admin' }> => {
    // Puedes cambiar entre loginApi y el mock comentando/descomentando
    // return loginMock(email, password)
    return loginApi(email, password)
  }

  // // loginMock: función original para pruebas locales
  const loginMock = async (email: string, password: string): Promise<{ success: boolean; role?: 'teacher' | 'admin' }> => {
    try {
      const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (foundUser) {
        const userSession: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role as 'teacher' | 'admin',
          assignedLabs: foundUser.assignedLabs,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          secondLastName: foundUser.secondLastName,
          phone: (foundUser as any).phone ? (foundUser as any).phone : null,
          department: (foundUser as any).department ? (foundUser as any).department : null,
          photo: foundUser.photo,
        }
        setUser(userSession)
        await AsyncStorage.setItem('user', JSON.stringify(userSession))
        return { success: true, role: userSession.role }
      }
      return { success: false }
    } catch (error) {
      console.error('[LOGIN MOCK] Error durante login:', error)
      return { success: false }
    }
  }

  const logout = async () => {
    try {
      // Llamada al endpoint de logout
      if (globalAuthToken) {
        console.log('[LOGOUT] Haciendo DELETE a /api/logout con token:', globalAuthToken)
        const response = await fetch('https://756077eced4b.ngrok-free.app/api/logout', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${globalAuthToken}`,
            'Accept': 'application/json',
            // 'User-Agent': 'Thunder Client (https://www.thunderclient.com)', // opcional, normalmente no necesario
          },
        })
        const data = await response.json().catch(() => ({}))
        console.log('[LOGOUT] Respuesta de /api/logout:', data)
      } else {
        console.warn('[LOGOUT] No hay token global para hacer logout en el backend')
      }
      setUser(null)
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("selectedLabId")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
