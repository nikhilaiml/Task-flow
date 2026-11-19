// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Verify / Google login ke baad Home pe bhej do
  return NextResponse.redirect(new URL("/", request.url))
}