'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { error: '帳號或密碼錯誤' }
  }

  const cookieStore = await cookies()
  cookieStore.set('session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}
