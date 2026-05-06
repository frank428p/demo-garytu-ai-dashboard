"use client";

import { Typography } from "antd";
import PromptForm from "@/components/prompt/PromptForm";

const { Title } = Typography;

export default function PromptCreatePage() {
  return (
    <>
        <Title level={4}>新增 Prompt</Title>
        <PromptForm />
    </>
  );
}
