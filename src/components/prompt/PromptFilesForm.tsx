"use client";

import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortableOperation } from "@dnd-kit/react/sortable";
import { App, Button, Card, Divider, Spin, Upload, Typography, Row, Col } from "antd";
import { InboxOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { getPrompt, updatePromptFiles } from "@/@core/apis/prompt";
import type { PromptFile } from "@/@core/types/prompt";

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileItem {
  key: string;
  existingId?: string;
  existingUrl?: string;
  existingThumbnailUrl?: string | null;
  existingFileType?: string;
  mainFile?: UploadFile;
  thumbnailFile?: UploadFile;
}

function fromPromptFile(f: PromptFile): FileItem {
  return {
    key: f.id,
    existingId: f.id,
    existingUrl: f.url,
    existingThumbnailUrl: f.thumbnail_url,
    existingFileType: f.file_type,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  id: string;
}

export default function PromptFilesForm({ id }: Props) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const [coverItem, setCoverItem] = useState<FileItem | null>(null);
  const [mediaItems, setMediaItems] = useState<FileItem[]>([]);
  const [pdfFile, setPdfFile] = useState<UploadFile | null>(null);
  const [existingPdf, setExistingPdf] = useState<PromptFile | null>(null);
  const [pdfDeleted, setPdfDeleted] = useState(false);
  const [zipFile, setZipFile] = useState<UploadFile | null>(null);
  const [existingZip, setExistingZip] = useState<PromptFile | null>(null);
  const [zipDeleted, setZipDeleted] = useState(false);

  useEffect(() => {
    getPrompt(id)
      .then((res) => {
        const p = res.data;
        setCoverItem(p.cover ? fromPromptFile(p.cover) : null);
        setMediaItems((p.files ?? []).map(fromPromptFile));
        setExistingPdf(p.pdf ?? null);
        setExistingZip(p.zip ?? null);
      })
      .catch(() => message.error("載入檔案資料失敗"))
      .finally(() => setInitializing(false));
  }, [id]);

  function deleteCover() {
    if (coverItem?.existingId) setDeleteIds((prev) => [...prev, coverItem.existingId!]);
    setCoverItem(null);
  }

  function deleteMedia(key: string, existingId?: string) {
    if (existingId) setDeleteIds((prev) => [...prev, existingId]);
    setMediaItems((prev) => prev.filter((item) => item.key !== key));
  }

  function addNewMedia() {
    if (mediaItems.length >= 10) {
      message.warning("媒體檔案最多 10 個");
      return;
    }
    setMediaItems((prev) => [...prev, { key: `new_${Date.now()}` }]);
  }

  function updateMediaItem(key: string, patch: Partial<FileItem>) {
    setMediaItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
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

      // Cover
      if (coverItem?.mainFile?.originFileObj) {
        files["cover"] = coverItem.mainFile.originFileObj;
        payload.cover = { file_key: "cover" };
        if (coverItem.thumbnailFile?.originFileObj) {
          files["cover_thumbnail"] = coverItem.thumbnailFile.originFileObj;
          payload.cover.thumbnail_file_key = "cover_thumbnail";
        }
      }

      // PDF
      if (!pdfDeleted && pdfFile?.originFileObj) {
        const pdfKey = fileKey(pdfFile.originFileObj);
        files[pdfKey] = pdfFile.originFileObj;
        payload.pdf = { file_key: pdfKey };
      }

      // ZIP
      if (!zipDeleted && zipFile?.originFileObj) {
        const zipKey = fileKey(zipFile.originFileObj);
        files[zipKey] = zipFile.originFileObj;
        payload.zip = { file_key: zipKey };
      }

      // Media
      const mediaPayload = mediaItems
        .map((item, i) => {
          if (item.existingId && !item.mainFile?.originFileObj) {
            return { id: item.existingId, position: i };
          }
          if (item.mainFile?.originFileObj) {
            const mainKey = fileKey(item.mainFile.originFileObj);
            files[mainKey] = item.mainFile.originFileObj;
            const entry: { file_key: string; thumbnail_file_key?: string; position: number } = {
              file_key: mainKey,
              position: i,
            };
            if (item.thumbnailFile?.originFileObj) {
              const thumbKey = fileKey(item.thumbnailFile.originFileObj);
              files[thumbKey] = item.thumbnailFile.originFileObj;
              entry.thumbnail_file_key = thumbKey;
            }
            return entry;
          }
          return null;
        })
        .filter(Boolean);

      if (mediaPayload.length > 0) {
        payload.media = mediaPayload as typeof payload.media;
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
      setCoverItem(p.cover ? fromPromptFile(p.cover) : null);
      setMediaItems((p.files ?? []).map(fromPromptFile));
      setExistingPdf(p.pdf ?? null);
      setExistingZip(p.zip ?? null);
      setDeleteIds([]);
      setPdfFile(null);
      setPdfDeleted(false);
      setZipFile(null);
      setZipDeleted(false);
    } catch {
      message.error("檔案更新失敗");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="flex justify-center p-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card title="檔案管理" className="mt-4">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          {/* ── Cover ── */}
          <div className="pb-2">
            <Text strong>封面媒體 (aspect ratio: 16:9)</Text>
          </div>

          <div className="mt-2 mb-6">
            {coverItem ? (
              <FileCard
                item={coverItem}
                onDelete={deleteCover}
                onChange={(patch) => setCoverItem((prev) => (prev ? { ...prev, ...patch } : prev))}
              />
            ) : (
              <FileCard
                item={{ key: "cover_new" }}
                onDelete={() => setCoverItem(null)}
                onChange={(patch) =>
                  setCoverItem((prev) => ({ key: "cover_new", ...prev, ...patch }))
                }
              />
            )}
          </div>

          {/* ── Media ── */}
          <div className="pb-2">
            <Text strong>媒體檔案 (aspect ratio: 1:1)</Text>
          </div>

          <DragDropProvider
            onDragEnd={({ operation, canceled }) => {
              if (canceled) return;
              if (!isSortableOperation(operation)) return;
              const { source, target } = operation;
              if (!source || !target) return;
              const from = source.sortable.initialIndex;
              const to = target.sortable.index;
              if (from === to) return;
              setMediaItems((prev) => {
                const next = [...prev];
                next.splice(to < 0 ? next.length + to : to, 0, next.splice(from, 1)[0]);
                return next;
              });
            }}
          >
            <div className="mt-2 flex flex-col gap-3">
              {mediaItems.map((item, index) => (
                <SortableFileCard
                  key={item.key}
                  item={item}
                  index={index}
                  onDelete={() => deleteMedia(item.key, item.existingId)}
                  onChange={(patch) => updateMediaItem(item.key, patch)}
                />
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={addNewMedia}
                disabled={mediaItems.length >= 10}
                className="self-start"
              >
                新增媒體
              </Button>
            </div>
          </DragDropProvider>
        </Col>

        <Col xs={24} lg={12}>
          {/* ── PDF ── */}
          <div className="pb-4">
            <div className="pb-2">
              <Text strong>PDF 檔案</Text>
            </div>
            {existingPdf && !pdfDeleted && (
              <div className="flex items-center gap-2 my-2">
                <a href={existingPdf.url} target="_blank" rel="noreferrer">
                  {existingPdf.uuid}
                </a>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setDeleteIds((prev) => [...prev, existingPdf.id]);
                    setPdfDeleted(true);
                  }}
                >
                  移除
                </Button>
              </div>
            )}
            <Upload
              accept=".pdf"
              maxCount={1}
              beforeUpload={() => false}
              fileList={pdfFile ? [pdfFile] : []}
              onChange={({ fileList }) => setPdfFile(fileList[0] ?? null)}
              className="mt-2 mb-4"
            >
              <Button icon={<PlusOutlined />}>選擇 PDF 檔案</Button>
            </Upload>
          </div>

          {/* ── ZIP ── */}
          <div className="pb-2">
            <Text strong>ZIP 檔案</Text>
          </div>
          {existingZip && !zipDeleted && (
            <div className="flex items-center gap-2 my-2">
              <a href={existingZip.url} target="_blank" rel="noreferrer">
                {existingZip.uuid}
              </a>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDeleteIds((prev) => [...prev, existingZip.id]);
                  setZipDeleted(true);
                }}
              >
                移除
              </Button>
            </div>
          )}
          <Upload
            accept=".zip"
            maxCount={1}
            beforeUpload={() => false}
            fileList={zipFile ? [zipFile] : []}
            onChange={({ fileList }) => setZipFile(fileList[0] ?? null)}
            className="mt-2 mb-4"
          >
            <Button icon={<PlusOutlined />}>選擇 ZIP 檔案</Button>
          </Upload>
        </Col>
      </Row>

      <Divider />
      <Button type="primary" loading={loading} onClick={handleSubmit}>
        儲存檔案
      </Button>
    </Card>
  );
}

// ─── FilePreview Component ───────────────────────────────────────────────────

function FilePreview({ file }: { file: File }) {
  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video");

  return isVideo ? (
    <video src={url} className="w-full h-auto max-h-[150px] object-contain rounded" controls />
  ) : (
    <img src={url} alt={file.name} className="w-full h-auto max-h-[120px] object-contain rounded" />
  );
}

// ─── SortableFileCard Component ──────────────────────────────────────────────

interface SortableFileCardProps extends FileCardProps {
  index: number;
}

function SortableFileCard({ item, index, onDelete, onChange }: SortableFileCardProps) {
  const { ref, isDragSource } = useSortable({ id: item.key, index });

  return (
    <div ref={ref} style={{ opacity: isDragSource ? 0.4 : 1, cursor: "grab" }}>
      <FileCard item={item} onDelete={onDelete} onChange={onChange} />
    </div>
  );
}

// ─── FileCard Component ───────────────────────────────────────────────────────

interface FileCardProps {
  item: FileItem;
  onDelete: () => void;
  onChange: (patch: Partial<FileItem>) => void;
}

function FileCard({ item, onDelete, onChange }: FileCardProps) {
  const isVideo = item.existingFileType?.toUpperCase().startsWith("VIDEO");

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-3">
      <div className="flex justify-end mb-2">
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>
          刪除
        </Button>
      </div>
      <div className="flex gap-3">
        {/* 原圖 */}
        <div className="flex-1 min-w-0 h-full">
          <Text type="secondary" style={{ fontSize: 12 }}>
            原圖
          </Text>
          {item.existingUrl && !item.mainFile ? (
            <div className="mt-1">
              {isVideo ? (
                <video
                  src={item.existingUrl}
                  className="w-full h-auto max-h-[150px] object-contain rounded"
                  controls
                />
              ) : (
                <img
                  src={item.existingUrl}
                  alt="原圖"
                  className="w-full h-auto max-h-[120px] object-contain rounded"
                />
              )}
            </div>
          ) : (
            <Upload.Dragger
              accept="image/*,video/*"
              maxCount={1}
              beforeUpload={() => false}
              showUploadList={false}
              fileList={item.mainFile?.uid ? [item.mainFile] : []}
              onChange={({ fileList }) => onChange({ mainFile: fileList[0] ?? undefined })}
              style={{ height: "auto" }}
            >
              {item.mainFile?.originFileObj ? (
                <FilePreview file={item.mainFile.originFileObj} />
              ) : (
                <>
                  <InboxOutlined />
                  <p className="ant-upload-text">圖片 / 影片</p>
                </>
              )}
            </Upload.Dragger>
          )}
        </div>

        {/* 縮圖 */}
        <div className="flex-1 min-w-0 h-full">
          <Text type="secondary" style={{ fontSize: 12 }}>
            縮圖
          </Text>
          {item.existingThumbnailUrl && !item.thumbnailFile ? (
            <div className="mt-1">
              <img
                src={item.existingThumbnailUrl}
                alt="縮圖"
                className="w-full h-auto max-h-[120px] object-contain rounded"
              />
            </div>
          ) : (
            <Upload.Dragger
              accept="image/*"
              maxCount={1}
              beforeUpload={() => false}
              showUploadList={false}
              fileList={item.thumbnailFile?.uid ? [item.thumbnailFile] : []}
              onChange={({ fileList }) => onChange({ thumbnailFile: fileList[0] ?? undefined })}
              style={{ height: "auto" }}
            >
              {item.thumbnailFile?.originFileObj ? (
                <FilePreview file={item.thumbnailFile.originFileObj} />
              ) : (
                <>
                  <InboxOutlined />
                  <p className="ant-upload-text">縮圖（圖片）</p>
                </>
              )}
            </Upload.Dragger>
          )}
        </div>
      </div>
    </div>
  );
}
