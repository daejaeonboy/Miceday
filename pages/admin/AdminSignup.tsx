import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { auth } from '../../src/firebase';
import { createUserProfile } from '../../src/api/userApi';
import { ensureBootstrapAdminProfile } from '../../src/utils/adminBootstrap';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

export const AdminSignup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone' ? formatPhoneNumber(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      await createUserProfile({
        firebase_uid: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        company_name: '휴먼파트너',
        agreed_terms: true,
        agreed_privacy: true,
        agreed_marketing: false,
      });

      const profile = await ensureBootstrapAdminProfile(userCredential.user);

      if (profile?.is_admin && profile.is_approved) {
        navigate('/admin', { replace: true });
        return;
      }

      await auth.signOut();
      alert('관리자 가입이 완료되었습니다. 승인 후 로그인할 수 있습니다.');
      navigate('/admin/login');
    } catch (err: any) {
      console.error('Admin signup failed:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#001e45]">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 가입</h1>
          <p className="mt-2 text-gray-500">휴먼파트너 관리자 계정 요청</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={13}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                placeholder="010-1234-5678"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                    placeholder="8자 이상"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                  placeholder="비밀번호 확인"
                />
              </div>
            </div>

            <p className="pt-2 text-center text-xs text-gray-500">
              일반 관리자 계정은 승인 후 로그인할 수 있습니다.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#001e45] py-3 font-semibold text-white transition-colors hover:bg-[#002d66] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  가입 중...
                </>
              ) : (
                '관리자 가입'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/admin/login" className="font-semibold text-[#001e45] hover:underline">
                로그인
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
