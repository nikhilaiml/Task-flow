"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleForgot = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    if (!email) {
      setError("Please enter your email")
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess("Password reset link sent! Check your email.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-zinc-500">Enter your email, we will send you a reset link.</p>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleForgot} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          <p className="text-sm text-center text-zinc-500">
            Remember password?{" "}
            <Link href="/auth/login" className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}