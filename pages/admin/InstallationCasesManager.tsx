import React, { useEffect, useRef, useState } from 'react';
import {
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import {
  addInstallationCase,
  deleteInstallationCase,
  getAllInstallationCases,
  InstallationCase,
  updateInstallationCase,
} from '../../src/api/cmsApi';
import { uploadImage } from '../../src/api/storageApi';
import {
  buildInstallationCaseContentFromBlocks,
  createInstallationCaseBlock,
  extractInstallationCaseContent,
  InstallationCaseContentBlock,
} from '../../src/utils/installationCaseContent';

type InstallationCaseFormState = Partial<InstallationCase> & {
  blocks: InstallationCaseContentBlock[];
};

const createEmptyForm = (nextOrder: number): InstallationCaseFormState => ({
  title: '',
  subtitle: '',
  image_url: '',
  link: '/cases',
  blocks: [createInstallationCaseBlock('paragraph')],
  display_order: nextOrder,
  is_active: true,
});

const ensureBlocks = (blocks: InstallationCaseContentBlock[]) =>
  blocks.length > 0 ? blocks : [createInstallationCaseBlock('paragraph')];

const getUploadErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '알 수 없는 오류';
  const anyError = error as Record<string, string>;
  return anyError.message || anyError.error_description || anyError.details || '알 수 없는 오류';
};

