"use client";

import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";
import PromptForm from "@/components/prompt/PromptForm";

const { Title } = Typography;

export default function PromptCreatePage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>新增 Prompt</Title>
        <PromptForm />
      </DashboardLayout>
    </AppProvider>
  );
}
