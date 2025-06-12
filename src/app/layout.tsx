//"use client"
import type React from "react"
import "../styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "./providers"
import { StudentProvider } from "@/context/StudentContext"
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AIAC INTRANET",
  description: "Plateforme étudiante AIAC",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <Providers>
            <StudentProvider>
              {children}
            </StudentProvider>
          </Providers>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </body>
    </html>
  )
}