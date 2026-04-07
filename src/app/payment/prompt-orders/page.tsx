"use client";

import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

const { Title } = Typography;

export default function PromptOrdersPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>Prompt Orders</Title>
      </DashboardLayout>
    </AppProvider>
  );
}
