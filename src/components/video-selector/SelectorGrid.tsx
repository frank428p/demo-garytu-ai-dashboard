"use client";

import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortableOperation } from "@dnd-kit/react/sortable";
import { App, Button, Card, Form, Input, Modal, Switch, Upload } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  getVideoSelectors,
  createVideoSelector,
  updateVideoSelector,
  deleteVideoSelector,
  updateVideoSelectorPositions,
} from "@/@core/apis/videoSelector";
import type { VideoSelectorType } from "@/@core/types/videoSelector";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectorType = "style" | "movement" | "motion";

const TYPE_MAP: Record<SelectorType, VideoSelectorType> = {
  style: "STYLE",
  movement: "MOVEMENT",
  motion: "MOTION",
};

interface SelectorItem {
  id: string;
  code: string;
  nameZhTW: string;
  nameEn: string;
  prompt: string;
  enabled: boolean;
  coverUrl?: string | null;
  thumbnailUrl?: string | null;
}

interface SelectorGridProps {
  type: SelectorType;
}

// ─── SelectorGrid ─────────────────────────────────────────────────────────────

export default function SelectorGrid({ type }: SelectorGridProps) {
  const { message } = App.useApp();
  const [items, setItems] = useState<SelectorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<SelectorItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SelectorItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await getVideoSelectors({ selector_type: TYPE_MAP[type], page_size: 100 });
      setItems(
        res.data.map((r) => ({
          id: r.id,
          code: r.code,
          nameZhTW: r.translations.find((t) => t.locale === "zh-TW")?.name ?? "",
          nameEn: r.translations.find((t) => t.locale === "en")?.name ?? "",
          prompt: r.prompt,
          enabled: r.enabled,
          coverUrl: r.cover?.url ?? null,
          thumbnailUrl: r.cover?.thumbnail_url ?? null,
        }))
      );
    } catch {
      message.error("載入失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function openAdd() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEdit(item: SelectorItem) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function openDelete(item: SelectorItem) {
    setDeletingItem(item);
  }

  async function handleModalSave(
    values: Omit<SelectorItem, "id" | "coverUrl" | "thumbnailUrl">,
    files: { cover?: File; thumbnail?: File }
  ) {
    if (editingItem) {
      await updateVideoSelector(
        Number(editingItem.id),
        {
          prompt: values.prompt,
          translations: [
            { locale: "zh-TW", name: values.nameZhTW },
            { locale: "en", name: values.nameEn },
          ],
          enabled: values.enabled,
        },
        files
      );
    } else {
      await createVideoSelector(
        {
          selector_type: TYPE_MAP[type],
          code: values.code,
          prompt: values.prompt,
          translations: [
            { locale: "zh-TW", name: values.nameZhTW },
            { locale: "en", name: values.nameEn },
          ],
          enabled: values.enabled,
        },
        files
      );
    }
    setModalOpen(false);
    fetchItems();
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await deleteVideoSelector(Number(deletingItem.id));
      setDeletingItem(null);
      fetchItems();
    } catch {
      message.error("刪除失敗");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleDragEnd(newItems: SelectorItem[]) {
    setItems(newItems);
    try {
      await updateVideoSelectorPositions({
        items: newItems.map((item, index) => ({ id: Number(item.id), position: index })),
      });
    } catch {
      message.error("排序更新失敗");
      fetchItems();
    }
  }

  return (
    <Card loading={loading}>
      <div className="flex justify-end mb-4">
        <Button icon={<PlusOutlined />} type="primary" onClick={openAdd}>
          新增
        </Button>
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
          const next = [...items];
          next.splice(to < 0 ? next.length + to : to, 0, next.splice(from, 1)[0]);
          handleDragEnd(next);
        }}
      >
        <div className="grid grid-cols-5 gap-4">
          {items.map((item, index) => (
            <SortableGridItem
              key={item.id}
              item={item}
              index={index}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      </DragDropProvider>

      <ItemModal
        open={modalOpen}
        type={type}
        editing={editingItem}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />

      <Modal
        title="確認刪除"
        open={!!deletingItem}
        onOk={handleConfirmDelete}
        confirmLoading={deleteLoading}
        onCancel={() => setDeletingItem(null)}
        okText="確認刪除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        確定要刪除「{deletingItem?.code}」嗎？
      </Modal>
    </Card>
  );
}

// ─── SortableGridItem ─────────────────────────────────────────────────────────

interface SortableGridItemProps {
  item: SelectorItem;
  index: number;
  onEdit: (item: SelectorItem) => void;
  onDelete: (item: SelectorItem) => void;
}

function SortableGridItem({ item, index, onEdit, onDelete }: SortableGridItemProps) {
  const { ref, isDragSource } = useSortable({ id: item.id, index });

  return (
    <div
      ref={ref}
      style={{ opacity: isDragSource ? 0.4 : 1, cursor: "grab" }}
      className="relative border border-gray-200 rounded-lg p-3 bg-white select-none min-h-[80px]"
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          size="small"
          icon={<EditOutlined />}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(item)}
        />
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(item)}
        />
      </div>
      <div className="font-mono text-sm font-bold pr-14">{item.code}</div>
      <div className="text-xs text-gray-600 mt-1">{item.nameZhTW}</div>
      <div className={`text-xs mt-1 ${item.enabled ? "text-green-500" : "text-gray-400"}`}>
        {item.enabled ? "啟用" : "停用"}
      </div>
    </div>
  );
}

