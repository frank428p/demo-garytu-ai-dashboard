"use client";

import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

const { Title } = Typography;

export default function AiModelSettingsPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>AI Model Settings</Title>
      </DashboardLayout>
    </AppProvider>
  );
}
