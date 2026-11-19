"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleSignup = async () => {
        setLoading(true)
        setError("")
        setSuccess("")
        if (!name || !email || !password) {
            setError("All fields are required")
            setLoading(false)
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            setLoading(false)
            return
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }
        setSuccess("Account created! Redirecting to Login...")
        setLoading(false)
        // 2 second baad khud Login page pe bhej do
        setTimeout(() => {
            router.push("/auth/login")
        }, 2000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Create TaskFlow Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                    {success && (
                        <div className="space-y-2">
                            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>
                            <Button variant="outline" className="w-full" onClick={() => router.push("/auth/login")}>
                                Go to Login
                            </Button>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handleSignup} disabled={loading}>
                        {loading ? "Creating..." : "Sign Up"}
                    </Button>
                     <Link href="/auth/login" className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                            Already have an account? Login
                        </Link>
                </CardContent>
            </Card>
        </div>
    )
}