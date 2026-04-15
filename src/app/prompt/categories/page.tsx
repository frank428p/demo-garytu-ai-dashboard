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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/@core/apis/category";
import type { Category, CategoryFormData } from "@/@core/types/category";
import type { ApiMeta } from "@/@core/types/apiConfig";

const { Title } = Typography;

// ─── Category Form Modal ──────────────────────────────────────────────────────

interface CategoryModalProps {
  open: boolean;
  editing: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryFormFields {
  code: string;
  name_zh: string;
  name_en: string;
  enabled: boolean;
}

function CategoryModal({ open, editing, onClose, onSuccess }: CategoryModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<CategoryFormFields>();
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
    let values: CategoryFormFields;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload: CategoryFormData = {
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
        await updateCategory(String(editing.id), payload);
        message.success("更新成功");
      } else {
        await createCategory(payload);
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
      title={editing ? "編輯分類" : "新增分類"}
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
          <Input placeholder="例如: portrait" />
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

function PromptCategoriesContent() {
  const { message, modal } = App.useApp();
  const [data, setData] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ page: 1, page_size: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchData = useCallback(
    async (page: number, pageSize: number, searchVal: string) => {
      setLoading(true);
      try {
        const res = await getCategories({ page, page_size: pageSize, search: searchVal || undefined });
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

  function handleOpenEdit(record: Category) {
    setEditing(record);
    setModalOpen(true);
  }

  async function handleDelete(id: number) {
    try {
      await deleteCategory(String(id));
      message.success("刪除成功");
      fetchData(meta.page, meta.page_size, search);
    } catch {
      message.error("刪除失敗");
    }
  }

  const columns: TableProps<Category>["columns"] = [
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
      render: (_: unknown, record: Category) =>
        record.translations.find((t) => t.locale === "zh-TW")?.name ?? "-",
    },
    {
      title: "英文名稱",
      key: "name_en",
      render: (_: unknown, record: Category) =>
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
      render: (_: unknown, record: Category) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="確定刪除此分類？"
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
          Prompt Categories
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

      <CategoryModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchData(meta.page, meta.page_size, search)}
      />
    </>
  );
}

export default function PromptCategoriesPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <PromptCategoriesContent />
      </DashboardLayout>
    </AppProvider>
  );
}
