import './globals.css'
import Navbar from './components/Navbar'

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
        <Navbar />
        {children}
      </body>
    </html>
  )
}