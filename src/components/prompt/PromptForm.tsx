"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  App,
  Card,
  Form,
  Grid,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  Spin,
  Row,
  Col,
} from "antd";
import { getPrompt, createPrompt, updatePrompt } from "@/@core/apis/prompt";
import type { PromptFormData, MediaType } from "@/@core/types/prompt";

const { TextArea } = Input;

const MEDIA_TYPE_OPTIONS: { label: string; value: MediaType }[] = [
  { label: "IMAGE", value: "IMAGE" },
  { label: "VIDEO", value: "VIDEO" },
  { label: "AUDIO", value: "AUDIO" },
  { label: "TEXT", value: "TEXT" },
];

interface Props {
  id?: string;
}

export default function PromptForm({ id }: Props) {
  const isEdit = !!id;
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const isXs = !screens.sm;
  const { message } = App.useApp();
  const [form] = Form.useForm<PromptFormData>();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(isEdit);
  const [editInitialValues, setEditInitialValues] = useState<Partial<PromptFormData> | undefined>();

  useEffect(() => {
    if (!isEdit) return;

    setInitializing(true);
    getPrompt(id)
      .then((res) => {
        const p = res.data;
        setEditInitialValues({
          name: p.name,
          description: p.description,
          media_type: p.media_type,
          category_id: p.category.id,
          price: p.price,
          bonus_credit: p.bonus_credit,
          enabled: p.enabled,
          // label_codes: p.labels.map((l) => l.code),
        });
      })
      .catch(() => message.error("載入資料失敗"))
      .finally(() => setInitializing(false));
  }, [id, isEdit]);

  async function handleSubmit(values: PromptFormData) {
    setLoading(true);
    try {
      if (isEdit) {
        const res = await updatePrompt(id, values);
        if (res.code !== 0) {
          message.error(res.message);
          return;
        }
        message.success("更新成功");
      } else {
        const res = await createPrompt(values);
        if (res.code !== 0) {
          message.error(res.message);
          return;
        }
        message.success("新增成功");
        router.push("/prompt/list");
      }
    } catch {
      message.error(isEdit ? "更新失敗" : "新增失敗");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card title="基礎設定">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={editInitialValues ?? { enabled: true, price: 0, bonus_credit: 0 }}
      >
        {isXs && (
          <Form.Item label="啟用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col xs={24} sm={5}>
            <Form.Item
              label="媒體類型"
              name="media_type"
              rules={[{ required: true, message: "請選擇媒體類型" }]}
            >
              <Select options={MEDIA_TYPE_OPTIONS} placeholder="請選擇媒體類型" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={5}>
            <Form.Item
              label="分類 ID"
              name="category_id"
              rules={[{ required: true, message: "請輸入分類 ID" }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} placeholder="請輸入分類 ID" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={5}>
            <Form.Item
              label="價格"
              name="price"
              rules={[{ required: true, message: "請輸入價格" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={5}>
            <Form.Item label="贈送點數" name="bonus_credit">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          {!isXs && (
            <Col sm={4}>
              <Form.Item label="啟用" name="enabled" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item label="名稱" name="name" rules={[{ required: true, message: "請輸入名稱" }]}>
          <Input placeholder="請輸入名稱" />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <TextArea autoSize={{ minRows: 4 }} placeholder="請輸入描述" />
        </Form.Item>

        {/* <Form.Item label="標籤代碼" name="label_codes">
          <Select mode="tags" placeholder="輸入標籤代碼後按 Enter" />
        </Form.Item> */}

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? "儲存" : "新增"}
            </Button>
            {/* <Button onClick={() => router.push("/prompt/list")}>取消</Button> */}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
