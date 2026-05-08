"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  App,
  Card,
  Descriptions,
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
  Divider,
  Typography,
} from "antd";
import { getPrompt, createPrompt, updatePrompt } from "@/@core/apis/prompt";
import { getEnabledCategories } from "@/@core/apis/category";
import type { Category } from "@/@core/types/category";
import type { PromptFormData, MediaType } from "@/@core/types/prompt";
import type { Locale } from "@/@core/types/common";

const { TextArea } = Input;
const { Text } = Typography;

const MEDIA_TYPE_OPTIONS: { label: string; value: MediaType }[] = [
  { label: "Image", value: "IMAGE" },
  { label: "Video", value: "VIDEO" },
];

const LOCALES: { label: string; value: Locale; index: number }[] = [
  { label: "繁體中文", value: "zh-TW", index: 0 },
  { label: "English", value: "en", index: 1 },
];

const DEFAULT_TRANSLATIONS: PromptFormData["translations"] = [
  { locale: "zh-TW", name: "", description: "" },
  { locale: "en", name: "", description: "" },
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [editInitialValues, setEditInitialValues] = useState<Partial<PromptFormData> | undefined>();
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    getEnabledCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    setInitializing(true);
    getPrompt(id)
      .then((res) => {
        const p = res.data;
        console.log("p", p);
        const translations = DEFAULT_TRANSLATIONS.map((t) => {
          const found = (p.translations ?? []).find((et) => et.locale === t.locale);
          return found ?? t;
        });
        setUuid(p.uuid ?? null);
        setEditInitialValues({
          translations,
          media_type: p.media_type,
          category_id: p.category?.id,
          price: p.price,
          bonus_credit: p.bonus_credit,
          enabled: p.enabled,
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
        initialValues={
          editInitialValues ?? {
            translations: DEFAULT_TRANSLATIONS,
            enabled: true,
            price: 0,
            bonus_credit: 0,
          }
        }
      >
        {isXs && (
          <Form.Item label="啟用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        {isEdit && (
          <Descriptions size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="ID">{id}</Descriptions.Item>
            <Descriptions.Item label="UUID">{uuid ?? "-"}</Descriptions.Item>
          </Descriptions>
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
              label="價格"
              name="price"
              rules={[{ required: true, message: "請輸入價格" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={5}>
            <Form.Item
              label="贈送點數"
              name="bonus_credit"
              rules={[{ required: true, message: "請輸入點數" }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={5}>
            <Form.Item label="風格" name="category_id">
              <Select
                showSearch
                allowClear
                placeholder="請選擇風格"
                optionFilterProp="label"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.translations.find((t) => t.locale === "zh-TW")?.name ?? c.code,
                }))}
              />
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

        <Divider />

        {LOCALES.map(({ label, value, index }) => (
          <div key={value}>
            <Text strong className="block mb-3">
              {label} ({value})
            </Text>

            {/* hidden local field */}
            <Form.Item name={["translations", index, "locale"]} hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="名稱"
              name={["translations", index, "name"]}
              rules={[{ required: true, message: `請輸入${label}名稱` }]}
            >
              <Input placeholder={`請輸入${label}名稱`} />
            </Form.Item>

            <Form.Item label="描述" name={["translations", index, "description"]}>
              <TextArea autoSize={{ minRows: 4 }} placeholder={`請輸入${label}描述`} />
            </Form.Item>

            {index < LOCALES.length - 1 && <Divider dashed />}
          </div>
        ))}

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
