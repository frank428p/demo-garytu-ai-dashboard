"use client";

import { Table, Typography } from "antd";
import { useRouter } from "next/navigation";
import type { TableProps } from "antd";

const { Title, Text } = Typography;

interface VideoModel {
  id: string;
  provider: string;
  model: string;
  model_name: string;
}

const columns: TableProps<VideoModel>["columns"] = [
  {
    title: "Provider",
    dataIndex: "provider",
    key: "provider",
    render: (value: string) => <Text code>{value}</Text>,
  },
  {
    title: "Model",
    dataIndex: "model",
    key: "model",
    render: (value: string) => <Text code>{value}</Text>,
  },
  {
    title: "Model Name",
    dataIndex: "model_name",
    key: "model_name",
  },
];

export default function VideoModelPage() {
  const router = useRouter();

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>Video Model</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={[
          { id: "1", provider: "KLING", model: "kling-v1-6", model_name: "Kling 1.6" },
        ]}
        onRow={(record) => ({
          onClick: () => router.push(`/video-generator/video-model/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </>
  );
}