'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const role = localStorage.getItem('userRole') // 'PATIENT', 'DOCTOR', 'ADMIN', or null

    const isLoginRoute = pathname.startsWith('/login') || pathname === '/' || pathname === '/register'
    const isAdminRoute = pathname.startsWith('/admin')
    const isDoctorRoute = pathname.startsWith('/doctor/') || pathname === '/doctor'
    
    // Patient routes are anything that requires login but isn't admin/doctor (e.g. /dashboard, /history, /payment, etc)
    const isPatientRoute = !isAdminRoute && !isDoctorRoute && !isLoginRoute

    let redirectUrl = null

    if (role === 'ADMIN') {
      if (!isAdminRoute && !pathname.startsWith('/api')) redirectUrl = '/admin'
    } else if (role === 'DOCTOR') {
      if (!isDoctorRoute && !pathname.startsWith('/api')) redirectUrl = '/doctor/dashboard'
    } else if (role === 'PATIENT') {
      if ((isAdminRoute || isDoctorRoute || pathname.startsWith('/login') || pathname === '/register') && !pathname.startsWith('/api')) {
        redirectUrl = '/dashboard'
      }
    } else if (!role && isPatientRoute) {
      // Not logged in trying to access patient protected routes
      redirectUrl = '/login/patient'
    }

    if (redirectUrl && redirectUrl !== pathname) {
      router.replace(redirectUrl)
    } else {
      setAllowed(true)
    }
  }, [pathname, mounted, router])

  if (!mounted || !allowed) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>Loading...</div>
  }

  return <>{children}</>
}
