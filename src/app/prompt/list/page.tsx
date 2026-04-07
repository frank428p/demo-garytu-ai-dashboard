"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Tag, Switch, Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";
import { getPrompts } from "@/@core/apis/prompt";
import type { Prompt } from "@/@core/types/prompt";
import type { ApiMeta } from "@/@core/types/apiConfig";

const { Title } = Typography;

export default function PromptListPage() {
  const router = useRouter();
  const [data, setData] = useState<Prompt[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ page: 1, page_size: 10, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);

  const columns: TableProps<Prompt>["columns"] = [
    {
      title: "名稱",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "類型",
      dataIndex: "media_type",
      key: "media_type",
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: "分類",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "價格",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "標籤",
      dataIndex: "labels",
      key: "labels",
      render: (labels: Prompt["labels"]) =>
        labels.map((l) => <Tag key={l.code}>{l.name}</Tag>),
    },
    {
      title: "啟用",
      dataIndex: "enabled",
      key: "enabled",
      render: (value: boolean) => <Switch checked={value} disabled />,
    },
  ];

  async function fetchData(page: number, pageSize: number) {
    setLoading(true);
    try {
      const res = await getPrompts({ page, page_size: pageSize });
      setData(res.data);
      if (res.meta) setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(meta.page, meta.page_size);
  }, []);

  return (
    <AppProvider>
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Prompt List</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/prompt/create")}
          >
            新增
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          onRow={(record) => ({
            onClick: () => router.push(`/prompt/${record.id}`),
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: meta.page,
            pageSize: meta.page_size,
            total: meta.total,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </DashboardLayout>
    </AppProvider>
  );
}
