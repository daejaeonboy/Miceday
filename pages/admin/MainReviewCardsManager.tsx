import React, { useEffect, useRef, useState } from "react";
import {
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  addMainReviewCard,
  deleteMainReviewCard,
  getAllMainReviewCards,
  MainReviewCard,
  updateMainReviewCard,
} from "../../src/api/cmsApi";
import { uploadImage } from "../../src/api/storageApi";

const getUploadErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") return "알 수 없는 오류";
  const anyError = error as any;
  return anyError.message || anyError.error_description || anyError.details || "알 수 없는 오류";
};

export const MainReviewCardsManager: React.FC = () => {
  const [items, setItems] = useState<MainReviewCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MainReviewCard | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<MainReviewCard>>({
    title: "",
    subtitle: "",
    review_text: "",
    image_url: "",
    display_order: 1,
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllMainReviewCards();
      setItems(data);
    } catch (error) {
      console.error("Failed to load main review cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      subtitle: "",
      review_text: "",
      image_url: "",
      display_order: items.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: MainReviewCard) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = "";
      try {
        imageUrl = await uploadImage(file, "main-reviews");
      } catch (folderError) {
        console.warn("Upload to main-reviews failed, retrying with default folder:", folderError);
        imageUrl = await uploadImage(file);
      }
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error("Failed to upload review image:", error);
      alert(`이미지 업로드에 실패했습니다.\n사유: ${getUploadErrorMessage(error)}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.review_text || !formData.image_url) {
      alert("배지 텍스트, 리뷰 본문, 이미지는 필수입니다.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || "",
        review_text: formData.review_text,
        image_url: formData.image_url,
        display_order: Number(formData.display_order || 0),
        is_active: Boolean(formData.is_active),
      };

      if (editingItem?.id) {
        await updateMainReviewCard(editingItem.id, payload);
      } else {
        await addMainReviewCard(payload);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error("Failed to save main review card:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("해당 메인 리뷰 카드를 삭제하시겠습니까?")) return;
    try {
      await deleteMainReviewCard(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete main review card:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleToggleActive = async (item: MainReviewCard) => {
    try {
      await updateMainReviewCard(item.id!, { is_active: !item.is_active });
      await loadData();
    } catch (error) {
      console.error("Failed to toggle main review card:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#001e45]" size={36} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">메인 리뷰 카드 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            메인페이지 리뷰 슬라이드 전용 카드(이미지/텍스트)를 관리합니다.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white hover:bg-[#152b66]"
        >
          <Plus size={18} />
          카드 추가
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            등록된 메인 리뷰 카드가 없습니다. 카드를 추가해 주세요.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
                <GripVertical size={18} className="text-slate-300" />
                <img src={item.image_url} alt={item.title} className="h-14 w-24 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-800">{item.title}</p>
                    {!item.is_active && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">비활성</span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-500">{item.subtitle || item.review_text}</p>
                </div>
                <span className="text-xs text-slate-400">순서: {item.display_order}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`rounded-lg p-2 ${
                      item.is_active ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100"
                    }`}
                    title={item.is_active ? "비활성화" : "활성화"}
                  >
                    {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    title="수정"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editingItem ? "메인 리뷰 카드 수정" : "메인 리뷰 카드 추가"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">배지 텍스트</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                  placeholder="예: 스타트업"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  이미지 위 제목 (줄바꿈 가능)
                </label>
                <textarea
                  value={formData.subtitle || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="h-20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                  placeholder={"첫 줄 문구\n둘째 줄 문구"}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">리뷰 본문</label>
                <textarea
                  value={formData.review_text || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, review_text: e.target.value }))}
                  className="h-36 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                  placeholder="카드 우측 본문 텍스트"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">이미지</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {formData.image_url ? (
                  <div className="relative overflow-hidden rounded-lg border">
                    <img src={formData.image_url} alt="main-review-preview" className="h-44 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-[#001e45]"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-[#001e45]" size={18} />
                    ) : (
                      <>
                        <Upload size={18} />
                        이미지 업로드
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">노출 순서</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.display_order ?? 0}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_order: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_active)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    활성 상태
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white disabled:opacity-70"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
