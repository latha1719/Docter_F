import './globals.css'
import Navbar from './components/Navbar'
import RoleGuard from './components/RoleGuard'

export const metadata = {
  title: 'Doctor Online Appointment System',
  description: 'Book doctor appointments easily online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RoleGuard>
          <Navbar />
          {children}
        </RoleGuard>
      </body>
    </html>
  )
}