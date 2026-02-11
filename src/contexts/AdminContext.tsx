import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminContextType {
  isAdmin: boolean
  adminPassword: string | null
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminPassword: null,
  login: async () => false,
  logout: () => {},
})

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState<string | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_password')
    if (saved) {
      verifyPassword(saved).then(ok => {
        if (ok) {
          setIsAdmin(true)
          setAdminPassword(saved)
        }
      })
    }
  }, [])

  async function verifyPassword(pwd: string): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-subscribers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pwd },
      })
      return res.ok
    } catch {
      return false
    }
  }

  const login = async (password: string) => {
    const ok = await verifyPassword(password)
    if (ok) {
      setIsAdmin(true)
      setAdminPassword(password)
      sessionStorage.setItem('admin_password', password)
    }
    return ok
  }

  const logout = () => {
    setIsAdmin(false)
    setAdminPassword(null)
    sessionStorage.removeItem('admin_password')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, adminPassword, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
