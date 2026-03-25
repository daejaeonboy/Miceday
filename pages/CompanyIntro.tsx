import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, ChevronDown, MapPin, MonitorSmartphone, Phone } from 'lucide-react';
import { Container } from '../components/ui/Container';

const NAVER_MAP_URL =
  'https://map.naver.com/p/search/%ED%9C%B4%EB%A8%BC%ED%8C%8C%ED%8A%B8%EB%84%88/place/1420776065?c=15.44,0,0,0,dh&placePath=/home&from=map&fromPanelNum=2&locale=ko&searchText=%ED%9C%B4%EB%A8%BC%ED%8C%8C%ED%8A%B8%EB%84%88';
const COMPANY_PHONE = '18001985';

type ServiceCardSegment = {
  text: string;
  highlight?: boolean;
};

type ServiceCard = {
  title: string;
  image: string;
  descriptionParts: ServiceCardSegment[];
  imagePosition?: string;
};

const serviceCards: ServiceCard[] = [
  {
    title: '기업 IT 인프라 렌탈',
    image: '/company/service-01.jpg',
    imagePosition: '78% center',
    descriptionParts: [
      { text: '초기 도입 비용 부담', highlight: true },
      { text: '은 줄이고 업무 효율은 높이세요. 사무기기, 가구 공급부터 체계적인 유지보수까지, 기업의 자산 관리 효율을 극대화합니다.' },
    ],
  },
  {
    title: '목적에 맞는 비즈니스 공간',
    image: '/company/service-02.png',
    descriptionParts: [
      { text: '기획부터 구현까지', highlight: true },
      { text: ' 책임집니다. 공간의 효율성을 극대화하는 전문가의 컨설팅으로 성공적인 비즈니스 이벤트를 완성합니다.' },
    ],
  },
  {
    title: '현장 운영 지원',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    descriptionParts: [
      { text: '철저한 서포트 시스템', highlight: true },
      { text: '을 경험하세요. 전문 인력의 밀착 케어를 통해 고객사는 비즈니스 핵심 가치에만 집중할 수 있는 환경을 만듭니다.' },
    ],
  },
];

const credibilityStats = [
  {
    value: 'B2B',
    label: '프로젝트 맞춤 대응',
    description: '공공기관, 관공서, 민간기업 등 다양한 운영 환경에 맞춤 컨설팅부터 설치까지 유연하게 대응합니다.',
  },
  {
    value: '1,000+',
    label: '누적 고객사',
    description: '공공(정부)기관, 관공서, 다양한 규모의 기업이 휴먼파트너의 맞춤형 렌탈 서비스를 이용 중입니다.',
  },
  {
    value: '99%',
    label: '유지보수 만족도',
    description: '사후 대응 품질과 유지관리 안정성을 직관적으로 전달하는 핵심 신뢰 지표입니다.',
  },
];

