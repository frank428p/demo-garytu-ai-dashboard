"use client";

import { use } from "react";
import { Typography } from "antd";
import PromptForm from "@/components/prompt/PromptForm";
import PromptFilesForm from "@/components/prompt/PromptFilesForm";

const { Title } = Typography;

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <>
        <Title level={4}>編輯 Prompt</Title>
        <div className="flex flex-col gap-6">
          <PromptForm id={id} />
          <PromptFilesForm id={id} />
        </div>
    </>
  );
}
