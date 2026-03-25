import { useEffect, useMemo, useState } from 'react';
import {
    Building2,
    Calendar,
    CheckCircle,
    Edit2,
    Eye,
    FileText,
    Info,
    Loader2,
    Mail,
    Phone,
    Save,
    Search,
    Trash2,
    UserCheck,
    UserX,
    X,
    XCircle,
} from 'lucide-react';
import {
    deleteUserProfile,
    getUsers,
    searchUsers,
    updateUserProfile,
    UserProfile,
} from '../../src/api/userApi';

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const UserManager = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [approving, setApproving] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        void loadUsers();
    }, []);

    const approvedCount = useMemo(() => users.filter((user) => user.is_approved).length, [users]);
    const pendingCount = users.length - approvedCount;

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            await loadUsers();
            return;
        }

        try {
            setLoading(true);
            const data = await searchUsers(searchQuery);
            setUsers(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id: string, approve: boolean) => {
        setApproving(id);
        try {
            const updated = await updateUserProfile(id, { is_approved: approve });
            setUsers((current) => current.map((user) => (user.id === id ? updated : user)));
            setSelectedUser((current) => (current?.id === id ? updated : current));
            alert(approve ? '회원 승인이 완료되었습니다.' : '회원 승인을 취소했습니다.');
        } catch (error) {
            console.error('Failed to update approval:', error);
            alert('승인 상태 변경에 실패했습니다.');
        } finally {
            setApproving(null);
        }
    };

    const handleAdminToggle = async (id: string, isAdmin: boolean) => {
        try {
            const updated = await updateUserProfile(id, { is_admin: isAdmin });
            setUsers((current) => current.map((user) => (user.id === id ? updated : user)));
            setSelectedUser((current) => (current?.id === id ? updated : current));
        } catch (error) {
            console.error('Failed to update admin status:', error);
            alert('관리자 권한 변경에 실패했습니다.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        setDeleting(id);
        try {
            await deleteUserProfile(id);
            setUsers((current) => current.filter((user) => user.id !== id));
            setSelectedUser((current) => (current?.id === id ? null : current));
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('회원 삭제에 실패했습니다.');
        } finally {
            setDeleting(null);
        }
    };

    const openEditMode = (user: UserProfile) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            phone: user.phone,
            company_name: user.company_name,
            department: user.department || '',
            position: user.position || '',
            business_number: user.business_number || '',
            address: user.address || '',
        });
        setEditMode(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedUser?.id) return;

        setSaving(true);
        try {
            const updated = await updateUserProfile(selectedUser.id, editData);
            setUsers((current) => current.map((user) => (user.id === selectedUser.id ? updated : user)));
            setSelectedUser(updated);
            setEditMode(false);
            alert('회원 정보가 수정되었습니다.');
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('회원 정보 수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-[#001e45]" size={40} />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">회원 관리</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        총 {users.length}명, 승인 {approvedCount}명, 대기 {pendingCount}명
                    </p>
                </div>
            </div>

            <div className="mb-6 rounded-xl bg-white p-4 shadow-md">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="이름, 이메일, 회사명으로 검색"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    void handleSearch();
                                }
                            }}
                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                        />
                    </div>
                    <button onClick={() => void handleSearch()} className="rounded-lg bg-[#001e45] px-6 py-2.5 text-white transition-colors hover:bg-[#002d66]">
                        검색
                    </button>
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                void loadUsers();
                            }}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 hover:bg-slate-50"
                        >
                            초기화
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-md">
                <table className="w-full">
                    <thead className="border-b bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">회원정보</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">회사/기관</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">연락처</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">승인상태</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className={user.is_approved ? 'hover:bg-slate-50' : 'bg-amber-50/50 hover:bg-amber-50'}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${user.is_approved ? 'bg-gradient-to-br from-[#001e45] to-[#003366]' : 'bg-slate-400'}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 font-medium text-slate-800">
                                                    {user.name}
                                                    {user.is_admin && (
                                                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-600">관리자</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-slate-800">{user.company_name}</div>
                                        {user.business_number && <div className="text-sm text-slate-500">사업자번호 {user.business_number}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center">
                                            {user.is_approved ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                    <CheckCircle size={14} /> 승인
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                    <XCircle size={14} /> 대기
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {!user.is_approved ? (
                                                <button
                                                    onClick={() => void handleApproval(user.id!, true)}
                                                    disabled={approving === user.id}
                                                    className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                                                    title="승인"
                                                >
                                                    {approving === user.id ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => void handleApproval(user.id!, false)}
                                                    disabled={approving === user.id}
                                                    className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50 disabled:opacity-50"
                                                    title="승인 취소"
                                                >
                                                    {approving === user.id ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setEditMode(false);
                                                }}
                                                className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50"
                                                title="상세보기"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => void handleDelete(user.id!)}
                                                disabled={deleting === user.id}
                                                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                                title="삭제"
                                            >
                                                {deleting === user.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
                            <h3 className="text-lg font-bold">{editMode ? '회원 정보 수정' : '회원 상세정보'}</h3>
                            <div className="flex items-center gap-2">
                                {!editMode && (
                                    <button onClick={() => openEditMode(selectedUser)} className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50" title="수정">
                                        <Edit2 size={20} />
                                    </button>
                                )}
                                <button onClick={() => { setSelectedUser(null); setEditMode(false); }} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className={`flex items-center justify-between rounded-lg border p-3 ${selectedUser.is_approved ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                                <div className="flex items-center gap-2">
                                    {selectedUser.is_approved ? (
                                        <>
                                            <CheckCircle className="text-green-600" size={20} />
                                            <span className="font-medium text-green-700">승인된 회원</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="text-amber-600" size={20} />
                                            <span className="font-medium text-amber-700">승인 대기중</span>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => void handleApproval(selectedUser.id!, !selectedUser.is_approved)}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                        selectedUser.is_approved ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {selectedUser.is_approved ? '승인 취소' : '승인하기'}
                                </button>
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
                                        <input
                                            type="text"
                                            value={editData.name || ''}
                                            onChange={(event) => setEditData({ ...editData, name: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                            {selectedUser.email}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">전화번호</label>
                                        <input
                                            type="tel"
                                            value={editData.phone || ''}
                                            onChange={(event) => setEditData({ ...editData, phone: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">회사/기관명</label>
                                        <input
                                            type="text"
                                            value={editData.company_name || ''}
                                            onChange={(event) => setEditData({ ...editData, company_name: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">부서</label>
                                            <input
                                                type="text"
                                                value={editData.department || ''}
                                                onChange={(event) => setEditData({ ...editData, department: event.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700">직책</label>
                                            <input
                                                type="text"
                                                value={editData.position || ''}
                                                onChange={(event) => setEditData({ ...editData, position: event.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">사업자등록번호</label>
                                        <input
                                            type="text"
                                            value={editData.business_number || ''}
                                            onChange={(event) => setEditData({ ...editData, business_number: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">주소</label>
                                        <input
                                            type="text"
                                            value={editData.address || ''}
                                            onChange={(event) => setEditData({ ...editData, address: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-slate-700">
                                        <Info size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                                        <p>운영 배포에서는 관리자 화면에서 이메일과 비밀번호를 직접 변경하지 않도록 제한했습니다.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 border-b pb-4">
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white ${selectedUser.is_approved ? 'bg-gradient-to-br from-[#001e45] to-[#003366]' : 'bg-slate-400'}`}>
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                                {selectedUser.name}
                                                {selectedUser.is_admin && (
                                                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600">관리자</span>
                                                )}
                                            </div>
                                            <div className="text-slate-500">{selectedUser.company_name}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Mail size={18} className="text-slate-400" />
                                            <span>{selectedUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Phone size={18} className="text-slate-400" />
                                            <span>{selectedUser.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Building2 size={18} className="text-slate-400" />
                                            <span>
                                                {selectedUser.company_name}
                                                {(selectedUser.department || selectedUser.position) && (
                                                    <span className="ml-2 text-slate-400">
                                                        ({[selectedUser.department, selectedUser.position].filter(Boolean).join(' / ')})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {selectedUser.business_number && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <FileText size={18} className="text-slate-400" />
                                                <span>사업자등록번호 {selectedUser.business_number}</span>
                                            </div>
                                        )}
                                        {selectedUser.business_license_url && (
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <FileText size={18} className="text-slate-400" />
                                                <a href={selectedUser.business_license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    사업자등록증 보기
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Calendar size={18} className="text-slate-400" />
                                            <span>가입일: {formatDate(selectedUser.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-slate-800">관리자 권한</h4>
                                                <p className="text-sm text-slate-500">관리자 대시보드 접근 권한을 부여합니다.</p>
                                            </div>
                                            <button
                                                onClick={() => void handleAdminToggle(selectedUser.id!, !selectedUser.is_admin)}
                                                className={`relative h-7 w-14 rounded-full transition-colors ${selectedUser.is_admin ? 'bg-purple-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${selectedUser.is_admin ? 'translate-x-7' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="mb-3 text-sm font-semibold text-slate-700">동의 현황</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">이용약관</span>
                                                <span className={selectedUser.agreed_terms ? 'text-green-600' : 'text-red-500'}>
                                                    {selectedUser.agreed_terms ? '동의' : '미동의'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">개인정보처리방침</span>
                                                <span className={selectedUser.agreed_privacy ? 'text-green-600' : 'text-red-500'}>
                                                    {selectedUser.agreed_privacy ? '동의' : '미동의'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">마케팅 정보 수신</span>
                                                <span className={selectedUser.agreed_marketing ? 'text-green-600' : 'text-slate-400'}>
                                                    {selectedUser.agreed_marketing ? '동의' : '미동의'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-slate-50 p-4">
                            {editMode ? (
                                <>
                                    <button onClick={() => setEditMode(false)} className="rounded-lg border border-slate-300 px-4 py-2 transition-colors hover:bg-slate-100">
                                        취소
                                    </button>
                                    <button
                                        onClick={() => void handleSaveEdit()}
                                        disabled={saving}
                                        className="flex items-center gap-2 rounded-lg bg-[#001E45] px-4 py-2 text-white transition-colors hover:bg-[#002d66] disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        저장
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => { setSelectedUser(null); setEditMode(false); }} className="rounded-lg border border-slate-300 px-4 py-2 transition-colors hover:bg-slate-100">
                                        닫기
                                    </button>
                                    <button onClick={() => void handleDelete(selectedUser.id!)} className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">
                                        회원 삭제
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
