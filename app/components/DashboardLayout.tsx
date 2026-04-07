"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Button, Avatar, Badge, Typography, Space } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  FolderOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  SettingOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps["items"] = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "Overview",
  },
  {
    key: "prompt",
    icon: <FileTextOutlined />,
    label: "Prompt",
    children: [
      {
        key: "/prompt/styles",
        icon: <FileTextOutlined />,
        label: "Prompt Styles",
      },
      {
        key: "/prompt/list",
        icon: <UnorderedListOutlined />,
        label: "Prompt List",
      },
      {
        key: "/prompt/collections",
        icon: <FolderOutlined />,
        label: "Prompt Collections",
      },
    ],
  },
  {
    key: "user",
    icon: <UserOutlined />,
    label: "User",
    children: [
      {
        key: "/user/list",
        icon: <UnorderedListOutlined />,
        label: "User List",
      },
    ],
  },
  {
    key: "payment",
    icon: <ShoppingCartOutlined />,
    label: "Payment",
    children: [
      {
        key: "/payment/prompt-orders",
        icon: <ShoppingCartOutlined />,
        label: "Prompt Orders",
      },
      {
        key: "/payment/subscription-orders",
        icon: <CrownOutlined />,
        label: "Subscription Orders",
      },
    ],
  },
  {
    key: "system",
    icon: <SettingOutlined />,
    label: "System",
    children: [
      {
        key: "/system/ai-model-settings",
        icon: <RobotOutlined />,
        label: "AI Model Settings",
      },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: "#1a1a2e",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 20px",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ThunderboltOutlined style={{ color: "#6366f1", fontSize: 22 }} />
          {!collapsed && (
            <Text strong style={{ color: "#fff", fontSize: 16, whiteSpace: "nowrap" }}>
              GaryTu AI
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={["prompt", "user", "payment", "system"]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ background: "transparent", borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space size={16}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Avatar
              icon={<UserOutlined />}
              style={{ background: "#6366f1", cursor: "pointer" }}
            />
          </Space>
        </Header>

        <Content style={{ margin: 24, minHeight: "calc(100vh - 112px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
