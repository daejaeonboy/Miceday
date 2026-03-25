import React, { useEffect, useRef, useState } from 'react';
import {
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  addAllianceMember,
  addBanner,
  addPopup,
  addQuickMenuItem,
  AllianceMember,
  Banner,
  deleteAllianceMember,
  deleteBanner,
  deletePopup,
  deleteQuickMenuItem,
  getAllAllianceMembers,
  getAllBanners,
  getAllPopups,
  getAllQuickMenuItems,
  Popup,
  QuickMenuItem,
  updateAllianceMember,
  updateBanner,
  updatePopup,
  updateQuickMenuItem,
} from '../../src/api/cmsApi';
import { uploadImage } from '../../src/api/storageApi';

type TabType = 'alliance' | 'banners' | 'quickmenu' | 'popups';

type FormState = {
  name?: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  link?: string;
  button_text?: string;
  brand_text?: string;
  target_product_code?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
  icon?: string;
  category1?: string;
  category2?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  display_order: number;
  is_active: boolean;
};

const tabLabels: Record<TabType, string> = {
  alliance: '파트너 로고',
  banners: '메인 배너',
  quickmenu: '퀵메뉴',
  popups: '팝업',
};

const tabDescriptions: Record<TabType, string> = {
  alliance: '메인페이지 CLIENTS 로고 마키에 노출되는 파트너 로고를 관리합니다.',
  banners: '메인페이지 최상단 슬라이드 배너를 관리합니다.',
  quickmenu: '메인 화면 퀵메뉴 아이콘과 링크를 관리합니다.',
  popups: '메인 및 하위 페이지 팝업을 관리합니다.',
};

const getUploadErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '알 수 없는 오류';
  const anyError = error as any;
  return anyError.message || anyError.error_description || anyError.details || '알 수 없는 오류';
};

const getDefaultFormData = (
  tab: TabType,
  counts: Record<TabType, number>,
): FormState => {
  if (tab === 'alliance') {
    return {
      name: '',
      category1: '',
      category2: '',
      address: '',
      phone: '',
      logo_url: '',
      display_order: counts.alliance + 1,
      is_active: true,
    };
  }

  if (tab === 'banners') {
    return {
      title: '',
      subtitle: '',
      image_url: '',
      link: '/',
      button_text: '자세히 보기',
      brand_text: 'HUMAN PARTNER',
      target_product_code: '',
      display_order: counts.banners + 1,
      is_active: true,
    };
  }

  if (tab === 'quickmenu') {
    return {
      name: '',
      link: '/',
      category: '',
      icon: 'Grid3X3',
      image_url: '',
      display_order: counts.quickmenu + 1,
      is_active: true,
    };
  }

  return {
    title: '',
    subtitle: '',
    image_url: '',
    link: '/',
    start_date: '',
    end_date: '',
    display_order: counts.popups + 1,
    is_active: true,
  };
};

