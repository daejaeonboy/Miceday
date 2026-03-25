import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../src/firebase';
import { ensureBootstrapAdminProfile, isBootstrapAdminEmail } from '../../src/utils/adminBootstrap';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

const getAdminAccessError = (hasProfile: boolean, isAdmin?: boolean, isApproved?: boolean) => {
  if (!hasProfile) {
    return '관리자 프로필이 없습니다. 허용된 관리자 계정으로 로그인해주세요.';
  }

  if (!isAdmin) {
    return '관리자 권한이 없는 계정입니다.';
  }

  if (!isApproved) {
    return '관리자 승인 후 로그인할 수 있습니다.';
  }

  return '';
};

const GoogleMark = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.7C16.9 2.7 14.7 2 12 2 6.9 2 2.8 6.4 2.8 11.8S6.9 21.6 12 21.6c6.9 0 9.1-4.9 9.1-7.4 0-.5-.1-.9-.1-1.3H12Z" />
    <path fill="#FBBC05" d="M2.8 7.3 6 9.7c.9-2.7 3.2-4.6 6-4.6 1.9 0 3.2.8 3.9 1.5l2.7-2.7C16.9 2.7 14.7 2 12 2 8.1 2 4.7 4.2 2.8 7.3Z" />
    <path fill="#34A853" d="M12 21.6c2.6 0 4.8-.9 6.4-2.5l-3-2.5c-.8.6-1.9 1.1-3.4 1.1-4 0-5.2-2.7-5.5-3.9L3.1 16c1.9 3.3 5 5.6 8.9 5.6Z" />
    <path fill="#4285F4" d="M21.1 12.9c0-.5-.1-.9-.1-1.3H12v3.9h5.5c-.3 1.2-1 2.2-2 3l3 2.5c1.8-1.7 2.6-4.1 2.6-6.8Z" />
  </svg>
);

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const completeAdminLogin = async (user: Parameters<typeof ensureBootstrapAdminProfile>[0]) => {
    const profile = await ensureBootstrapAdminProfile(user);

    if (!profile?.is_admin || !profile.is_approved) {
      await auth.signOut();
      setError(getAdminAccessError(Boolean(profile), profile?.is_admin, profile?.is_approved));
      return false;
    }

    navigate(from, { replace: true });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await completeAdminLogin(userCredential.user);
    } catch (err: any) {
      console.error('Admin login failed:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const signedInEmail = userCredential.user.email?.trim().toLowerCase();

      if (signedInEmail !== 'micepartner@micepartner.co.kr' && !isBootstrapAdminEmail(signedInEmail)) {
        await auth.signOut();
        setError('허용된 관리자 Google 계정이 아닙니다. micepartner@micepartner.co.kr 로 로그인해주세요.');
        return;
      }

      await completeAdminLogin(userCredential.user);
    } catch (err: any) {
      console.error('Admin Google login failed:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#001e45]">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-gray-500">휴먼파트너 관리자 페이지</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <div className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">관리자 이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                  placeholder="micepartner@micepartner.co.kr"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                    placeholder="비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#001e45] py-3 font-semibold text-white transition-colors hover:bg-[#002d66] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    로그인 중...
                  </>
                ) : (
                  '이메일로 로그인'
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => void handleGoogleLogin()}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="animate-spin" size={20} /> : <GoogleMark />}
              Google로 로그인
            </button>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link to="/admin/signup" className="font-semibold text-[#001e45] hover:underline">
                관리자 가입
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 transition-colors hover:text-[#001e45]">
            메인 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
};
