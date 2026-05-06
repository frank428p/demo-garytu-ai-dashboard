"use client";

import { useState } from "react";
import { Button, Card, Upload } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectorCoverType = "movement" | "motion";

interface SelectorCoverProps {
  type: SelectorCoverType;
}

const LABEL: Record<SelectorCoverType, string> = {
  movement: "Movement Selector",
  motion: "Motion Selector",
};

// ─── SelectorCover ────────────────────────────────────────────────────────────

export default function SelectorCover({ type }: SelectorCoverProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  function handleUpload(file: File) {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    return false;
  }

  function handleRemove() {
    setCoverFile(null);
    setCoverPreview(null);
  }

  return (
    <Card title={`${LABEL[type]} Cover`} className="mb-4">
      <div className="flex flex-col gap-3">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleUpload}
        >
          <Button icon={<UploadOutlined />}>上傳 Cover Image</Button>
        </Upload>

        {coverPreview && (
          <div className="flex flex-col gap-2">
            <img
              src={coverPreview}
              alt={`${LABEL[type]} cover`}
              className="max-h-[200px] w-auto rounded object-contain border border-gray-200"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{coverFile?.name}</span>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemove}
              >
                移除
              </Button>
            </div>
          </div>
        )}

        {!coverPreview && (
          <span className="text-xs text-gray-400">尚未上傳封面圖片</span>
        )}
      </div>
    </Card>
  );
}
