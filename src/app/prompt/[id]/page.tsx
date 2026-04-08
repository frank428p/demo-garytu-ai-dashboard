"use client";

import { use } from "react";
import { Typography } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";
import PromptForm from "@/components/prompt/PromptForm";
import PromptFilesForm from "@/components/prompt/PromptFilesForm";

const { Title } = Typography;

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AppProvider>
      <DashboardLayout>
        <Title level={4}>編輯 Prompt</Title>
        <PromptForm id={id} />
        <PromptFilesForm id={id} />
      </DashboardLayout>
    </AppProvider>
  );
}
