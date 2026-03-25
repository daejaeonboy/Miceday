import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#001e45]" size={48} />
          <p className="mt-4 text-slate-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!userProfile || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="text-red-500" size={32} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">접근 권한 없음</h1>
          <p className="mb-6 text-slate-600">
            관리자 페이지에 접근할 권한이 없습니다.
            <br />
            관리자 권한이 필요한 경우 서비스 관리자에게 문의해 주세요.
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full rounded-lg bg-[#001e45] py-3 font-medium text-white transition-colors hover:bg-[#002d66]"
            >
              메인으로 돌아가기
            </a>
            <button
              onClick={() => window.history.back()}
              className="block w-full rounded-lg border border-slate-300 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              이전 페이지로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
