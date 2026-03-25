import React from 'react';
import { Laptop, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';

export const B2BCtas: React.FC = () => {
  return (
    <section className="py-8 md:py-12 bg-white relative z-10 -mt-8 md:-mt-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* CTA 1: PC/노트북 렌탈 */}
          <Link to="/products?category=PC/노트북" className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-brand-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Laptop size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">PC/노트북 렌탈 바로가기</h3>
              <p className="text-sm text-gray-500 mt-2 break-keep">최고 사양의 장비를 합리적인 가격에 대여하세요.</p>
            </div>
            <div className="flex items-center text-brand-600 font-semibold mt-4 text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all relative z-10">
              상품 보러가기 <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>

          {/* CTA 2: 기업 맞춤 대량 렌탈 상담 */}
          <Link to="/cs" className="group relative bg-[#001e45] rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">기업 맞춤 대량 렌탈 상담</h3>
              <p className="text-sm text-blue-100 mt-2 break-keep">10대 이상 대규모 도입 컨설팅 및 특별 할인 적용</p>
            </div>
            <div className="flex items-center text-white font-semibold mt-4 text-sm opacity-80 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10">
              1:1 전담 매니저 배정 <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>

          {/* CTA 3: 공공기관 우선구매 */}
          <Link to="/company" className="group relative bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-300 transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors">공공기관 우선구매 혜택</h3>
              <p className="text-sm text-gray-500 mt-2 break-keep">휴먼파트너는 인증받은 통합운영 <b>장애인 표준사업장</b>입니다.</p>
            </div>
            <div className="flex items-center text-slate-600 font-semibold mt-4 text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all relative z-10">
              우선구매제도 확인 <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>
        </div>
      </Container>
    </section>
  );
};