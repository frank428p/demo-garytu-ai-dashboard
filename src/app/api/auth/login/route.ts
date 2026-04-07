import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${API_BASE_URL}/cms/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const accessToken: string | undefined = data?.data?.access_token

  if (!res.ok || !accessToken) {
    return Response.json(
      { error: data?.message ?? '帳號或密碼錯誤' },
      { status: res.ok ? 400 : res.status },
    )
  }

  const cookieStore = await cookies()
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }

  // httpOnly session cookie — used by middleware for auth guard
  cookieStore.set('session', accessToken, { ...cookieOptions, httpOnly: true })
  // readable token cookie — used by client-side axios for Bearer auth
  cookieStore.set('token', accessToken, { ...cookieOptions, httpOnly: false })

  return Response.json({ success: true })
}
