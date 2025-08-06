"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")

  const [email, setEmail] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState(1) // 1: verify old password, 2: set new password

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery))
    } else {
      setError("Email not provided. Please go back and enter your email.")
      toast.error("Email not provided.")
    }
  }, [emailFromQuery])

  const handleVerifyOldPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!email) {
      setError("Email is missing.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/verify-old-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, oldPassword }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify old password.")
      }

      setSuccess(data.message)
      toast.success(data.message)
      setStep(2) // Move to the next step: set new password
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!email) {
      setError("Email is missing.")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.")
      }

      setSuccess(data.message)
      toast.success(data.message)
      router.push("/login") // Redirect to login after successful reset
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"
          animate={{
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
            <motion.div
              className="flex items-center justify-center mb-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white p-3 rounded-full shadow-lg">
                <Icons.logo className="h-10 w-10 text-blue-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">Vision - 2030</CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              Empowering every member, every step of the way.
            </CardDescription>
          </div>
          <CardHeader className="space-y-1">
            <motion.div variants={itemVariants}>
              {step === 1 && (
                <>
                  <CardTitle className="text-xl font-semibold text-gray-800">Verify Old Password</CardTitle>
                  <CardDescription className="text-gray-500">
                    Enter your current password for <span className="font-semibold text-blue-600">{email}</span>.
                  </CardDescription>
                </>
              )}
              {step === 2 && (
                <>
                  <CardTitle className="text-xl font-semibold text-gray-800">Set New Password</CardTitle>
                  <CardDescription className="text-gray-500">
                    Enter and confirm your new password.
                  </CardDescription>
                </>
              )}
            </motion.div>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {step === 1 && (
              <motion.form onSubmit={handleVerifyOldPassword} className="space-y-4" variants={itemVariants}>
                <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }}>
                  <Label htmlFor="old-password" className="text-gray-700">
                    Old Password
                  </Label>
                  <Input
                    id="old-password"
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="mr-2"
                      >
                        <Icons.spinner className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Icons.key className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Verifying..." : "Verify Password"}
                  </Button>
                </motion.div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form onSubmit={handleChangePassword} className="space-y-4" variants={itemVariants}>
                <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }}>
                  <Label htmlFor="new-password" className="text-gray-700">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }}>
                  <Label htmlFor="confirm-new-password" className="text-gray-700">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="mr-2"
                      >
                        <Icons.spinner className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Icons.edit className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Resetting Password..." : "Change Password"}
                  </Button>
                </motion.div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(1)
                    setOldPassword("")
                    setNewPassword("")
                    setConfirmNewPassword("")
                    setError("")
                    setSuccess("")
                  }}
                  className="w-full"
                >
                  Go Back
                </Button>
              </motion.form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
