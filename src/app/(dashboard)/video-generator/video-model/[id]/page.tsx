"use client";

import { use } from "react";
import { Card, Descriptions, Divider, Form, Input, Typography } from "antd";

const { Title, Text } = Typography;

const MOCK_MODELS = [{ id: "1", provider: "KLING", model: "kling-v1-6", model_name: "Kling 1.6" }];

export default function VideoModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const model = MOCK_MODELS.find((m) => m.id === id);

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>
        Video Model
      </Title>
      <Card title="Model Info">
        <Descriptions>
          <Descriptions.Item label="Provider">
            <Text code>{model?.provider ?? "-"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Model">
            <Text code>{model?.model ?? "-"}</Text>
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Form layout="vertical">
          <Form.Item label="名稱" name="name">
            <Input style={{ width: 200 }} />
          </Form.Item>
          <Form.Item label="描述 (zh-TW)" name="description_zh">
            <Input />
          </Form.Item>
          <Form.Item label="描述 (en)" name="description_en">
            <Input />
          </Form.Item>

          <Divider />

          <Typography>這邊依照Kling API文件 會影響消耗Unit的欄位長出來並且可設定點數</Typography>
        </Form>
      </Card>
    </>
  );
}
