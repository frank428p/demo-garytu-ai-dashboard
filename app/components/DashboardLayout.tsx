"use client";

import { useState } from "react";
import { Layout, Menu, Button, Avatar, Badge, Typography, Space } from "antd";
import {
  DashboardOutlined,
  RobotOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps["items"] = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "總覽",
  },
  {
    key: "/ai-models",
    icon: <RobotOutlined />,
    label: "AI 模型",
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: "數據分析",
  },
  {
    key: "/reports",
    icon: <FileTextOutlined />,
    label: "報告",
  },
  {
    type: "divider",
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: "設定",
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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
          defaultSelectedKeys={["/"]}
          items={menuItems}
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
