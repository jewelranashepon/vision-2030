"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

export default function CheckEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to check email.")
      }

      toast.success(data.message)
      router.push(`/change-password?email=${encodeURIComponent(email)}`)
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
              <CardTitle className="text-xl font-semibold text-gray-800">Change Your Password</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your email to proceed with password change.
              </CardDescription>
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
            <motion.form onSubmit={handleSubmit} className="space-y-4" variants={itemVariants}>
              <motion.div className="space-y-2" whileFocus={{ scale: 1.01 }}>
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    <Icons.mail className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Checking Email..." : "Check Email"}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
