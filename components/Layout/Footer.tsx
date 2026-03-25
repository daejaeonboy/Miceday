import React, { useEffect, useState } from "react";
import { ArrowUp, FileText, MonitorPlay } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Container } from "../ui/Container";
import { siteBrand } from "../../src/config/siteBrand";

type FooterLink = {
  label: string;
  to?: string;
};

const footerColumns: FooterLink[][] = [
  [
    { label: "\uD648", to: "/" },
    { label: "\uC774\uC6A9\uC57D\uAD00", to: "/terms" },
    { label: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68", to: "/privacy" },
    { label: "\uACE0\uAC1D\uC13C\uD130", to: "/cs" },
  ],
  [
    { label: "\uD68C\uC0AC\uC18C\uAC1C", to: "/company" },
    { label: "\uC81C\uD488\uC548\uB0B4", to: "/products" },
    { label: "\uACE0\uAC1D\uC0AC\uB840", to: "/cases" },
    { label: "\uC0C1\uB2F4\uBB38\uC758", to: "/quote-request" },
  ],
];

const labels = {
  homeAria: "\uD734\uBA3C\uD30C\uD2B8\uB108 \uD648\uC73C\uB85C \uC774\uB3D9",
  kakao: "\uCE74\uCE74\uC624 \uC0C1\uB2F4",
  phone: "\uC804\uD654 \uBB38\uC758",
  mail: "\uBA54\uC77C \uBB38\uC758",
  remote: "\uC628\uB77C\uC778 \uC6D0\uACA9\uC0C1\uB2F4",
  remoteAria: "\uC628\uB77C\uC778 \uC6D0\uACA9\uC0C1\uB2F4 \uC5F4\uAE30",
  consult: "\uACAC\uC801\uBB38\uC758",
  consultAria: "\uACAC\uC801\uBB38\uC758 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9",
};

export function Footer() {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentYear = new Date().getFullYear();
  const footer = siteBrand.footer;
  const hideFloatingConsultButtons = location.pathname === "/quote-request";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-slate-200 bg-[#f7f8fb] pb-20 text-slate-800 md:pb-10">
      <Container className="py-8 md:py-9">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <Link
            to="/"
            aria-label={labels.homeAria}
            className="inline-block leading-none text-[48px] md:text-[64px]"
            style={{ fontFamily: '"Pacifico", cursive' }}
          >
            H.
          </Link>

          <div className="grid w-full max-w-[980px] grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-3 md:gap-x-16">
            {footerColumns.map((column, columnIndex) => (
              <ul key={`footer-column-${columnIndex}`} className="space-y-2.5 text-[15px] font-medium text-slate-800">
                {column.map((item) => (
                  <li key={`${item.label}-${item.to}`}>
                    <Link to={item.to || "/"} className="transition-colors hover:text-[#001e45]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

            <ul className="col-span-2 space-y-2.5 text-[15px] font-medium text-slate-800 md:col-span-1">
              <li>
                <a
                  href={footer.kakaoChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition-colors hover:text-[#001e45]"
                >
                  {labels.kakao}
                </a>
              </li>
              <li>
                <a
                  href="tel:18001985"
                  className="flex flex-col items-start gap-0.5 transition-colors hover:text-[#001e45] md:flex-row md:items-center md:gap-2"
                >
                  <span className="text-[13px] font-semibold text-slate-600 md:text-[15px] md:text-slate-800">{labels.phone}</span>
                  <span className="text-[15px] font-semibold text-slate-800">1800-1985</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hm_solution@naver.com"
                  className="flex flex-col items-start gap-0.5 transition-colors hover:text-[#001e45] md:flex-row md:items-center md:gap-2"
                >
                  <span className="text-[13px] font-semibold text-slate-600 md:text-[15px] md:text-slate-800">{labels.mail}</span>
                  <span className="break-all text-[14px] font-semibold text-slate-800 md:break-normal">hm_solution@naver.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-dashed border-slate-300 pt-4 text-xs leading-relaxed text-slate-600">
          <p>{footer.companyInfoLines.join(" | ")}</p>
          <p className="mt-1">Copyright {currentYear}. {footer.copyrightOwner}. All rights reserved.</p>
        </div>
      </Container>

      {!hideFloatingConsultButtons && (
        <>
          <a
            href="https://367.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="group fixed bottom-8 left-1/2 z-[60] hidden w-[calc(100%-2rem)] max-w-[340px] -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-[#4d6f9f] bg-[#001e45] px-5 py-3.5 text-[14px] font-semibold tracking-[0.01em] text-white transition-all duration-300 hover:-translate-x-1/2 hover:-translate-y-1 hover:border-[#6f8cb0] hover:bg-[#03285d] lg:inline-flex"
            aria-label={labels.remoteAria}
          >
            <MonitorPlay size={16} className="transition-transform duration-300 group-hover:scale-105" />
            <span>{labels.remote}</span>
          </a>

          <Link
            to="/quote-request"
            className="group fixed bottom-8 left-1/2 z-[60] inline-flex w-[calc(100%-2rem)] max-w-[188px] -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-[#4d6f9f] bg-[#001e45] px-3.5 py-3 text-[13px] font-semibold tracking-[0.01em] text-white transition-all duration-300 hover:-translate-x-1/2 hover:-translate-y-1 hover:border-[#6f8cb0] hover:bg-[#03285d] lg:hidden"
            aria-label={labels.consultAria}
          >
            <FileText size={16} className="transition-transform duration-300 group-hover:scale-105" />
            <span>{labels.consult}</span>
          </Link>
        </>
      )}

      <div className="fixed bottom-[100px] right-4 z-[60] flex flex-col gap-3 md:bottom-12 md:right-8">
        <a
          href={footer.kakaoChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#fde500] shadow-[0_8px_20px_-8px_rgba(2,6,23,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_24px_-12px_rgba(253,229,0,0.78)] md:h-14 md:w-14"
          aria-label={footer.kakaoButtonAriaLabel}
        >
          <img
            src={footer.kakaoImagePath}
            alt={footer.kakaoButtonAriaLabel}
            className="h-[65%] w-[65%] object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </a>

        <button
          onClick={scrollToTop}
          className={`group flex h-[48px] w-[48px] items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-[0_8px_20px_-8px_rgba(2,6,23,0.35)] backdrop-blur-sm transition-all duration-500 hover:border-[#001e45] hover:bg-[#001e45] hover:text-white hover:shadow-[0_18px_24px_-12px_rgba(0,30,69,0.5)] md:h-[52px] md:w-[52px] ${
            showScrollTop
              ? "translate-y-0 scale-100 opacity-100 blur-0"
              : "pointer-events-none translate-y-4 scale-90 opacity-0 blur-[2px]"
          }`}
          aria-label={footer.scrollTopAriaLabel}
        >
          <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}
