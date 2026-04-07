'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import axios from 'axios'
import AppProvider from '@/components/AppProvider'

const { Title, Text } = Typography

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(values: { username: string; password: string }) {
    setError(null)
    setPending(true)
    try {
      await axios.post('/api/auth/login', values)
      router.push('/')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '登入失敗，請稍後再試'
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <AppProvider>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <Card
          style={{
            width: 400,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
          styles={{ body: { padding: '40px 40px 32px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <ThunderboltOutlined style={{ fontSize: 40, color: '#6366f1' }} />
            <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
              GaryTu AI
            </Title>
            <Text type="secondary">請登入以繼續使用</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="帳號"
              name="username"
              rules={[{ required: true, message: '請輸入帳號' }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="請輸入帳號"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="密碼"
              name="password"
              rules={[{ required: true, message: '請輸入密碼' }]}
              style={{ marginBottom: 24 }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="請輸入密碼"
                size="large"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={pending}
              style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
              登入
            </Button>
          </Form>
        </Card>
      </div>
    </AppProvider>
  )
}
