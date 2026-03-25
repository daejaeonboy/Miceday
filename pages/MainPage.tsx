import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { Container } from "../components/ui/Container";
import { MainVisualSlider } from "../components/MainVisualSlider";
import { MainCategoryTabs } from "../components/MainCategoryTabs";
import { CompanyIntroSection } from "../components/CompanyIntroSection";
import { InstallationCasesSection } from "../components/InstallationCasesSection";
import { ClientLogoMarqueeSection } from "../components/ClientLogoMarqueeSection";
import { PopupManager } from "../components/Layout/PopupManager";

interface OperationStep {
  step: string;
  title: string;
  description: string;
}

const operationSteps: OperationStep[] = [
  {
    step: "01",
    title: "상담",
    description: "규모를 파악 후 사용목적에 적합한 맞춤형 컨설팅 제공 및 견적서 발송",
  },
  {
    step: "02",
    title: "계약",
    description: "설치일 조율 협의 및 계약 진행",
  },
  {
    step: "03",
    title: "설치",
    description: "약속된 일정에 현장 설치, 세팅 및 꼼꼼한 테스트 진행",
  },
  {
    step: "04",
    title: "운영 지원 및 회수",
    description: "사후 유지 보수 및 AS, 기간 만료 후에 회수",
  },
];

export const MainPage: React.FC = () => {
  const [isContactVisible, setIsContactVisible] = React.useState(false);
  const contactSectionRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const target = contactSectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsContactVisible(entry.isIntersecting);
      },
      {
        threshold: 0.28,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="bg-white text-slate-900">
      <Helmet>
        <title>휴먼파트너 | B2B 렌탈 기업몰</title>
        <meta
          name="description"
          content="사무가구, IT 장비, 프로젝트 물품까지 기업 환경 맞춤형 B2B 렌탈 서비스를 제공합니다."
        />
      </Helmet>
      <PopupManager />

      <MainVisualSlider />
      <CompanyIntroSection />
      
      <MainCategoryTabs />
      
      <InstallationCasesSection />
      
      <ClientLogoMarqueeSection />

      <section className="bg-slate-50/50 py-16 md:py-24">
        <Container>
          <div className="mb-10 md:mb-14">
            <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-[#001E45]/80">OPERATION FLOW</p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-4xl">
              체계적인 렌탈 프로세스
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {operationSteps.map((item) => (
              <article
                key={item.step}
                className="group relative overflow-hidden rounded-[20px] border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#001E45]/20 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[12px] font-bold tracking-[0.1em] text-[#001E45]/50 transition-colors group-hover:text-[#001E45]">STEP {item.step}</p>
                  <ArrowRight size={16} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#001E45]" />
                </div>
                <h3 className="text-[19px] font-bold tracking-tight text-slate-800">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section ref={contactSectionRef} className="relative pb-24 pt-16 md:pb-32 md:pt-24">
        <Container>
          <div
            className={`relative overflow-hidden rounded-[32px] md:rounded-[40px] border border-white/10 bg-[#061026] px-8 py-16 text-white shadow-[0_40px_80px_-40px_rgba(3,7,20,0.8)] transition-all duration-[1000ms] ease-out md:px-20 md:py-24 ${
              isContactVisible
                ? "translate-y-0 scale-100 opacity-100 blur-0"
                : "translate-y-12 scale-[0.97] opacity-0 blur-[4px]"
            }`}
          >
            {/* Dynamic Glassmorphism Background Glows */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-[#1b4ed8]/10 blur-[100px] transition-transform duration-1000 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-[400px] w-[400px] rounded-full bg-[#3b82f6]/10 blur-[90px] transition-transform duration-1000 group-hover:scale-110" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

            {/* Content Wrapper */}
            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
              <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
                CONTACT US
              </span>
              
              <h2 className="mt-8 text-[26px] sm:text-[32px] font-extrabold leading-[1.35] tracking-tight md:text-[54px] md:leading-[1.15]">
                <span className="md:hidden">
                  성공적인 비즈니스를 위한<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">최적의 렌탈 솔루션을</span><br />
                  제안합니다.
                </span>
                <span className="hidden md:inline">
                  성공적인 비즈니스를 위한
                  <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">최적의 렌탈 솔루션을</span> 제안합니다.
                </span>
              </h2>
              
              <p className="mt-7 max-w-2xl text-[16px] font-medium leading-[1.8] text-white/60 md:text-[18px]">
                기업 규모와 환경에 맞는 맞춤형 컨설팅부터 설치, 유지관리, 회수까지
                <br className="hidden md:block" />
                휴먼파트너가 모든 과정을 책임집니다. 지금 바로 상담을 시작하세요.
              </p>
              
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
                <Link
                  to="/quote-request"
                  className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-white px-8 py-4 text-[16px] font-bold text-[#001E45] shadow-[0_4px_16px_rgba(255,255,255,0.15),0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25),0_0_0_1px_rgba(255,255,255,0.2)] md:text-[17px]"
                >
                  <span className="relative z-10">상담 접수하기</span>
                  <ArrowRight size={20} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
                  {/* Button Hover Glow Component */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-50 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
                
                <Link
                  to="/quote-request"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200/35 bg-gradient-to-b from-white/16 to-blue-400/10 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-100/60 hover:from-white/22 hover:to-blue-400/16 hover:text-white md:text-[16px]"
                >
                  제휴 및 대량 견적 문의
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};


