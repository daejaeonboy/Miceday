import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '../components/ui/Container';

const policySections: Array<{ title: string; items: string[] }> = [
  {
    title: '1. 총칙',
    items: [
      '본 개인정보처리방침은 휴먼파트너가 운영하는 기업 소개 및 견적 문의 서비스 이용 과정에서 처리되는 개인정보 기준을 안내합니다.',
      '운영 주체, 연락처 또는 처리 목적 등 중요한 사항이 변경되는 경우 시행일 전에 웹사이트를 통해 고지합니다.',
    ],
  },
  {
    title: '2. 수집하는 개인정보 항목',
    items: [
      '견적/상담/문의 접수: 업체명, 담당자명, 연락처, 이메일, 설치 장소, 요청 내용',
      '서비스 이용기록: 접속 로그, IP 주소, 브라우저/기기 정보, 쿠키, 접속 일시',
      '문의 처리 또는 계약 협의 과정에서 필요한 경우 추가 정보를 요청할 수 있습니다.',
    ],
  },
  {
    title: '3. 개인정보의 수집 및 이용 목적',
    items: [
      '견적 문의 접수, 상담 진행, 서비스 제안 및 계약 협의',
      '고객 문의 대응, 요청 사항 확인, 민원 처리',
      '서비스 품질 개선, 접속 통계 분석, 장애 대응 및 보안 관리',
    ],
  },
  {
    title: '4. 개인정보의 보유 및 이용 기간',
    items: [
      '회사는 개인정보 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.',
      '다만 관련 법령에 따라 보관이 필요한 경우 해당 법정 보관기간 동안 보관합니다.',
      '소비자 불만 또는 분쟁 처리에 관한 기록: 3년',
      '계약 또는 청약철회 등에 관한 기록: 5년',
      '웹사이트 접속기록: 3개월',
    ],
  },
  {
    title: '5. 개인정보의 제3자 제공',
    items: [
      '회사는 원칙적으로 정보주체의 개인정보를 외부에 제공하지 않습니다.',
      '다만 견적 또는 납품 협의를 위해 필요한 경우, 법령에 근거가 있는 경우에 한하여 최소한의 범위로 제공할 수 있습니다.',
    ],
  },
  {
    title: '6. 개인정보 처리위탁',
    items: [
      '원활한 사이트 운영을 위해 일부 업무를 외부 서비스에 위탁할 수 있습니다.',
      '위탁 예시: 클라우드 인프라 운영, 이메일 발송, 문의 접수 시스템 운영',
      '회사는 수탁사가 개인정보를 안전하게 처리하도록 관리·감독합니다.',
    ],
  },
  {
    title: '7. 개인정보의 파기 절차 및 방법',
    items: [
      '보유기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.',
      '전자적 파일은 복구 또는 재생되지 않도록 기술적 방법으로 삭제합니다.',
      '출력물 등 종이 문서는 분쇄 또는 소각하여 파기합니다.',
    ],
  },
  {
    title: '8. 정보주체의 권리 및 행사 방법',
    items: [
      '이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.',
      '권리 행사는 고객센터 또는 개인정보 보호책임자 연락처를 통해 요청할 수 있습니다.',
    ],
  },
  {
    title: '9. 개인정보의 안전성 확보조치',
    items: [
      '개인정보 접근 권한 최소화 및 권한 관리',
      '접근 통제, 보안 점검, 로그 관리 등 기술적·관리적 보호조치',
      '개인정보 취급 인원에 대한 내부 관리 및 보안 교육',
    ],
  },
  {
    title: '10. 쿠키의 사용',
    items: [
      '회사는 이용자 편의 및 서비스 품질 개선을 위해 쿠키를 사용할 수 있습니다.',
      '이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나 일부 기능 이용이 제한될 수 있습니다.',
    ],
  },
  {
    title: '11. 개인정보 보호책임자',
    items: [
      '성명: 이기섭',
      '연락처: 010-4074-6967',
      '이메일: hm_solution@naver.com',
    ],
  },
  {
    title: '12. 고지의 의무',
    items: [
      '본 방침의 내용 추가, 삭제 및 수정이 있는 경우 시행일 최소 7일 전에 고지합니다.',
      '이용자 권리에 중대한 변경이 있는 경우 시행일 최소 30일 전에 고지합니다.',
    ],
  },
  {
    title: '부칙',
    items: ['본 개인정보처리방침은 2026년 3월 18일부터 시행합니다.'],
  },
];

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Helmet>
        <title>개인정보처리방침 - 휴먼파트너</title>
        <meta
          name="description"
          content="휴먼파트너 웹사이트의 개인정보처리방침입니다. 견적 문의 접수 시 수집 항목, 이용 목적, 보유 기간과 이용자 권리를 안내합니다."
        />
      </Helmet>

      <Container className="max-w-4xl py-20">
        <h1 className="mb-10 border-b pb-4 text-3xl font-bold text-gray-900">개인정보처리방침</h1>

        <div className="space-y-10 text-gray-700">
          {policySections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              <ol className="list-decimal space-y-2 pl-6 leading-relaxed marker:text-gray-500">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
};
