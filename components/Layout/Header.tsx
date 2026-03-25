import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Container } from "../ui/Container";
import { siteBrand } from "../../src/config/siteBrand";

interface NavLinkItem {
  label: string;
  to: string;
  cta?: boolean;
}

const gnbLinks: NavLinkItem[] = [
  { label: "고객사례", to: "/cases" },
  { label: "기업소개", to: "/company" },
  { label: "렌탈품목", to: "/products" },
  { label: "견적문의", to: "/quote-request", cta: true },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [isTopZone, setIsTopZone] = useState(true);

  const isHome = location.pathname === "/";
  const useTransparentHeader = isHome && isTopZone && !mobileMenuMounted;

  useEffect(() => {
    const handleScroll = () => {
      const current = window.pageYOffset || document.documentElement.scrollTop;
      setIsTopZone(current < 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuMounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuMounted]);

  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuMounted(true);
      return;
    }

    if (!mobileMenuMounted) return;
    const timeout = window.setTimeout(() => setMobileMenuMounted(false), 320);
    return () => window.clearTimeout(timeout);
  }, [mobileMenuMounted, mobileMenuOpen]);

  const openMobileMenu = () => {
    setMobileMenuMounted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMobileMenuOpen(true));
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const desktopLinkClassName = useMemo(
    () =>
      useTransparentHeader
        ? "text-white hover:text-white/80"
        : "text-[var(--header-nav-link)] hover:text-[var(--header-nav-link)]/80",
    [useTransparentHeader],
  );

  return (
    <header className="w-full">
      <div className={isHome ? "h-0" : "h-[86px] md:h-[94px]"} />

      <div
        className={`fixed left-0 right-0 top-0 z-40 border-b border-[var(--header-border)] bg-[var(--header-surface)] backdrop-blur transition-colors duration-300 ${
          useTransparentHeader ? "header-overlay" : ""
        }`}
      >
        <Container>
          <div className="flex h-[86px] items-center justify-between md:h-[94px]">
            <Link
              to="/"
              className="flex items-center text-xl font-black tracking-tight text-[var(--header-logo-color)] md:text-2xl"
            >
              {useTransparentHeader ? (
                <span>{siteBrand.header.logoText}</span>
              ) : (
                <img
                  src="/logo.png"
                  alt={siteBrand.header.logoText}
                  className="h-[40px] w-auto object-contain transition-all duration-300 md:h-[56px]"
                />
              )}
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {gnbLinks.map((item) => {
                if (item.cta) {
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`inline-flex h-11 min-w-[112px] items-center justify-center rounded-[10px] px-6 text-center text-[15px] font-bold leading-none tracking-[0.01em] transition-all duration-300 ${
                        useTransparentHeader
                          ? "border border-white/55 bg-white/10 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/20"
                          : "border border-[var(--header-cta-bg)] bg-gradient-to-b from-[var(--header-cta-bg)] to-[#001736] text-[var(--header-cta-text)] shadow-[0_10px_20px_-10px_rgba(0,30,69,0.5)] hover:-translate-y-0.5 hover:from-[var(--header-cta-hover)] hover:to-[#002960] hover:shadow-[0_15px_25px_-12px_rgba(0,30,69,0.7)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`text-[17px] font-semibold tracking-[0.01em] transition ${desktopLinkClassName}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={openMobileMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--header-search-border)] text-[var(--header-nav-link)] md:hidden"
              aria-label="모바일 메뉴 열기"
            >
              <Menu size={20} />
            </button>
          </div>
        </Container>
      </div>

      {mobileMenuMounted && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className={`absolute inset-0 bg-[var(--header-mobile-backdrop)] transition-opacity duration-300 ${
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobileMenu}
            aria-label="모바일 메뉴 닫기"
          />

          <aside
            className={`absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-[var(--header-mobile-surface)] shadow-2xl transition-transform duration-300 ease-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[var(--header-border)] p-4">
              <span className="text-lg font-black tracking-tight text-[var(--header-logo-color)]">
                <img src="/logo.png" alt={siteBrand.header.logoText} className="h-[36px] w-auto object-contain" />
              </span>
              <button
                onClick={closeMobileMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--header-search-border)] text-[var(--header-nav-link)]"
                aria-label="모바일 메뉴 닫기 버튼"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-4 py-4">
              <nav className="space-y-2">
                {gnbLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`block rounded-[10px] px-4 py-3 text-sm font-semibold ${
                      item.cta
                        ? "bg-[var(--header-cta-bg)] text-[var(--header-cta-text)]"
                        : "border border-[var(--header-search-border)] text-[var(--header-nav-link)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