// ─── ItemModal ────────────────────────────────────────────────────────────────

interface ItemModalProps {
  open: boolean;
  type: SelectorType;
  editing: SelectorItem | null;
  onClose: () => void;
  onSave: (
    values: Omit<SelectorItem, "id" | "coverUrl" | "thumbnailUrl">,
    files: { cover?: File; thumbnail?: File }
  ) => Promise<void>;
}

function ItemModal({ open, type, editing, onClose, onSave }: ItemModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        code: editing.code,
        nameZhTW: editing.nameZhTW,
        nameEn: editing.nameEn,
        prompt: editing.prompt,
        enabled: editing.enabled,
      });
      setCoverFile(null);
      setCoverPreview(editing.coverUrl ?? null);
      setThumbnailFile(null);
      setThumbnailPreview(editing.thumbnailUrl ?? null);
    } else {
      form.resetFields();
      form.setFieldValue("enabled", true);
      setCoverFile(null);
      setCoverPreview(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }
  }, [open, editing, form]);

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await onSave(
        {
          code: values.code,
          nameZhTW: values.nameZhTW ?? "",
          nameEn: values.nameEn ?? "",
          prompt: values.prompt ?? "",
          enabled: values.enabled ?? true,
        },
        {
          cover: coverFile ?? undefined,
          thumbnail: thumbnailFile ?? undefined,
        }
      );
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      message.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={editing ? "編輯" : "新增"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText="儲存"
      cancelText="取消"
      destroyOnHidden
      width={560}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="代碼（CODE）"
          name="code"
          rules={[{ required: true, message: "請輸入代碼" }]}
        >
          <Input placeholder="例：STYLE_001" disabled={!!editing} />
        </Form.Item>

        <Form.Item label="名稱（zh-TW）" name="nameZhTW">
          <Input placeholder="中文名稱" />
        </Form.Item>

        <Form.Item label="名稱（en）" name="nameEn">
          <Input placeholder="English name" />
        </Form.Item>

        <Form.Item label="Prompt" name="prompt">
          <Input.TextArea rows={3} placeholder="輸入 prompt" />
        </Form.Item>

        <Form.Item label="啟用" name="enabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Cover">
          <Upload
            accept="video/*"
            showUploadList={false}
            beforeUpload={(file) => {
              setCoverFile(file);
              setCoverPreview(URL.createObjectURL(file));
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>選擇影片</Button>
          </Upload>
          {coverPreview && (
            <div className="mt-2">
              <video
                src={coverPreview}
                controls
                className="w-full max-h-[160px] rounded object-contain bg-black"
              />
              <Button
                size="small"
                danger
                className="mt-1"
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
              >
                移除
              </Button>
            </div>
          )}
        </Form.Item>

        {type === "style" && (
          <Form.Item label="Thumbnail（STYLE 專用）">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                setThumbnailFile(file);
                setThumbnailPreview(URL.createObjectURL(file));
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>選擇 Thumbnail</Button>
            </Upload>
            {thumbnailPreview && (
              <div className="mt-2">
                <img
                  src={thumbnailPreview}
                  alt="thumbnail preview"
                  className="w-full max-h-[160px] rounded object-contain border"
                />
                <Button
                  size="small"
                  danger
                  className="mt-1"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                  }}
                >
                  移除
                </Button>
              </div>
            )}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
