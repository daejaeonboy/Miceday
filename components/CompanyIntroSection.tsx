import React from "react";
import {
  ArrowLeftRight,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  Package2,
  Shapes,
  ShieldCheck,
} from "lucide-react";
import { Container } from "./ui/Container";

interface IntroFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const introFeatures: IntroFeature[] = [
  {
    title: "기업렌탈",
    description: "대기업부터 1인\n스타트업 기업렌탈",
    icon: <Building2 size={36} strokeWidth={1.8} />,
  },
  {
    title: "장기렌탈",
    description: "1년 이상\n장기렌탈 가능",
    icon: <CalendarDays size={36} strokeWidth={1.8} />,
  },
  {
    title: "단기렌탈",
    description: "1일부터 필요한\n기간만큼 렌탈",
    icon: <Clock3 size={36} strokeWidth={1.8} />,
  },
  {
    title: "A/S 안심케어",
    description: "렌탈 기간 내 무상\nA/S 및 원격 지원",
    icon: <ShieldCheck size={36} strokeWidth={1.8} />,
  },
  {
    title: "대량렌탈",
    description: "동일기종 업계 최고\n수준 대량렌탈",
    icon: <Boxes size={36} strokeWidth={1.8} />,
  },
  {
    title: "소량렌탈",
    description: "복합기 렌탈 1대부터\n필요한 수량만 렌탈",
    icon: <Package2 size={36} strokeWidth={1.8} />,
  },
  {
    title: "다양한 기종",
    description: "필요한 목적에 따라\n맞춤형 렌탈가능",
    icon: <Shapes size={36} strokeWidth={1.8} />,
  },
  {
    title: "원스탑 렌탈",
    description: "컴퓨터부터\n사무가구까지\n한번에 렌탈",
    icon: <BriefcaseBusiness size={36} strokeWidth={1.8} />,
  },
];

export const CompanyIntroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-[#f8fbff] to-[#f1f5fb] py-10 md:py-24">
      <Container>
        <div className="max-w-5xl text-center md:text-left">
          <p className="mb-4 text-[11px] font-bold tracking-[0.15em] text-[#001E45]/80">COMPANY & VISION</p>
          <h2 className="text-[26px] font-bold leading-[1.4] text-slate-900 md:text-[42px] md:leading-[1.25]">
            <span className="md:hidden">
              (주)휴먼파트너는<br />렌탈전문가로 구성된<br /><span className="text-[#001E45]">종합렌탈기업 입니다.</span>
            </span>
            <span className="hidden md:inline">
              (주)휴먼파트너는 렌탈전문가로 구성된 <span className="text-[#001E45]">종합렌탈기업 입니다.</span>
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-[1.8] text-slate-600 md:mx-0 md:max-w-none md:text-[17px]">
            휴먼파트너는 20년 경력의 종합렌탈 운영 노하우를 바탕으로, 정부기관부터 대기업, 
            <br className="hidden lg:block" />
            1인 스타트업까지 다양한 규모의 기업에 맞춤형 렌탈 서비스를 제공합니다.
            <br className="hidden lg:block" />
            전산장비, 사무가구, 행사용품을 합리적인 비용과 체계적인 시스템으로 공급합니다.
          </p>
        </div>

        <div className="mt-12 rounded-lg border border-slate-200/80 bg-slate-200/80 shadow-[0_24px_50px_-38px_rgba(15,23,42,0.45)]">
          <div className="grid grid-cols-2 gap-[1px] md:grid-cols-4">
            {introFeatures.map((item) => (
              <article
                key={item.title}
                className="group relative z-0 flex min-h-[200px] flex-col items-center justify-center overflow-hidden bg-white/95 px-4 py-8 text-center transition-all duration-500 hover:z-10 hover:-translate-y-1 hover:bg-slate-100/50 md:min-h-[236px] md:px-7"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full text-slate-400 transition-all duration-500 group-hover:bg-blue-50 group-hover:text-[#001E45] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.35)]">
                  {item.icon}
                </span>
                <h3 className="mt-5 text-[18px] font-bold tracking-tight text-slate-800 md:text-[22px]">
                  {item.title}
                </h3>
                <p className="mt-3 whitespace-pre-line text-[14px] font-medium leading-[1.6] text-slate-500">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
