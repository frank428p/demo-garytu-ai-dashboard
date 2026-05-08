"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable, isSortableOperation } from "@dnd-kit/react/sortable";
import { App, Button, Card, Input, Modal, Spin, Typography, Avatar } from "antd";
import { PlusOutlined, HolderOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import { getFeaturedPrompts, getPrompt, updateFeaturedPrompts } from "@/@core/apis/prompt";
import type { Prompt } from "@/@core/types/prompt";

const { Title, Text } = Typography;

// ─── Sortable Row ─────────────────────────────────────────────────────────────

interface SortableRowProps {
  prompt: Prompt;
  index: number;
  onRemove: (id: string) => void;
  onNavigate: (id: string) => void;
}

function SortableRow({ prompt, index, onRemove, onNavigate }: SortableRowProps) {
  const { ref, isDragSource } = useSortable({ id: prompt.id, index });

  return (
    <div
      ref={ref}
      style={{ opacity: isDragSource ? 0.4 : 1 }}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg"
    >
      <HolderOutlined className="text-gray-400 cursor-grab text-lg" />
      <Text className="w-6 text-gray-400 text-sm">{index + 1}</Text>
      <Avatar shape="square" size={48} src={prompt.cover?.thumbnail_url} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <Text strong className="block truncate">
          {prompt.translations.find((t) => t.locale === "zh-TW")?.name ?? "-"}
        </Text>
        <Text type="secondary" className="text-xs">
          {prompt.translations.find((t) => t.locale === "en")?.name ?? "-"}
        </Text>
      </div>
      <Text type="secondary" className="text-xs shrink-0">ID: {prompt.id}</Text>
      <Button size="small" icon={<LinkOutlined />} onClick={() => onNavigate(prompt.id)} />
      <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onRemove(prompt.id)} />
    </div>
  );
}

// ─── Add Prompt Modal ─────────────────────────────────────────────────────────

interface AddPromptModalProps {
  open: boolean;
  existingIds: Set<string>;
  onClose: () => void;
  onAdd: (prompt: Prompt) => void;
}

function AddPromptModal({ open, existingIds, onClose, onAdd }: AddPromptModalProps) {
  const { message } = App.useApp();
  const [promptId, setPromptId] = useState("");
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setPromptId("");
    onClose();
  }

  async function handleConfirm() {
    const trimmed = promptId.trim();
    if (!trimmed) {
      message.warning("請輸入 Prompt ID");
      return;
    }
    if (existingIds.has(trimmed)) {
      message.warning("此 Prompt 已在列表中");
      return;
    }
    setLoading(true);
    try {
      const res = await getPrompt(trimmed);
      if (!res.data) {
        message.error("找不到此 Prompt");
        return;
      }
      onAdd(res.data);
      setPromptId("");
    } catch {
      message.error("查詢 Prompt 失敗，請確認 ID 是否正確");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="新增 Prompt"
      open={open}
      onCancel={handleClose}
      onOk={handleConfirm}
      okText="確認"
      cancelText="取消"
      confirmLoading={loading}
      destroyOnHidden
    >
      <div className="py-2">
        <Text className="block mb-2">請輸入 Prompt ID</Text>
        <Input
          placeholder="Prompt ID"
          value={promptId}
          onChange={(e) => setPromptId(e.target.value)}
          onPressEnter={handleConfirm}
          disabled={loading}
          autoFocus
        />
      </div>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PromptCollectionsContent() {
  const { message } = App.useApp();
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getFeaturedPrompts({ page: 1, page_size: 100 })
      .then((res) => setPrompts(res.data ?? []))
      .catch(() => message.error("載入 Featured Prompts 失敗"))
      .finally(() => setInitializing(false));
  }, []);

  function handleRemove(id: string) {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleAdd(prompt: Prompt) {
    setPrompts((prev) => [...prev, prompt]);
    setModalOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const items = prompts.map((p, i) => ({ id: Number(p.id), rank: i }));
      const res = await updateFeaturedPrompts({ items });
      if (res.code !== 0) {
        message.error(res.message);
        return;
      }
      message.success("儲存成功");
    } catch {
      message.error("儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  const existingIds = new Set(prompts.map((p) => p.id));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Title level={4} className="!mb-0">
          Prompt Collections
        </Title>
        <div className="flex gap-2">
          <Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新增
          </Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            儲存
          </Button>
        </div>
      </div>

      <Card>
        {initializing ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-16">
            <Text type="secondary">尚無 Featured Prompts，點擊「新增」加入</Text>
          </div>
        ) : (
          <DragDropProvider
            onDragEnd={({ operation, canceled }) => {
              if (canceled) return;
              if (!isSortableOperation(operation)) return;
              const { source, target } = operation;
              if (!source || !target) return;
              const from = source.sortable.initialIndex;
              const to = target.sortable.index;
              if (from === to) return;
              setPrompts((prev) => {
                const next = [...prev];
                next.splice(to < 0 ? next.length + to : to, 0, next.splice(from, 1)[0]);
                return next;
              });
            }}
          >
            <div className="flex flex-col gap-2">
              {prompts.map((prompt, index) => (
                <SortableRow
                  key={prompt.id}
                  prompt={prompt}
                  index={index}
                  onRemove={handleRemove}
                  onNavigate={(id) => router.push(`/prompt/list/${id}`)}
                />
              ))}
            </div>
          </DragDropProvider>
        )}
      </Card>

      <AddPromptModal
        open={modalOpen}
        existingIds={existingIds}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}

export default function PromptCollectionsPage() {
  return (<PromptCollectionsContent />);
}