export const CMSManager: React.FC = () => {
  const [tab, setTab] = useState<TabType>('alliance');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormState>({ display_order: 1, is_active: true });
  const fileRef = useRef<HTMLInputElement>(null);

  const [quick, setQuick] = useState<QuickMenuItem[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [alliance, setAlliance] = useState<AllianceMember[]>([]);

  const counts = {
    alliance: alliance.length,
    banners: banners.length,
    quickmenu: quick.length,
    popups: popups.length,
  } satisfies Record<TabType, number>;

  const loadData = async () => {
    setLoading(true);
    try {
      const [quickData, bannerData, popupData, allianceData] = await Promise.all([
        getAllQuickMenuItems().catch(() => []),
        getAllBanners().catch(() => []),
        getAllPopups().catch(() => []),
        getAllAllianceMembers().catch(() => []),
      ]);

      setQuick(quickData as QuickMenuItem[]);
      setBanners((bannerData as Banner[]).filter((item) => item.banner_type === 'hero'));
      setPopups(popupData as Popup[]);
      setAlliance(allianceData as AllianceMember[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentItems =
    tab === 'alliance' ? alliance : tab === 'banners' ? banners : tab === 'quickmenu' ? quick : popups;

  const openAdd = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData(tab, counts));
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setUploading(false);
    setFormData(getDefaultFormData(tab, counts));
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      let url = '';
      try {
        url = await uploadImage(file, tab);
      } catch {
        url = await uploadImage(file);
      }

      if (tab === 'alliance') {
        setFormData((prev) => ({ ...prev, logo_url: url }));
      } else {
        setFormData((prev) => ({ ...prev, image_url: url }));
      }
    } catch (error) {
      alert(`이미지 업로드에 실패했습니다.\n사유: ${getUploadErrorMessage(error)}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (tab === 'alliance') {
        if (!formData.name?.trim()) {
          alert('브랜드명을 입력해 주세요.');
          return;
        }
        if (!formData.logo_url?.trim()) {
          alert('로고 이미지를 업로드해 주세요.');
          return;
        }

        const payload: Omit<AllianceMember, 'id' | 'created_at'> = {
          name: formData.name.trim(),
          category1: formData.category1?.trim() || '',
          category2: formData.category2?.trim() || '',
          address: formData.address?.trim() || '',
          phone: formData.phone?.trim() || '',
          logo_url: formData.logo_url,
          display_order: Number(formData.display_order) || 1,
          is_active: Boolean(formData.is_active),
        };

        if (editingItem?.id) await updateAllianceMember(editingItem.id, payload);
        else await addAllianceMember(payload);
      } else if (tab === 'banners') {
        if (!formData.title?.trim() || !formData.image_url?.trim()) {
          alert('배너 제목과 이미지를 입력해 주세요.');
          return;
        }

        const payload: Omit<Banner, 'id' | 'created_at'> = {
          title: formData.title.trim(),
          subtitle: formData.subtitle?.trim() || '',
          image_url: formData.image_url,
          link: formData.link?.trim() || '/',
          button_text: formData.button_text?.trim() || '자세히 보기',
          brand_text: formData.brand_text?.trim() || 'HUMAN PARTNER',
          banner_type: 'hero',
          tab_id: null,
          display_order: Number(formData.display_order) || 1,
          is_active: Boolean(formData.is_active),
          target_product_code: formData.target_product_code?.trim() || '',
        };

        if (editingItem?.id) await updateBanner(editingItem.id, payload);
        else await addBanner(payload);
      } else if (tab === 'quickmenu') {
        if (!formData.name?.trim()) {
          alert('퀵메뉴 이름을 입력해 주세요.');
          return;
        }

        const payload: Omit<QuickMenuItem, 'id' | 'created_at'> = {
          name: formData.name.trim(),
          icon: formData.icon?.trim() || 'Grid3X3',
          image_url: formData.image_url?.trim() || '',
          link: formData.link?.trim() || '/',
          category: formData.category?.trim() || '',
          display_order: Number(formData.display_order) || 1,
          is_active: Boolean(formData.is_active),
        };

        if (editingItem?.id) await updateQuickMenuItem(editingItem.id, payload);
        else await addQuickMenuItem(payload);
      } else {
        if (!formData.title?.trim() || !formData.image_url?.trim()) {
          alert('팝업 제목과 이미지를 입력해 주세요.');
          return;
        }

        const payload: Omit<Popup, 'id' | 'created_at'> = {
          title: formData.title.trim(),
          image_url: formData.image_url,
          link: formData.link?.trim() || '/',
          start_date: formData.start_date || '',
          end_date: formData.end_date || '',
          display_order: Number(formData.display_order) || 1,
          is_active: Boolean(formData.is_active),
          target_product_code: '',
        };

        if (editingItem?.id) await updatePopup(editingItem.id, payload);
        else await addPopup(payload);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error(error);
      alert('저장에 실패했습니다. 입력값을 다시 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('해당 항목을 삭제하시겠습니까?')) return;

    try {
      if (tab === 'alliance') await deleteAllianceMember(id);
      else if (tab === 'banners') await deleteBanner(id);
      else if (tab === 'quickmenu') await deleteQuickMenuItem(id);
      else await deletePopup(id);
      await loadData();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const toggle = async (item: any) => {
    try {
      if (tab === 'alliance') await updateAllianceMember(item.id, { is_active: !item.is_active });
      else if (tab === 'banners') await updateBanner(item.id, { is_active: !item.is_active });
      else if (tab === 'quickmenu') await updateQuickMenuItem(item.id, { is_active: !item.is_active });
      else await updatePopup(item.id, { is_active: !item.is_active });
      await loadData();
    } catch {
      alert('노출 상태 변경에 실패했습니다.');
    }
  };

  const getItemTitle = (item: any) => (tab === 'alliance' ? item.name : item.title || item.name);
  const getItemSubtitle = (item: any) => {
    if (tab === 'alliance') {
      return `${item.category1 || ''} ${item.category2 || ''}`.trim() || item.phone || '파트너 로고';
    }
    if (tab === 'banners') {
      return item.link || '/';
    }
    return item.link || '-';
  };

  const imagePreviewUrl = formData.image_url || formData.logo_url || '';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#001e45]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">콘텐츠 관리</h1>
          <p className="text-sm text-slate-500">메인 운영 요소를 한곳에서 관리합니다.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white"
        >
          <Plus size={16} />
          추가
        </button>
      </div>

      <div className="mb-3 flex gap-2 border-b border-slate-200">
        {(Object.keys(tabLabels) as TabType[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === id ? 'border-[#001e45] text-[#001e45]' : 'border-transparent text-slate-500'
            }`}
          >
            {tabLabels[id]}
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {tabDescriptions[tab]}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {currentItems.length === 0 ? (
          <div className="p-10 text-center text-slate-400">등록된 항목이 없습니다.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentItems.map((item: any) => {
              const imageUrl = item.image_url || item.logo_url;
              const isLogoTab = tab === 'alliance';

              return (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {imageUrl && (
                    <div className={`flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 ${isLogoTab ? 'h-16 w-[180px] p-3 md:w-[260px]' : 'h-14 w-20 overflow-hidden'}`}>
                      <img
                        src={imageUrl}
                        alt={getItemTitle(item)}
                        className={isLogoTab ? 'h-full w-full object-contain' : 'h-full w-full object-cover'}
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-800">{getItemTitle(item)}</p>
                      {!item.is_active && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">비활성</span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-500">{getItemSubtitle(item)}</p>
                  </div>

                  <span className="text-xs text-slate-400">순서 {item.display_order}</span>

                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(item)} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                      {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openEdit(item)} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => remove(item.id)} className="rounded p-2 text-red-500 hover:bg-red-50">
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
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h2 className="font-bold">{editingItem ? `${tabLabels[tab]} 수정` : `${tabLabels[tab]} 추가`}</h2>
              <button type="button" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3 p-4">
              <input
                value={formData.name || formData.title || ''}
                onChange={(e) =>
                  tab === 'alliance' || tab === 'quickmenu'
                    ? setFormData((prev) => ({ ...prev, name: e.target.value }))
                    : setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={tab === 'alliance' ? '브랜드명' : tab === 'quickmenu' ? '메뉴명' : '제목'}
                className="w-full rounded border px-3 py-2"
                required
              />

              {(tab === 'banners' || tab === 'popups') && (
                <input
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="부제목(선택)"
                  className="w-full rounded border px-3 py-2"
                />
              )}

              {tab === 'alliance' ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={formData.category1 || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category1: e.target.value }))}
                      placeholder="카테고리1(선택)"
                      className="w-full rounded border px-3 py-2"
                    />
                    <input
                      value={formData.category2 || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category2: e.target.value }))}
                      placeholder="카테고리2(선택)"
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>
                  <input
                    value={formData.address || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="주소(선택)"
                    className="w-full rounded border px-3 py-2"
                  />
                  <input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="전화번호(선택)"
                    className="w-full rounded border px-3 py-2"
                  />
                  <p className="text-xs leading-5 text-slate-500">
                    로고 이미지는 가로형 동일 비율을 권장합니다. 가능하면 3:1~4:1 비율의 PNG/SVG를 사용해 주세요. 메인 노출 시 모든 로고가 동일한 프레임 안에서
                    <span className="font-semibold text-slate-700"> object-contain </span>
                    으로 맞춰집니다.
                  </p>
                </>
              ) : (
                <input
                  value={formData.link || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                  placeholder="/ 경로 또는 https://..."
                  className="w-full rounded border px-3 py-2"
                />
              )}

              {tab === 'quickmenu' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={formData.category || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="카테고리(선택)"
                    className="rounded border px-3 py-2"
                  />
                  <input
                    value={formData.icon || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="아이콘명(선택)"
                    className="rounded border px-3 py-2"
                  />
                </div>
              )}

              {tab === 'banners' && (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={formData.brand_text || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand_text: e.target.value }))}
                    placeholder="브랜드 텍스트"
                    className="rounded border px-3 py-2"
                  />
                  <input
                    value={formData.button_text || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value }))}
                    placeholder="버튼 텍스트"
                    className="rounded border px-3 py-2"
                  />
                  <input
                    value={formData.target_product_code || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target_product_code: e.target.value }))}
                    placeholder="상품코드 연결(선택)"
                    className="rounded border px-3 py-2 md:col-span-2"
                  />
                </div>
              )}

              {tab === 'popups' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                    className="rounded border px-3 py-2"
                  />
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                    className="rounded border px-3 py-2"
                  />
                </div>
              )}

              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded border border-dashed px-3 py-3 text-slate-600"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {tab === 'alliance' ? '로고 이미지 업로드' : '이미지 업로드'}
                </button>

                {imagePreviewUrl && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className={`flex items-center justify-center rounded-lg bg-white ${tab === 'alliance' ? 'mx-auto h-20 w-[260px] px-4' : 'overflow-hidden'}`}>
                      <img
                        src={imagePreviewUrl}
                        alt="preview"
                        className={tab === 'alliance' ? 'h-full w-full object-contain py-3' : 'h-44 w-full object-cover'}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={formData.display_order ?? 1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) || 1 }))}
                  className="rounded border px-3 py-2"
                  placeholder="순서"
                />
                <label className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_active)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  활성화
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={closeModal} className="rounded border px-4 py-2 text-slate-700">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded bg-[#001e45] px-4 py-2 text-white"
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
