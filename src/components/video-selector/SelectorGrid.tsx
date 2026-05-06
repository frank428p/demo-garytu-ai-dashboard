"use client";

import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortableOperation } from "@dnd-kit/react/sortable";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type SelectorType = "style" | "movement" | "motion";

interface SelectorItem {
  id: string;
  code: string;
  nameZhTW: string;
  nameEn: string;
  prompt: string;
  exampleVideoFile?: File;
  exampleVideoUrl?: string;
  exampleVideoCoverFile?: File;
  exampleVideoCoverUrl?: string;
}

interface SelectorGridProps {
  type: SelectorType;
  initialData?: SelectorItem[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: Record<SelectorType, SelectorItem[]> = {
  style: [
    { id: "s1", code: "STYLE_001", nameZhTW: "電影感", nameEn: "Cinematic", prompt: "cinematic style" },
    { id: "s2", code: "STYLE_002", nameZhTW: "動畫", nameEn: "Animated", prompt: "animated style" },
    { id: "s3", code: "STYLE_003", nameZhTW: "紀錄片", nameEn: "Documentary", prompt: "documentary style" },
  ],
  movement: [
    { id: "m1", code: "MOVEMENT_001", nameZhTW: "平移", nameEn: "Pan", prompt: "camera pan" },
    { id: "m2", code: "MOVEMENT_002", nameZhTW: "推拉", nameEn: "Dolly", prompt: "dolly shot" },
    { id: "m3", code: "MOVEMENT_003", nameZhTW: "跟拍", nameEn: "Tracking", prompt: "tracking shot" },
  ],
  motion: [
    { id: "mo1", code: "MOTION_001", nameZhTW: "慢動作", nameEn: "Slow Motion", prompt: "slow motion" },
    { id: "mo2", code: "MOTION_002", nameZhTW: "快動作", nameEn: "Fast Motion", prompt: "fast motion" },
    { id: "mo3", code: "MOTION_003", nameZhTW: "定格", nameEn: "Freeze Frame", prompt: "freeze frame" },
  ],
};

// ─── SelectorGrid ─────────────────────────────────────────────────────────────

export default function SelectorGrid({ type, initialData }: SelectorGridProps) {
  const [items, setItems] = useState<SelectorItem[]>(initialData ?? MOCK_DATA[type]);
  const [editingItem, setEditingItem] = useState<SelectorItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SelectorItem | null>(null);

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

  function handleModalSave(values: Omit<SelectorItem, "id">) {
    if (editingItem) {
      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, ...values } : it))
      );
    } else {
      setItems((prev) => [...prev, { ...values, id: `new_${Date.now()}` }]);
    }
    setModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!deletingItem) return;
    setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
    setDeletingItem(null);
  }

  return (
    <div>
      <div className="mb-4">
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
          setItems((prev) => {
            const next = [...prev];
            next.splice(to < 0 ? next.length + to : to, 0, next.splice(from, 1)[0]);
            return next;
          });
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
        onCancel={() => setDeletingItem(null)}
        okText="確認刪除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        確定要刪除「{deletingItem?.code}」嗎？
      </Modal>
    </div>
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
    </div>
  );
}

// ─── ItemModal ────────────────────────────────────────────────────────────────

interface ItemModalProps {
  open: boolean;
  type: SelectorType;
  editing: SelectorItem | null;
  onClose: () => void;
  onSave: (values: Omit<SelectorItem, "id">) => void;
}

function ItemModal({ open, type, editing, onClose, onSave }: ItemModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        code: editing.code,
        nameZhTW: editing.nameZhTW,
        nameEn: editing.nameEn,
        prompt: editing.prompt,
      });
      setVideoFile(editing.exampleVideoFile ?? null);
      setVideoPreview(
        editing.exampleVideoFile
          ? URL.createObjectURL(editing.exampleVideoFile)
          : (editing.exampleVideoUrl ?? null)
      );
      setCoverFile(editing.exampleVideoCoverFile ?? null);
      setCoverPreview(
        editing.exampleVideoCoverFile
          ? URL.createObjectURL(editing.exampleVideoCoverFile)
          : (editing.exampleVideoCoverUrl ?? null)
      );
    } else {
      form.resetFields();
      setVideoFile(null);
      setVideoPreview(null);
      setCoverFile(null);
      setCoverPreview(null);
    }
  }, [open, editing, form]);

  async function handleOk() {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        exampleVideoFile: videoFile ?? undefined,
        exampleVideoUrl: !videoFile ? (editing?.exampleVideoUrl ?? undefined) : undefined,
        exampleVideoCoverFile: coverFile ?? undefined,
        exampleVideoCoverUrl: !coverFile ? (editing?.exampleVideoCoverUrl ?? undefined) : undefined,
      });
    } catch {
      message.error("請填寫必填欄位");
    }
  }

  return (
    <Modal
      title={editing ? "編輯" : "新增"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
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
          <Input placeholder="例：STYLE_001" />
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

        <Form.Item label="Example Video">
          <Upload
            accept="video/*"
            showUploadList={false}
            beforeUpload={(file) => {
              setVideoFile(file);
              setVideoPreview(URL.createObjectURL(file));
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>選擇影片</Button>
          </Upload>
          {videoPreview && (
            <div className="mt-2">
              <video
                src={videoPreview}
                controls
                className="w-full max-h-[160px] rounded object-contain bg-black"
              />
              <Button
                size="small"
                danger
                className="mt-1"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
              >
                移除
              </Button>
            </div>
          )}
        </Form.Item>

        {type === "style" && (
          <Form.Item label="Example Video Cover">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                setCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>選擇封面圖</Button>
            </Upload>
            {coverPreview && (
              <div className="mt-2">
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="w-full max-h-[160px] rounded object-contain border"
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
        )}
      </Form>
    </Modal>
  );
}
