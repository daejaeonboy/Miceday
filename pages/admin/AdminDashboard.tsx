import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  User,
  Users,
} from 'lucide-react';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  type Notification,
} from '../../src/api/notificationApi';
import { useAuth } from '../../src/context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    path: '/admin',
    label: '대시보드',
    description: '관리자 메인 화면',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: '/admin/products',
    label: '상품 관리',
    description: '상품 등록, 수정, 삭제',
    icon: Package,
  },
  {
    path: '/admin/bookings',
    label: '견적 문의 관리',
    description: '견적 요청 확인 및 처리',
    icon: CalendarCheck,
  },
  {
    path: '/admin/inquiries',
    label: '1:1 문의 관리',
    description: '고객 문의 응답 관리',
    icon: MessageSquare,
  },
  {
    path: '/admin/cases',
    label: '설치 사례 관리',
    description: '설치 사례 페이지 데이터 관리',
    icon: ImageIcon,
  },
  {
    path: '/admin/main-reviews',
    label: '메인 리뷰 카드',
    description: '메인 리뷰 섹션 카드 관리',
    icon: ImageIcon,
  },
  {
    path: '/admin/cms',
    label: '콘텐츠 관리',
    description: '메뉴, 배너, 팝업, 로고 관리',
    icon: Settings,
  },
  {
    path: '/admin/faqs',
    label: 'FAQ 관리',
    description: '자주 묻는 질문 관리',
    icon: HelpCircle,
  },
  {
    path: '/admin/users',
    label: '회원 관리',
    description: '회원 승인 및 상태 관리',
    icon: Users,
  },
];

const formatNotificationTime = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const isRoot = location.pathname === '/admin';

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const loadNotifications = async () => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoadingNotifications(true);

    try {
      const [items, count] = await Promise.all([
        getNotifications(user.uid, 10),
        getUnreadCount(user.uid),
      ]);

      setNotifications(items);
      setUnreadCount(count);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    void loadNotifications();

    if (!user?.uid) return;

    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [user?.uid]);

  useEffect(() => {
    setNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!notificationOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    await logout();
    navigate('/admin/login');
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      const success = await markAsRead(notification.id);

      if (success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }

    setNotificationOpen(false);
    navigate(notification.link_url || '/admin/bookings');
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid || unreadCount === 0) return;

    const success = await markAllAsRead(user.uid);
    if (!success) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  };

  const quickLinks = navItems.filter((item) => item.path !== '/admin');

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              사이트로 이동
            </Link>
            <h1 className="text-xl font-bold text-slate-900">휴먼파트너 관리자</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen((prev) => !prev);
                  void loadNotifications();
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="알림 열기"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#001e45] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">알림</p>
                      <p className="text-xs text-slate-500">최근 접수된 문의 알림을 확인합니다.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleMarkAllAsRead()}
                      className="text-xs font-semibold text-[#001e45] disabled:text-slate-300"
                      disabled={unreadCount === 0}
                    >
                      모두 읽음
                    </button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">알림을 불러오는 중입니다.</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">표시할 알림이 없습니다.</div>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => void handleNotificationClick(item)}
                          className={`flex w-full flex-col items-start gap-1 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                            item.is_read ? 'bg-white' : 'bg-[#001e45]/[0.03]'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                            {!item.is_read && <span className="h-2 w-2 rounded-full bg-[#001e45]" />}
                          </div>
                          <p className="text-sm text-slate-600">{item.message}</p>
                          <span className="text-xs text-slate-400">{formatNotificationTime(item.created_at)}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                {userProfile?.name?.charAt(0) || <User size={14} />}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{userProfile?.name || '관리자'}</p>
                <p className="text-slate-500">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:block">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block rounded-xl border px-3 py-2.5 transition ${
                    active
                      ? 'border-[#001e45]/20 bg-[#001e45]/8'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={active ? 'text-[#001e45]' : 'text-slate-500'} />
                    <span className={`text-sm font-semibold ${active ? 'text-[#001e45]' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-[calc(100vh-72px)] flex-1 p-6">
          {isRoot ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">관리자 홈</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  안녕하세요, {userProfile?.name || '관리자'}님
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  주요 운영 메뉴를 한곳에서 빠르게 이동할 수 있도록 정리했습니다.
                  아래 바로가기를 눌러 필요한 작업을 진행해 주세요.
                </p>
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-[#001e45] group-hover:text-white">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{item.label}</h3>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </section>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
