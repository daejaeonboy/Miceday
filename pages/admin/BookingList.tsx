import React, { useEffect, useMemo, useState } from 'react';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Loader2,
    Mail,
    MessageSquareText,
    Phone,
    RefreshCcw,
    Send,
    Trash2,
    User,
} from 'lucide-react';
import {
    answerInquiry,
    deleteInquiry,
    getQuoteInquiries,
    Inquiry,
    isInquiriesTableMissingError,
    parseQuoteInquiryContent,
    QuoteInquiryPayload,
} from '../../src/api/inquiryApi';

interface QuoteInquiryRow extends Inquiry {
    quote: QuoteInquiryPayload | null;
}

const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
};

const formatPreferredInstallPickupTime = (
    value?: string,
    installTime?: string,
    pickupTime?: string,
) => {
    const directInstall = (installTime || '').trim();
    const directPickup = (pickupTime || '').trim();
    if (directInstall || directPickup) {
        return `설치: ${directInstall || '-'}\n회수: ${directPickup || '-'}`;
    }

    const raw = (value || '').trim();
    if (!raw) return '-';

    const normalized = raw
        .replace(/\r\n/g, '\n')
        .replace(/\s*\/\s*/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const installLine = normalized.find((line) => /^설치\s*:?\s*/.test(line));
    const pickupLine = normalized.find((line) => /^회수\s*:?\s*/.test(line));

    const install = installLine
        ? installLine.replace(/^설치\s*:?\s*/, '').trim() || '-'
        : normalized[0] || '-';
    const pickup = pickupLine
        ? pickupLine.replace(/^회수\s*:?\s*/, '').trim() || '-'
        : normalized[1] || '-';

    return `설치: ${install}\n회수: ${pickup}`;
};

const getProductSummary = (quote: QuoteInquiryPayload | null) => {
    if (!quote || quote.neededProducts.length === 0) return '-';
    return quote.neededProducts.join(', ');
};

const getPeriodSummary = (quote: QuoteInquiryPayload | null) => {
    if (!quote) return '-';
    if (quote.rentalStart && quote.rentalEnd) return `${quote.rentalStart} ~ ${quote.rentalEnd}`;
    if (quote.rentalStart) return `${quote.rentalStart} 시작`;
    if (quote.rentalEnd) return `${quote.rentalEnd} 종료`;
    return '-';
};

export const BookingList: React.FC = () => {
    const [items, setItems] = useState<QuoteInquiryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
    const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

    const loadQuoteInquiries = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const inquiryData = await getQuoteInquiries();
            const mappedData = inquiryData.map((inquiry) => ({
                ...inquiry,
                quote: parseQuoteInquiryContent(inquiry.content),
            }));
            setItems(mappedData);
            setAnswerDrafts(
                mappedData.reduce<Record<string, string>>((acc, item) => {
                    if (item.id) acc[item.id] = item.answer || '';
                    return acc;
                }, {}),
            );
        } catch (error) {
            console.error('Failed to load quote inquiries:', error);
            setItems([]);
            setAnswerDrafts({});
            setLoadError(
                isInquiriesTableMissingError(error)
                    ? 'inquiries 테이블이 아직 생성되지 않았습니다. Supabase SQL Editor에서 create_inquiries_table.sql을 먼저 실행해 주세요.'
                    : '견적문의 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadQuoteInquiries();
    }, []);

    const filteredItems = useMemo(() => {
        if (filter === 'all') return items;
        return items.filter((item) => item.status === filter);
    }, [filter, items]);

    const pendingCount = useMemo(() => items.filter((item) => item.status === 'pending').length, [items]);
    const answeredCount = useMemo(() => items.filter((item) => item.status === 'answered').length, [items]);

    const handleAnswerSave = async (id: string) => {
        const answerText = (answerDrafts[id] || '').trim();
        if (!answerText) return;

        setSavingId(id);
        try {
            await answerInquiry(id, answerText);
            await loadQuoteInquiries();
        } catch (error) {
            console.error('Failed to save answer:', error);
            alert('답변 저장에 실패했습니다.');
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('해당 견적문의를 삭제하시겠습니까?')) return;

        setDeletingId(id);
        try {
            await deleteInquiry(id);
            await loadQuoteInquiries();
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
            alert('삭제에 실패했습니다.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="animate-spin text-[#001e45]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">견적문의 관리</h1>
                    <p className="mt-1 text-sm text-slate-500">메인 견적문의서에서 접수된 요청을 확인하고 답변을 등록합니다.</p>
                </div>
                <button
                    type="button"
                    onClick={() => void loadQuoteInquiries()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <RefreshCcw size={14} />
                    새로고침
                </button>
            </header>

            <div className="grid gap-3 sm:grid-cols-3">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`rounded-2xl border p-4 text-left transition ${
                        filter === 'all' ? 'border-[#001e45] bg-[#001e45] text-white' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                >
                    <p className="text-xs font-bold">전체</p>
                    <p className="mt-1 text-2xl font-extrabold">{items.length}</p>
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`rounded-2xl border p-4 text-left transition ${
                        filter === 'pending' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                >
                    <p className="text-xs font-bold">답변 대기</p>
                    <p className="mt-1 text-2xl font-extrabold">{pendingCount}</p>
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('answered')}
                    className={`rounded-2xl border p-4 text-left transition ${
                        filter === 'answered' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                >
                    <p className="text-xs font-bold">답변 완료</p>
                    <p className="mt-1 text-2xl font-extrabold">{answeredCount}</p>
                </button>
            </div>

            {loadError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    {loadError}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-[980px] w-full">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">업체명</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">담당자</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">연락처</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">필요 품목</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">렌탈 기간</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">접수일</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">상태</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center text-sm font-medium text-slate-400">
                                        표시할 견적문의가 없습니다.
                                    </td>
                                </tr>
                            )}

                            {filteredItems.map((item) => {
                                const quote = item.quote;
                                const contactName = quote?.contactName || item.user_name || '-';
                                const phone = quote?.phone || '-';
                                const status = item.status || 'pending';
                                const rowExpanded = expandedId === item.id;
                                const isSaving = savingId === item.id;
                                const isDeleting = deletingId === item.id;

                                return (
                                    <React.Fragment key={item.id}>
                                        <tr
                                            className={`cursor-pointer transition ${rowExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/60'}`}
                                            onClick={() => setExpandedId(rowExpanded ? null : item.id || null)}
                                        >
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                                                {quote?.companyName || item.company_name || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-700">{contactName}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{phone}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{getProductSummary(quote)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{getPeriodSummary(quote)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-500">{formatDateTime(item.created_at)}</td>
                                            <td className="px-4 py-4 text-center">
                                                {status === 'answered' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                                                        <CheckCircle2 size={13} />
                                                        답변 완료
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                                                        <Clock3 size={13} />
                                                        답변 대기
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center" onClick={(event) => event.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    disabled={isDeleting}
                                                    onClick={() => item.id && handleDelete(item.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed"
                                                    title="삭제"
                                                >
                                                    {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                                </button>
                                            </td>
                                        </tr>

                                        {rowExpanded && (
                                            <tr className="bg-slate-50/80">
                                                <td colSpan={8} className="px-6 py-6">
                                                    <div className="grid gap-4 lg:grid-cols-2">
                                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                            <h3 className="mb-4 text-sm font-bold text-slate-900">문의 정보</h3>
                                                            <div className="space-y-2 text-sm text-slate-700">
                                                                <p className="flex items-start gap-2">
                                                                    <Building2 size={15} className="mt-0.5 text-slate-400" />
                                                                    <span>업체명: {quote?.companyName || item.company_name || '-'}</span>
                                                                </p>
                                                                <p className="flex items-start gap-2">
                                                                    <User size={15} className="mt-0.5 text-slate-400" />
                                                                    <span>담당자: {quote?.contactName || item.user_name || '-'}</span>
                                                                </p>
                                                                <p className="flex items-start gap-2">
                                                                    <Phone size={15} className="mt-0.5 text-slate-400" />
                                                                    <span>전화번호: {quote?.phone || '-'}</span>
                                                                </p>
                                                                <p className="flex items-start gap-2">
                                                                    <Mail size={15} className="mt-0.5 text-slate-400" />
                                                                    <span>이메일: {quote?.email || item.user_email || '-'}</span>
                                                                </p>
                                                                <p className="flex items-start gap-2">
                                                                    <CalendarDays size={15} className="mt-0.5 text-slate-400" />
                                                                    <span>렌탈 기간: {getPeriodSummary(quote)}</span>
                                                                </p>
                                                                <p className="flex items-start gap-2">
                                                                    <Clock3 size={15} className="mt-0.5 text-slate-400" />
                                                                    <span className="whitespace-pre-line">
                                                                        {formatPreferredInstallPickupTime(
                                                                            quote?.preferredInstallPickupTime,
                                                                            quote?.preferredInstallTime,
                                                                            quote?.preferredPickupTime,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                                <p className="flex items-start gap-2">
                                                                    <MessageSquareText size={15} className="mt-0.5 text-slate-400" />
                                                                    <span>접수일: {formatDateTime(item.created_at)}</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                                            <h3 className="mb-4 text-sm font-bold text-slate-900">요청 상세</h3>
                                                            {quote ? (
                                                                <div className="space-y-3 text-sm text-slate-700">
                                                                    <p>필요 품목: {getProductSummary(quote)}</p>
                                                                    <p>설치 장소: {quote.location || '-'}</p>
                                                                    <p className="whitespace-pre-line">
                                                                        {formatPreferredInstallPickupTime(
                                                                            quote.preferredInstallPickupTime,
                                                                            quote.preferredInstallTime,
                                                                            quote.preferredPickupTime,
                                                                        )}
                                                                    </p>
                                                                    <p>결제방법: {quote.paymentMethod || '-'}</p>
                                                                    <p>예산: {quote.budget || '-'}</p>
                                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                                        <p className="mb-1 text-xs font-bold text-slate-500">요청 메모</p>
                                                                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{quote.notes}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                                    <p className="mb-1 text-xs font-bold text-slate-500">원본 내용</p>
                                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.content}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                                                        <label className="mb-2 block text-sm font-bold text-blue-800">관리자 답변</label>
                                                        <textarea
                                                            rows={4}
                                                            value={item.id ? answerDrafts[item.id] || '' : ''}
                                                            onChange={(event) =>
                                                                item.id &&
                                                                setAnswerDrafts((prev) => ({
                                                                    ...prev,
                                                                    [item.id as string]: event.target.value,
                                                                }))
                                                            }
                                                            placeholder="고객에게 전달할 답변을 입력해 주세요."
                                                            className="w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                                        />
                                                        <div className="mt-3 flex justify-end">
                                                            <button
                                                                type="button"
                                                                disabled={!item.id || isSaving || !(answerDrafts[item.id] || '').trim()}
                                                                onClick={() => item.id && handleAnswerSave(item.id)}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                                            >
                                                                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                                                                답변 저장
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
