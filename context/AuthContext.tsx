"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
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

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: 'teacher' | 'admin' }> => {
    try {
      // Simular autenticación con datos mock
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
          phone: foundUser.phone,
          department: foundUser.department,
          photo: foundUser.photo,
        }

        setUser(userSession)
        await AsyncStorage.setItem("user", JSON.stringify(userSession))
        
        // Return the user role to handle navigation in the login screen
        return { success: true, role: userSession.role }
      }
      return { success: false }
    } catch (error) {
      console.error("Error during login:", error)
      return { success: false }
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      await AsyncStorage.removeItem("user")
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
