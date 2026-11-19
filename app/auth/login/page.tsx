"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async () => {
        setLoading(true)
        setError("")
        if (!email || !password) {
            setError("Email and password are required")
            setLoading(false)
            return
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }
        router.push("/")
        router.refresh()
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login to TaskFlow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {/* FIX - Forgot Password Link - Password ke neeche */}
                    <div className="flex justify-end">
                        <Link href="/auth/forgot-password" className="text-sm text-zinc-500 hover:text-white transition-colors cursor-pointer">
                            Forgot Password?
                        </Link>
                    </div>
                    <Button className="w-full" onClick={handleLogin} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>

                    {/* FIX - signup  */}
                    <p className="text-sm text-center text-zinc-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                            Sign Up
                        </Link>
                    </p>

                    {/* Backup button - Agar upar wala Link bhi na chale to ye dabao */}
                    <Button variant="outline" className="w-full" onClick={() => router.push("/auth/signup")}>
                        Create New Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}