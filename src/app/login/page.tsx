"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import type { LoginCredentials } from "@/types/auth"
import { toast } from "react-toastify"
import { useRouter, useSearchParams } from "next/navigation"
import { UserRole } from "@/types/auth"
import Image from "next/image"
import { Lock, LogIn, Loader2 } from "lucide-react"

function LoginForm() {
  const { login, isAuthenticated, role } = useAuth()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const hasCredentialParams = searchParams.has("email") || searchParams.has("password")
    if (hasCredentialParams) {
      router.replace("/login")
    }
  }, [searchParams, router])

  useEffect(() => {
    if (isAuthenticated && role) {
      const rolePathMap: Record<UserRole, string> = {
        [UserRole.STUDENT]: "/student",
        [UserRole.INSTRUCTOR]: "/professor",
        [UserRole.MANAGER]: "/manager",
        [UserRole.ADMIN]: "/admin",
      }
      const redirectPath = searchParams.get("redirect") || `${rolePathMap[role] || "/"}/`
      router.replace(redirectPath)
    }
  }, [isAuthenticated, role, router, searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!credentials.email || !credentials.password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    try {
      await login(credentials)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur inattendue est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/aiac-building.jpg"
          alt="AIAC Campus"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>
{/* Login Form with Blur Background */}
<div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/30">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">AIAC INTRANET</h2>
            <p className="text-white/90 drop-shadow">Connectez-vous pour accéder à votre espace</p>
          </div>

          <form className="space-y-6" method="post" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-white/30 placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 bg-white/20 backdrop-blur-sm"
                  placeholder="Entrez votre email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-white/30 placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 bg-white/20 backdrop-blur-sm"
                  placeholder="Entrez votre mot de passe"
                  value={credentials.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-white/30"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Connexion…
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Se connecter
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
