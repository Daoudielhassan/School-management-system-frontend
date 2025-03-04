//"use client"
import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "./providers"
import { StudentProvider } from "@/context/StudentContext"

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
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <Providers>
          <StudentProvider>
            {children}
          </StudentProvider>
        </Providers>
      </body>
    </html>
  )
}