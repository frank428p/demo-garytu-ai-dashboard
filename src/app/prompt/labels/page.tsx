"use client";

import { useEffect, useState, useCallback } from "react";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import AppProvider from "@/components/AppProvider";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from "@/@core/apis/label";
import type { Label, LabelFormData } from "@/@core/types/label";
import type { ApiMeta } from "@/@core/types/apiConfig";

const { Title } = Typography;

// ─── Label Form Modal ─────────────────────────────────────────────────────────

interface LabelModalProps {
  open: boolean;
  editing: Label | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface LabelFormFields {
  code: string;
  name_zh: string;
  name_en: string;
  enabled: boolean;
}

function LabelModal({ open, editing, onClose, onSuccess }: LabelModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<LabelFormFields>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          code: editing.code,
          enabled: editing.enabled,
          name_zh: editing.translations.find((t) => t.locale === "zh-TW")?.name ?? "",
          name_en: editing.translations.find((t) => t.locale === "en")?.name ?? "",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ enabled: true });
      }
    }
  }, [open, editing, form]);

  async function handleOk() {
    let values: LabelFormFields;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload: LabelFormData = {
      code: values.code,
      enabled: values.enabled,
      translations: [
        { locale: "zh-TW", name: values.name_zh },
        { locale: "en", name: values.name_en },
      ],
    };
    setLoading(true);
    try {
      if (editing) {
        await updateLabel(String(editing.id), payload);
        message.success("更新成功");
      } else {
        await createLabel(payload);
        message.success("新增成功");
      }
      onSuccess();
      onClose();
    } catch {
      message.error(editing ? "更新失敗" : "新增失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={editing ? "編輯標籤" : "新增標籤"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="確認"
      cancelText="取消"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item
          name="code"
          label="代碼 (code)"
          rules={[{ required: true, message: "請輸入代碼" }]}
        >
          <Input placeholder="例如: ai.prompt" />
        </Form.Item>

        <Form.Item
          name="name_zh"
          label="名稱 (zh-TW)"
          rules={[{ required: true, message: "請輸入中文名稱" }]}
        >
          <Input placeholder="中文名稱" />
        </Form.Item>

        <Form.Item
          name="name_en"
          label="名稱 (en)"
          rules={[{ required: true, message: "請輸入英文名稱" }]}
        >
          <Input placeholder="English name" />
        </Form.Item>

        <Form.Item name="enabled" label="啟用" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PromptLabelsContent() {
  const { message } = App.useApp();
  const [data, setData] = useState<Label[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Label | null>(null);

  const fetchData = useCallback(
    async (page: number, pageSize: number, searchVal: string) => {
      setLoading(true);
      try {
        const res = await getLabels({ page, page_size: pageSize, search: searchVal || undefined });
        setData(res.data);
        if (res.meta) setMeta(res.meta);
      } catch {
        message.error("載入失敗");
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  useEffect(() => {
    fetchData(1, meta.page_size, "");
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    fetchData(1, meta.page_size, value);
  }

  function handleOpenCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleOpenEdit(record: Label) {
    setEditing(record);
    setModalOpen(true);
  }

  async function handleDelete(id: number) {
    try {
      await deleteLabel(String(id));
      message.success("刪除成功");
      fetchData(meta.page, meta.page_size, search);
    } catch {
      message.error("刪除失敗");
    }
  }

  const columns: TableProps<Label>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "代碼",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "中文名稱",
      key: "name_zh",
      render: (_: unknown, record: Label) =>
        record.translations.find((t) => t.locale === "zh-TW")?.name ?? "-",
    },
    {
      title: "英文名稱",
      key: "name_en",
      render: (_: unknown, record: Label) =>
        record.translations.find((t) => t.locale === "en")?.name ?? "-",
    },
    {
      title: "啟用",
      dataIndex: "enabled",
      key: "enabled",
      width: 80,
      render: (value: boolean) => <Switch checked={value} disabled size="small" />,
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Label) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="確定刪除此標籤？"
            onConfirm={() => handleDelete(record.id)}
            okText="刪除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Prompt Labels
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
          新增
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜尋代碼或名稱"
          allowClear
          onSearch={handleSearch}
          style={{ width: 280 }}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: meta.page,
          pageSize: meta.page_size,
          total: meta.total,
          onChange: (page, pageSize) => fetchData(page, pageSize, search),
        }}
      />

      <LabelModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchData(meta.page, meta.page_size, search)}
      />
    </>
  );
}

export default function PromptLabelsPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <PromptLabelsContent />
      </DashboardLayout>
    </AppProvider>
  );
}
