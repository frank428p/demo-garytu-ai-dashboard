"use client";

import { useEffect, useState } from "react";
import { App, Button, Card, Divider, Spin, Upload, Typography, Row, Col } from "antd";
import { InboxOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { getPrompt, updatePromptFiles } from "@/@core/apis/prompt";
import type { PromptFile } from "@/@core/types/prompt";

const { Text } = Typography;

interface Props {
  id: string;
}

interface FilesState {
  cover: PromptFile | null;
  pdf: PromptFile | null;
  media: PromptFile[];
}

interface NewMediaItem {
  file: UploadFile;
  thumbnail?: UploadFile;
}

export default function PromptFilesForm({ id }: Props) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [existing, setExisting] = useState<FilesState>({ cover: null, pdf: null, media: [] });
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  // Cover
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const [coverThumbnail, setCoverThumbnail] = useState<UploadFile | null>(null);

  // PDF
  const [pdfFile, setPdfFile] = useState<UploadFile | null>(null);

  // New media items (each has main file + optional thumbnail)
  const [newMediaItems, setNewMediaItems] = useState<NewMediaItem[]>([]);

  useEffect(() => {
    getPrompt(id)
      .then((res) => {
        const p = res.data;
        setExisting({ cover: p.cover ?? null, pdf: p.pdf ?? null, media: p.files ?? [] });
      })
      .catch(() => message.error("載入檔案資料失敗"))
      .finally(() => setInitializing(false));
  }, [id]);

  function markDelete(fileId: string) {
    setDeleteIds((prev) => [...prev, fileId]);
  }

  function removeDeleteMark(fileId: string) {
    setDeleteIds((prev) => prev.filter((d) => d !== fileId));
  }

  function addNewMediaItem() {
    setNewMediaItems((prev) => [...prev, { file: {} as UploadFile }]);
  }

  function updateNewMediaItem(index: number, patch: Partial<NewMediaItem>) {
    setNewMediaItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeNewMediaItem(index: number) {
    setNewMediaItems((prev) => prev.filter((_, i) => i !== index));
  }

  function fileKey(file: File) {
    return file.name.replace(/\.[^.]+$/, "");
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const files: Record<string, File> = {};
      const payload: Parameters<typeof updatePromptFiles>[1] = {
        delete_ids: deleteIds.length ? deleteIds : undefined,
      };

      // Cover: new upload → file_key only (no id); server removes old one automatically
      if (coverFile?.originFileObj) {
        files["cover"] = coverFile.originFileObj;
        payload.cover = { file_key: "cover" };
        if (coverThumbnail?.originFileObj) {
          files["cover_thumbnail"] = coverThumbnail.originFileObj;
          payload.cover.thumbnail_key = "cover_thumbnail";
        }
      }
      // Cover: no update → omit

      // PDF: new upload → file_key only; no update → omit
      if (pdfFile?.originFileObj) {
        const pdfKey = fileKey(pdfFile.originFileObj);
        files[pdfKey] = pdfFile.originFileObj;
        payload.pdf = { file_key: pdfKey };
      }

      // Media: existing kept (id + position) + new uploads (file_key + position, no id)
      const keptMedia = existing.media
        .filter((f) => !deleteIds.includes(f.id))
        .map((f, i) => ({ id: f.id, position: i }));

      const uploadedNewMedia = newMediaItems
        .filter((item) => item.file?.originFileObj)
        .map((item, i) => {
          const mainKey = fileKey(item.file.originFileObj!);
          files[mainKey] = item.file.originFileObj!;
          const entry: { file_key: string; thumbnail_key?: string; position: number } = {
            file_key: mainKey,
            position: keptMedia.length + i,
          };
          if (item.thumbnail?.originFileObj) {
            const thumbKey = fileKey(item.thumbnail.originFileObj);
            files[thumbKey] = item.thumbnail.originFileObj;
            entry.thumbnail_key = thumbKey;
          }
          return entry;
        });

      if (keptMedia.length + uploadedNewMedia.length > 0) {
        payload.media = [...keptMedia, ...uploadedNewMedia];
      }

      const res = await updatePromptFiles(
        id,
        payload,
        Object.keys(files).length ? files : undefined
      );
      if (res.code !== 0) {
        message.error(res.message);
        return;
      }

      message.success("檔案更新成功");
      const refreshed = await getPrompt(id);
      const p = refreshed.data;
      setExisting({ cover: p.cover ?? null, pdf: p.pdf ?? null, media: p.files ?? [] });
      setDeleteIds([]);
      setCoverFile(null);
      setCoverThumbnail(null);
      setPdfFile(null);
      setNewMediaItems([]);
    } catch {
      message.error("檔案更新失敗");
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
    <Card title="檔案管理" style={{ marginTop: 16 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          {/* ── Cover ── */}
          <div className="pb-6">
            <Text strong>封面媒體 (aspect ratio: 16:9)</Text>
            <ExistingFileRow
              file={existing.cover}
              isDeleted={existing.cover ? deleteIds.includes(existing.cover.id) : false}
              onDelete={() => existing.cover && markDelete(existing.cover.id)}
              onRestore={() => existing.cover && removeDeleteMark(existing.cover.id)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  原圖
                </Text>
                <Upload.Dragger
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={() => false}
                  fileList={coverFile ? [coverFile] : []}
                  onChange={({ fileList }) => setCoverFile(fileList[0] ?? null)}
                >
                  <InboxOutlined />
                  <p className="ant-upload-text">封面原圖</p>
                </Upload.Dragger>
              </div>
              <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  縮圖
                </Text>
                <Upload.Dragger
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={() => false}
                  fileList={coverThumbnail ? [coverThumbnail] : []}
                  onChange={({ fileList }) => setCoverThumbnail(fileList[0] ?? null)}
                >
                  <InboxOutlined />
                  <p className="ant-upload-text">封面縮圖</p>
                </Upload.Dragger>
              </div>
            </div>
          </div>

          {/* ── Media ── */}
          <div>
            <Text strong>媒體檔案 (aspect ratio: 1:1)</Text>
          </div>
          {existing.media.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
              {existing.media.map((f) => (
                <div key={f.id} style={{ position: "relative" }}>
                  <img
                    src={f.thumbnail_url ?? f.url}
                    alt={f.uuid}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                      opacity: deleteIds.includes(f.id) ? 0.3 : 1,
                    }}
                  />
                  {deleteIds.includes(f.id) ? (
                    <Button
                      size="small"
                      style={{ position: "absolute", top: 2, right: 2 }}
                      onClick={() => removeDeleteMark(f.id)}
                    >
                      復原
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ position: "absolute", top: 2, right: 2 }}
                      onClick={() => markDelete(f.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {newMediaItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginTop: 8,
                padding: 8,
                border: "1px dashed #d9d9d9",
                borderRadius: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  原圖 #{i + 1}
                </Text>
                <Upload.Dragger
                  maxCount={1}
                  beforeUpload={() => false}
                  fileList={item.file?.uid ? [item.file] : []}
                  onChange={({ fileList }) => updateNewMediaItem(i, { file: fileList[0] })}
                >
                  <InboxOutlined />
                  <p className="ant-upload-text">媒體檔案</p>
                </Upload.Dragger>
              </div>
              <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  縮圖 #{i + 1}（選填）
                </Text>
                <Upload.Dragger
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={() => false}
                  fileList={item.thumbnail?.uid ? [item.thumbnail] : []}
                  onChange={({ fileList }) => updateNewMediaItem(i, { thumbnail: fileList[0] })}
                >
                  <InboxOutlined />
                  <p className="ant-upload-text">縮圖</p>
                </Upload.Dragger>
              </div>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeNewMediaItem(i)}
                style={{ marginTop: 20 }}
              />
            </div>
          ))}

          <Button
            icon={<PlusOutlined />}
            onClick={addNewMediaItem}
            style={{ marginTop: 8, marginBottom: 16 }}
          >
            新增媒體
          </Button>
        </Col>
        <Col xs={24} lg={12}>
          {/* ── PDF ── */}
          <Text strong>PDF 檔案</Text>
          {existing.pdf &&
            (deleteIds.includes(existing.pdf.id) ? (
              <div style={{ margin: "8px 0" }}>
                <Text type="danger">將被刪除</Text>
                <Button
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={() => removeDeleteMark(existing.pdf!.id)}
                >
                  復原
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
                <a href={existing.pdf.url} target="_blank" rel="noreferrer">
                  {existing.pdf.uuid}
                </a>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => markDelete(existing.pdf!.id)}
                >
                  移除
                </Button>
              </div>
            ))}
          <Upload.Dragger
            accept=".pdf"
            maxCount={1}
            beforeUpload={() => false}
            fileList={pdfFile ? [pdfFile] : []}
            onChange={({ fileList }) => setPdfFile(fileList[0] ?? null)}
            style={{ marginTop: 8, marginBottom: 16 }}
          >
            <InboxOutlined />
            <p className="ant-upload-text">點擊或拖曳上傳 PDF</p>
          </Upload.Dragger>
        </Col>
      </Row>

      <Button type="primary" loading={loading} onClick={handleSubmit}>
        儲存檔案
      </Button>
    </Card>
  );
}

interface ExistingFileRowProps {
  file: PromptFile | null;
  isDeleted: boolean;
  onDelete: () => void;
  onRestore: () => void;
  showImage?: boolean;
}

function ExistingFileRow({
  file,
  isDeleted,
  onDelete,
  onRestore,
  showImage = true,
}: ExistingFileRowProps) {
  if (!file) return null;

  if (isDeleted) {
    return (
      <div style={{ margin: "8px 0" }}>
        <Text type="danger">將被刪除</Text>
        <Button size="small" style={{ marginLeft: 8 }} onClick={onRestore}>
          復原
        </Button>
      </div>
    );
  }
  console.log("file", file);
  const isVideo = file.file_type?.startsWith("VIDEO");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
      {showImage ? (
        isVideo ? (
          file.thumbnail_url ? (
            <img
              src={file.thumbnail_url}
              alt={file.uuid}
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
            />
          ) : (
            <video
              src={file.url}
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
            />
          )
        ) : (
          <img
            src={file.thumbnail_url ?? file.url}
            alt={file.uuid}
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
          />
        )
      ) : (
        <a href={file.url} target="_blank" rel="noreferrer">
          {file.uuid}
        </a>
      )}
      <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>
        移除
      </Button>
    </div>
  );
}
