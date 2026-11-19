"use client"

import { useEffect , useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")


  // FIX - URL me code hai to usko session me badlo
  useEffect(() => {
    const handleCode = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }
    }
    handleCode()
  }, [])

  const handleReset = async () => {
    setLoading(true)
    setError("")
    if (!password || !confirm) {
      setError("Both fields are required")
      setLoading(false)
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess("Password updated! Redirecting to Login...")
    setTimeout(() => router.push("/auth/login"), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>}
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="Type again" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleReset} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}