export const CompanyIntro: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white selection:bg-[#001e45] selection:text-white"
      style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      <Helmet>
        <title>기업소개 | 휴먼파트너</title>
        <meta
          name="description"
          content="휴먼파트너의 B2B 맞춤 렌탈 서비스와 운영 방식, 제공 서비스 분야, 오시는 길을 안내합니다."
        />
      </Helmet>

      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.55; transform: translateY(5px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,18,46,0.95)_0%,rgba(1,12,34,0.84)_46%,rgba(0,7,22,0.96)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.22)_100%)]" />
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80"
          alt="휴먼파트너 기업 소개"
          className="absolute inset-0 h-full w-full object-cover opacity-48"
        />

        <Container className="relative z-20 flex flex-col items-center px-4 py-20 text-center">
          <span className="animate-on-scroll inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-white/85 backdrop-blur-md md:text-sm">
            PREMIUM B2B RENTAL SERVICE
          </span>
          <h1 className="animate-on-scroll mt-10 break-keep text-[40px] font-bold leading-[1.16] tracking-[-0.04em] text-white md:text-[78px]">
            기업 환경에 맞는
            <br />
            렌탈 솔루션을 제안합니다
          </h1>
          <p className="animate-on-scroll mt-8 max-w-3xl break-keep text-[18px] leading-[1.75] text-slate-200 md:text-[22px] md:leading-[1.65]">
            공공기관, 관공서, 민간기업의 다양한 운영 환경에 맞춘 기획과 실행으로
            <br className="hidden md:block" />
            안정적인 업무 공간과 현장 운영을 함께 만듭니다.
          </p>
        </Container>

        <div className="absolute inset-x-0 bottom-20 z-20 flex animate-pulse-slow flex-col items-center justify-center opacity-80 md:bottom-24">
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/80">SCROLL DOWN</span>
          <ChevronDown size={22} strokeWidth={1.5} className="text-white/80" />
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="animate-on-scroll">
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.2em] text-[#001e45]">ABOUT HUMAN PARTNER</h2>
              <h3 className="break-keep text-[30px] font-bold leading-[1.35] tracking-[-0.03em] text-slate-900 md:text-[52px]">
                10년의 운영 경험이
                <br />
                더 나은 결과를 만듭니다
              </h3>
              <div className="mb-8 mt-8 h-1 w-16 bg-[#001e45]" />

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#001e45] text-white">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-[17px] font-bold text-slate-800">현장 중심의 빠른 실행과 유연한 대응</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#001e45] text-white">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-[17px] font-bold text-slate-800">체계적인 공급, 설치, 유지관리 프로세스</span>
                </div>
              </div>

              <div className="mt-10 space-y-6 text-[15px] leading-8 text-slate-600 md:text-[17px]">
                <p>
                  휴먼파트너는 단순 제품 공급을 넘어 공간, 일정, 운영 목적까지 함께 검토하는 B2B 맞춤 렌탈 파트너입니다.
                </p>
                <p>
                  기업 이전, 사무공간 구축, 행사장 세팅, 공공기관 프로젝트 등 다양한 현장에서 쌓은 경험을 바탕으로
                  목적에 맞는 제안과 안정적인 운영 지원을 제공합니다.
                </p>
              </div>
            </div>

            <div className="animate-on-scroll overflow-hidden rounded-[32px] shadow-[0_28px_80px_-40px_rgba(15,23,42,0.45)]">
              <img
                src="/company/abouthuman.png"
                alt="휴먼파트너 팀 협업 현장"
                className="aspect-[4/5] w-full object-cover md:aspect-[4/3]"
              />
            </div>
          </div>

          <div className="mt-12 border-y border-slate-200 md:mt-14">
            <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              {credibilityStats.map((stat) => (
                <article key={stat.label} className="animate-on-scroll py-7 pr-0 md:px-8 md:py-9 first:md:pl-0 last:md:pr-0">
                  <p className="text-[42px] font-bold leading-none tracking-[-0.06em] text-[#001e45] md:text-[54px]">
                    {stat.value}
                  </p>
                  <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#001e45]/68">{stat.label}</p>
                  <p className="mt-3 max-w-[24ch] break-keep text-[14px] leading-6 text-slate-600 md:text-[15px]">{stat.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-24 md:py-32">
        <Container>
          <div className="mb-12 text-center md:mb-16">
            <h2 className="animate-on-scroll mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[#001e45] md:mb-4 md:text-[13px] md:tracking-[0.2em]">
              OUR SERVICES
            </h2>
            <h3 className="animate-on-scroll break-keep text-[30px] font-bold leading-[1.28] tracking-[-0.02em] text-slate-900 md:text-5xl md:leading-[1.3]">
              제공 서비스 분야
            </h3>
            <p className="animate-on-scroll mx-auto mt-5 max-w-2xl break-keep text-[15px] font-medium leading-7 text-slate-500">
              휴먼파트너는 아래 3가지 핵심 축을 완성도 높게 결합하여 최고의 시너지를 창출합니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-7">
            {serviceCards.map((service, index) => (
              <article
                key={service.title}
                className="animate-on-scroll group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_26px_60px_-46px_rgba(15,23,42,0.42)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_34px_80px_-50px_rgba(15,23,42,0.52)]"
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/4.2] overflow-hidden bg-slate-200">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={service.imagePosition ? { objectPosition: service.imagePosition } : undefined}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.18)_100%)]" />
                </div>

                <div className="border-t border-slate-100 bg-white px-6 py-7 md:px-7 md:py-8">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#001e45]">
                      Service {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                  </div>
                  <h4 className="mt-5 text-[24px] font-bold tracking-[-0.02em] text-slate-900">{service.title}</h4>
                  <p className="mt-4 break-keep text-[15px] leading-[1.68] text-slate-600">
                    {service.descriptionParts.map((part, partIndex) => (
                      <React.Fragment key={`${service.title}-${partIndex}`}>
                        {part.highlight ? (
                          <span className="font-extrabold text-[#001e45]">{part.text}</span>
                        ) : (
                          <span>{part.text}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="mb-10 text-center md:mb-12">
            <h2 className="animate-on-scroll mb-4 text-[13px] font-bold uppercase tracking-[0.2em] text-[#001e45]">LOCATION & CONTACT</h2>
            <h3 className="animate-on-scroll text-3xl font-bold text-slate-900 md:text-5xl">오시는 길</h3>
          </div>

          <div className="animate-on-scroll space-y-6">
            <div className="md:hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.32)]">
              <div className="relative min-h-[320px] overflow-hidden rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#edf2f7_100%)]">
                <svg viewBox="0 0 360 320" className="absolute inset-0 h-full w-full text-slate-300" preserveAspectRatio="none" aria-hidden="true">
                  <rect width="360" height="320" fill="url(#mobileMapBg)" />
                  <path d="M-20 92 L188 92" stroke="currentColor" strokeWidth="16" strokeLinecap="round" opacity="0.92" />
                  <path d="M96 -20 L96 340" stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity="0.86" />
                  <path d="M214 -20 L214 340" stroke="currentColor" strokeWidth="10" strokeLinecap="round" opacity="0.74" />
                  <path d="M244 28 L388 28" stroke="currentColor" strokeWidth="12" strokeLinecap="round" opacity="0.76" />
                  <path d="M170 198 L388 198" stroke="currentColor" strokeWidth="12" strokeLinecap="round" opacity="0.78" />
                  <path d="M-10 244 L174 244" stroke="currentColor" strokeWidth="10" strokeLinecap="round" opacity="0.76" />
                  <path d="M56 118 L192 254" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.62" />
                  <path d="M230 108 L336 214" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.58" />
                  <rect x="122" y="118" width="54" height="40" rx="8" fill="#dbe2ea" opacity="0.82" />
                  <rect x="226" y="84" width="68" height="56" rx="10" fill="#dfe6ed" opacity="0.76" />
                  <rect x="236" y="212" width="82" height="44" rx="10" fill="#dfe6ed" opacity="0.8" />
                  <rect x="126" y="210" width="62" height="42" rx="10" fill="#d8e0e8" opacity="0.8" />
                  <defs>
                    <linearGradient id="mobileMapBg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#edf2f7" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute left-4 top-4 rounded-2xl border border-white/80 bg-white/88 px-3.5 py-2.5 backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#001e45]/72">Static Map</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">대전 대덕구 대화로106번길 66</p>
                </div>

                <div className="absolute left-1/2 top-[52%] z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative flex flex-col items-center">
                    <div className="rounded-full bg-[#ef6b57] px-3 py-1.5 text-xs font-bold text-white shadow-[0_12px_30px_-12px_rgba(239,107,87,0.75)]">
                      휴먼파트너
                    </div>
                    <div className="relative mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#ef6b57] text-white shadow-[0_18px_34px_-14px_rgba(239,107,87,0.72)]">
                      <MapPin size={20} strokeWidth={2.2} />
                      <div className="absolute -bottom-1.5 h-4 w-4 rotate-45 rounded-[3px] bg-[#ef6b57]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <a
                  href={NAVER_MAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#001e45] px-4 py-3 text-sm font-semibold text-white"
                >
                  <MapPin size={16} />
                  길찾기
                </a>
                <a
                  href={`tel:${COMPANY_PHONE}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <Phone size={16} />
                  전화 문의
                </a>
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.4)] md:block">
              <iframe
                src={NAVER_MAP_URL}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '540px' }}
                allowFullScreen
                loading="lazy"
                title="휴먼파트너 위치 지도"
              />
            </div>

            <div className="grid gap-5 border-t border-slate-200 pt-5 md:grid-cols-3 md:gap-8 md:pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#001e45]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">위치 안내</h4>
                  <p className="mt-2 leading-7 text-slate-600">대전광역시 대덕구 대화로106번길 66 펜타플렉스 705호</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#001e45]">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">전화</h4>
                  <a href={`tel:${COMPANY_PHONE}`} className="mt-1 inline-block text-2xl font-bold tracking-[-0.03em] text-[#001e45] transition-colors hover:text-[#153a82]">
                    1800-1985
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#001e45]">
                  <MonitorSmartphone size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">상담 안내</h4>
                  <p className="mt-2 leading-7 text-slate-600">평일 09:00 - 18:00 / 점심 12:00 - 13:00</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