export const InstallationCasesManager: React.FC = () => {
  const [items, setItems] = useState<InstallationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InstallationCase | null>(null);
  const [pendingImageBlockId, setPendingImageBlockId] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const blockImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<InstallationCaseFormState>(createEmptyForm(1));

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllInstallationCases();
      setItems(data);
    } catch (error) {
      console.error('Failed to load installation cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(createEmptyForm(items.length + 1));
    setShowModal(true);
  };

  const openEditModal = (item: InstallationCase) => {
    const { blocks } = extractInstallationCaseContent(item.content);

    setEditingItem(item);
    setFormData({
      ...item,
      blocks: ensureBlocks(blocks),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setUploadingCover(false);
    setUploadingBlockId(null);
    setPendingImageBlockId(null);
  };

  const uploadCaseImage = async (file: File) => {
    try {
      return await uploadImage(file, 'installation-cases');
    } catch (folderError) {
      console.warn('Upload to installation-cases failed, retrying with default folder:', folderError);
      return uploadImage(file);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    setUploadingCover(true);
    try {
      const imageUrl = await uploadCaseImage(file);
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      alert(`대표 이미지 업로드에 실패했습니다.\n사유: ${getUploadErrorMessage(error)}`);
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const openBlockImagePicker = (blockId: string) => {
    setPendingImageBlockId(blockId);
    blockImageInputRef.current?.click();
  };

  const insertUploadedImagesIntoBlocks = (targetBlockId: string, imageUrls: string[]) => {
    if (imageUrls.length === 0) return;

    setFormData((prev) => {
      const targetIndex = prev.blocks.findIndex((block) => block.id === targetBlockId);
      if (targetIndex === -1) return prev;

      const targetBlock = prev.blocks[targetIndex];
      if (targetBlock.type !== 'image') return prev;

      const [firstImageUrl, ...remainingImageUrls] = imageUrls;
      const nextBlocks = [...prev.blocks];

      nextBlocks[targetIndex] = {
        ...targetBlock,
        imageUrl: firstImageUrl,
      };

      if (remainingImageUrls.length > 0) {
        const additionalBlocks = remainingImageUrls.map((imageUrl) => ({
          ...createInstallationCaseBlock('image'),
          imageUrl,
          caption: '',
        }));
        nextBlocks.splice(targetIndex + 1, 0, ...additionalBlocks);
      }

      return {
        ...prev,
        blocks: nextBlocks,
      };
    });
  };

  const handleBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const targetBlockId = pendingImageBlockId;

    if (files.length === 0 || !targetBlockId) {
      e.target.value = '';
      return;
    }

    const hasInvalidFile = files.some((file) => !file.type.startsWith('image/'));
    if (hasInvalidFile) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      setPendingImageBlockId(null);
      e.target.value = '';
      return;
    }

    setUploadingBlockId(targetBlockId);
    const uploadedImageUrls: string[] = [];
    let failedCount = 0;
    let firstError: unknown = null;

    try {
      for (const file of files) {
        try {
          const imageUrl = await uploadCaseImage(file);
          uploadedImageUrls.push(imageUrl);
        } catch (error) {
          console.error('Failed to upload block image:', error);
          failedCount += 1;
          if (!firstError) {
            firstError = error;
          }
        }
      }

      insertUploadedImagesIntoBlocks(targetBlockId, uploadedImageUrls);

      if (failedCount > 0) {
        const detailMessage = firstError ? `\n사유: ${getUploadErrorMessage(firstError)}` : '';
        alert(`본문 이미지 ${uploadedImageUrls.length}장 업로드 완료, ${failedCount}장 실패했습니다.${detailMessage}`);
      } else if (uploadedImageUrls.length === 0) {
        alert('본문 이미지 업로드에 실패했습니다.');
      }
    } finally {
      setUploadingBlockId(null);
      setPendingImageBlockId(null);
      e.target.value = '';
    }
  };

  const addBlock = (type: InstallationCaseContentBlock['type']) => {
    setFormData((prev) => ({
      ...prev,
      blocks: [...prev.blocks, createInstallationCaseBlock(type)],
    }));
  };

  const updateBlock = (blockId: string, updates: Partial<InstallationCaseContentBlock>) => {
    setFormData((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block)),
    }));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const index = prev.blocks.findIndex((block) => block.id === blockId);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.blocks.length) return prev;

      const nextBlocks = [...prev.blocks];
      const [targetBlock] = nextBlocks.splice(index, 1);
      nextBlocks.splice(targetIndex, 0, targetBlock);

      return {
        ...prev,
        blocks: nextBlocks,
      };
    });
  };

  const removeBlock = (blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      blocks: ensureBlocks(prev.blocks.filter((block) => block.id !== blockId)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.image_url?.trim()) {
      alert('제목과 대표 이미지를 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || '',
        image_url: formData.image_url.trim(),
        link: formData.link?.trim() || '/cases',
        content: buildInstallationCaseContentFromBlocks(formData.blocks),
        display_order: Number(formData.display_order || 0),
        is_active: Boolean(formData.is_active),
      };

      if (editingItem?.id) {
        await updateInstallationCase(editingItem.id, payload);
      } else {
        await addInstallationCase(payload);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save installation case:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('해당 설치 사례를 삭제하시겠습니까?')) return;

    try {
      await deleteInstallationCase(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete installation case:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: InstallationCase) => {
    try {
      await updateInstallationCase(item.id!, { is_active: !item.is_active });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle installation case status:', error);
      alert('상태 변경에 실패했습니다.');
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
          <h1 className="text-2xl font-bold text-slate-800">고객사례 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            대표 이미지와 블로그형 상세 블록을 자유롭게 조합해서 사례를 작성할 수 있습니다.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white hover:bg-[#152b66]"
        >
          <Plus size={18} />
          사례 추가
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">등록된 고객사례가 없습니다. 새 사례를 추가해 주세요.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const { blocks } = extractInstallationCaseContent(item.content);
              const imageBlockCount = blocks.filter((block) => block.type === 'image').length;

              return (
                <div key={item.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
                  <GripVertical size={18} className="text-slate-300" />
                  <img src={item.image_url} alt={item.title} className="h-14 w-24 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-800">{item.title}</p>
                      {!item.is_active && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">비활성</span>
                      )}
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#001e45]">
                        블록 {blocks.length}개
                      </span>
                      {imageBlockCount > 0 && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          이미지 {imageBlockCount}장
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">{item.subtitle || item.link}</p>
                  </div>
                  <span className="text-xs text-slate-400">순서: {item.display_order}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`rounded-lg p-2 ${item.is_active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                      title={item.is_active ? '비활성화' : '활성화'}
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
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-4">
              <h2 className="text-lg font-bold text-slate-800">{editingItem ? '고객사례 수정' : '고객사례 추가'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
              <input
                ref={blockImageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBlockImageUpload}
                className="hidden"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">제목</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">부제목</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                  />
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">대표 이미지</label>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {uploadingCover ? '업로드 중...' : '대표 이미지 선택'}
                    </button>
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />

                  {formData.image_url ? (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <img src={formData.image_url} alt="installation-case-cover-preview" className="aspect-[4/3] w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                        className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white"
                        aria-label="대표 이미지 삭제"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-[#001e45] disabled:opacity-60"
                    >
                      {uploadingCover ? <Loader2 className="animate-spin text-[#001e45]" size={20} /> : <Upload size={20} />}
                      <span className="text-sm font-medium">대표 이미지를 업로드해 주세요</span>
                    </button>
                  )}

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">링크</label>
                      <input
                        type="text"
                        value={formData.link || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#001e45]"
                        placeholder="/cases 또는 https://..."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
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
                  </div>
                </div>

                <div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">상세 콘텐츠 블록</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          문단, 소제목, 이미지를 원하는 순서로 추가하면 상세 페이지에 그대로 반영됩니다.
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          이미지 블록에서는 여러 장을 한 번에 선택하면 선택한 순서대로 연속 추가됩니다.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => addBlock('paragraph')}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <AlignLeft size={16} />
                          문단 추가
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock('heading')}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Type size={16} />
                          소제목 추가
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock('image')}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <ImagePlus size={16} />
                          이미지 추가
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {formData.blocks.map((block, index) => (
                        <div key={block.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {block.type === 'heading' ? '소제목' : block.type === 'image' ? '이미지' : '문단'}
                              </span>
                              <span className="text-xs text-slate-400">블록 {index + 1}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'up')}
                                disabled={index === 0}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="위로 이동"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveBlock(block.id, 'down')}
                                disabled={index === formData.blocks.length - 1}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="아래로 이동"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                aria-label="블록 삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {block.type === 'heading' && (
                            <input
                              type="text"
                              value={block.text || ''}
                              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                              placeholder="소제목을 입력해 주세요"
                            />
                          )}

                          {block.type === 'paragraph' && (
                            <textarea
                              value={block.text || ''}
                              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                              className="h-36 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-slate-700 outline-none focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                              placeholder="문단 내용을 입력해 주세요. 엔터로 줄바꿈도 가능합니다."
                            />
                          )}

                          {block.type === 'image' && (
                            <div className="space-y-3">
                              {block.imageUrl ? (
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                  <img src={block.imageUrl} alt="case-block-preview" className="aspect-[4/3] w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageUrl: '', caption: block.caption || '' })}
                                    className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white"
                                    aria-label="블록 이미지 삭제"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openBlockImagePicker(block.id)}
                                  disabled={uploadingBlockId === block.id}
                                  className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-[#001e45] disabled:opacity-60"
                                >
                                  {uploadingBlockId === block.id ? (
                                    <Loader2 className="animate-spin text-[#001e45]" size={20} />
                                  ) : (
                                    <ImagePlus size={20} />
                                  )}
                                  <span className="text-sm font-medium">본문 이미지를 업로드해 주세요</span>
                                </button>
                              )}

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openBlockImagePicker(block.id)}
                                  disabled={uploadingBlockId === block.id}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                  {block.imageUrl ? '이미지 변경/추가' : '이미지 선택'}
                                </button>
                              </div>

                              <input
                                type="text"
                                value={block.caption || ''}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#001e45] focus:ring-4 focus:ring-[#001e45]/10"
                                placeholder="이미지 설명이 있으면 입력해 주세요."
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600">
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
