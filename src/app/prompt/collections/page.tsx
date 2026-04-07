"use client";

import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

const { Title } = Typography;

export default function PromptCollectionsPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>Prompt Collections</Title>
      </DashboardLayout>
    </AppProvider>
  );
}
