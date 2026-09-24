import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { isFirebaseConfigured, requireAuth, sharedAuthEmail } from '../../firebase/client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(requireAuth(), (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (password) => {
      const credential = await signInWithEmailAndPassword(requireAuth(), sharedAuthEmail, password)
      setUser(credential.user)
    },
    logout: async () => {
      await signOut(requireAuth())
      setUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth tem de ser usado dentro de AuthProvider')
  return value
}
