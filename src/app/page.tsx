"use client";

import { Card, Col, Row, Statistic, Typography, Tag, Table, Progress, Space, Avatar } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

const { Title, Text } = Typography;

const recentModels = [
  { key: "1", name: "GPT-4o", provider: "OpenAI", requests: 12430, cost: "$245.20", status: "運行中" },
  { key: "2", name: "Claude 3.5 Sonnet", provider: "Anthropic", requests: 8920, cost: "$178.40", status: "運行中" },
  { key: "3", name: "Gemini 1.5 Pro", provider: "Google", requests: 4210, cost: "$84.20", status: "待機" },
  { key: "4", name: "Llama 3.1 70B", provider: "Meta", requests: 2150, cost: "$21.50", status: "運行中" },
];

const columns = [
  {
    title: "模型名稱",
    dataIndex: "name",
    key: "name",
    render: (name: string, record: { provider: string }) => (
      <Space>
        <Avatar size="small" icon={<RobotOutlined />} style={{ background: "#6366f1" }} />
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.provider}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: "請求次數",
    dataIndex: "requests",
    key: "requests",
    render: (v: number) => v.toLocaleString(),
  },
  {
    title: "花費",
    dataIndex: "cost",
    key: "cost",
  },
  {
    title: "狀態",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color={status === "運行中" ? "green" : "gold"}>{status}</Tag>
    ),
  },
];

export default function HomePage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4} style={{ marginBottom: 24 }}>
          Overview
        </Title>

       
      </DashboardLayout>
    </AppProvider>
  );
}
