import React from 'react';
import { Seo } from '../components/seo/Seo';
import { Container } from '../components/ui/Container';
import { NOINDEX_ROBOTS } from '../src/seo';

export const BlankPage: React.FC = () => {
  return (
    <>
      <Seo
        title="페이지 준비중 | 행사어때"
        description="행사어때의 신규 페이지 준비중입니다."
        canonical="/blank"
        robots={NOINDEX_ROBOTS}
      />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <Container>
          <div className="text-center py-20 px-6 max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">BLANK</h1>
            <p className="text-gray-500">페이지 준비중입니다.</p>
          </div>
        </Container>
      </div>
    </>
  );
};
