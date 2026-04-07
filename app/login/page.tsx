'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import AppProvider from '@/app/components/AppProvider'

const { Title, Text } = Typography

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

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

          {state?.error && (
            <Alert
              message={state.error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <form action={action}>
            <Form layout="vertical" component="div">
              <Form.Item label="帳號" style={{ marginBottom: 16 }}>
                <Input
                  name="username"
                  prefix={<UserOutlined />}
                  placeholder="請輸入帳號"
                  size="large"
                  required
                />
              </Form.Item>
              <Form.Item label="密碼" style={{ marginBottom: 24 }}>
                <Input.Password
                  name="password"
                  prefix={<LockOutlined />}
                  placeholder="請輸入密碼"
                  size="large"
                  required
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
          </form>
        </Card>
      </div>
    </AppProvider>
  )
}
