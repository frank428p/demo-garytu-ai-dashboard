"use client";

import { useEffect, useState } from "react";
import { App, Button, Card, Upload } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  getVideoSelectorTypeThumbnail,
  updateVideoSelectorTypeThumbnail,
  deleteVideoSelectorTypeThumbnail,
} from "@/@core/apis/videoSelector";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectorCoverType = "movement" | "motion";

interface SelectorCoverProps {
  type: SelectorCoverType;
}

const LABEL: Record<SelectorCoverType, string> = {
  movement: "Movement Selector",
  motion: "Motion Selector",
};

const API_TYPE: Record<SelectorCoverType, string> = {
  movement: "MOVEMENT",
  motion: "MOTION",
};

// ─── SelectorCover ────────────────────────────────────────────────────────────

export default function SelectorCover({ type }: SelectorCoverProps) {
  const { message } = App.useApp();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchThumbnail() {
      setLoading(true);
      try {
        const res = await getVideoSelectorTypeThumbnail(API_TYPE[type]);
        setCoverPreview(res.data.thumbnail?.url ?? null);
      } catch {
        // no thumbnail yet — ignore
      } finally {
        setLoading(false);
      }
    }
    fetchThumbnail();
  }, [type]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const res = await updateVideoSelectorTypeThumbnail(API_TYPE[type], file);
      setCoverPreview(res.data.thumbnail?.url ?? URL.createObjectURL(file));
      message.success("上傳成功");
    } catch {
      message.error("上傳失敗");
    } finally {
      setUploading(false);
    }
    return false;
  }

  async function handleRemove() {
    setDeleting(true);
    try {
      await deleteVideoSelectorTypeThumbnail(API_TYPE[type]);
      setCoverPreview(null);
      message.success("已刪除");
    } catch {
      message.error("刪除失敗");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card title={`${LABEL[type]} Thumbnail`} className="mb-4" loading={loading}>
      <div className="flex flex-col gap-3">
        <Upload accept="image/*" showUploadList={false} beforeUpload={handleUpload}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            上傳 Cover Image
          </Button>
        </Upload>

        {coverPreview && (
          <div className="flex flex-col gap-2">
            <img
              src={coverPreview}
              alt={`${LABEL[type]} cover`}
              className="max-h-[200px] w-auto rounded object-contain border border-gray-200"
            />
            <div className="flex items-center gap-2">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
                onClick={handleRemove}
              >
                移除
              </Button>
            </div>
          </div>
        )}

        {!coverPreview && <span className="text-xs text-gray-400">尚未上傳封面圖片</span>}
      </div>
    </Card>
  );
}
