"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import type { LoginCredentials } from "@/types/auth"
import { toast } from "react-toastify"
import { useRouter, useSearchParams } from "next/navigation"
import { UserRole } from "@/types/auth"
import Image from "next/image"
import { Lock, LogIn, Loader2 } from "lucide-react"  // if using Lucide icons

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
    if (isAuthenticated && role) {
      const rolePathMap: Record<UserRole, string> = {
        [UserRole.ETUDIANT]: "/student",
        [UserRole.PROFESSEUR]: "/professor",
        [UserRole.MANAGER]: "/manager",
        [UserRole.ADMINISTRATEUR]: "/admin",
      }
      const redirectPath = searchParams.get("redirect") || `${rolePathMap[role]}/`
      router.replace(redirectPath)
    }
  }, [isAuthenticated, role, router, searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!credentials.email || !credentials.password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await login(credentials)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
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
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">AIAC INTRANET</h2>
            <p className="text-white/90 drop-shadow">Sign in to access your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-white/30 placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 bg-white/20 backdrop-blur-sm"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-white/30 placeholder-white/60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 bg-white/20 backdrop-blur-sm"
                  placeholder="Enter your password"
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
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign in
                  </span>
                )}
              </button>
            </div>
{/* 
            <div className="text-center">
              <a href="#" className="text-sm text-white/80 hover:text-white transition-colors duration-200 drop-shadow">
                Forgot your password?
              </a>
            </div> */}
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
