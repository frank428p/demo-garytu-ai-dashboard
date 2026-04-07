"use client";

import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";

const { Title } = Typography;

export default function PromptListPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>Prompt List</Title>
      </DashboardLayout>
    </AppProvider>
  );
}
