import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Loader2, Search } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { getInstallationCases, InstallationCase } from '../src/api/cmsApi';
import { stripInstallationCaseMetadata } from '../src/utils/installationCaseContent';

const getPreviewText = (item: InstallationCase) => {
  if (item.subtitle) return item.subtitle;

  const plainContent = stripInstallationCaseMetadata(item.content);
  if (!plainContent) return '현장 조건에 맞춘 구성과 운영 흐름을 담은 설치 사례입니다.';

  return plainContent
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
};

export const InstallationCasesGallery: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<InstallationCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter((item) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const bodyContent = stripInstallationCaseMetadata(item.content).toLowerCase();

    return (
      item.title.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
      bodyContent.includes(term)
    );
  });

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await getInstallationCases();
        const activeCases = data.filter((item) => item.is_active && item.image_url);
        setCases(activeCases);
      } catch (error) {
        console.error('Failed to load installation cases:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadCases();
  }, []);

  const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

  const getNavigation = (item: InstallationCase) => {
    if (item.link && isExternalLink(item.link)) {
      return {
        type: 'external' as const,
        href: item.link,
      };
    }

    if (item.id) {
      return {
        type: 'internal' as const,
        to: `/cases/${item.id}`,
      };
    }

    return null;
  };

  const renderCaseLink = (item: InstallationCase, content: React.ReactNode, className: string) => {
    const navigation = getNavigation(item);

    if (!navigation) {
      return (
        <div key={item.id || item.title} className={className}>
          {content}
        </div>
      );
    }

    if (navigation.type === 'external') {
      return (
        <a
          key={item.id || item.title}
          href={navigation.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {content}
        </a>
      );
    }

    return (
      <Link key={item.id || item.title} to={navigation.to} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#eef3f8_100%)] pb-20 pt-10">
      <Helmet>
        <title>휴먼파트너 설치사례 갤러리</title>
        <meta
          name="description"
          content="기업, 공공기관, 교육기관 등 다양한 업무 환경에 맞춘 휴먼파트너의 실제 설치 사례를 확인해보세요."
        />
      </Helmet>

      <Container>
        <section className="rounded-[32px] border border-slate-200/70 bg-white px-6 py-8 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.28)] md:px-10 md:py-12">
          <div className="max-w-3xl">
            <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-slate-900 md:text-[40px]">
              설치사례 갤러리
            </h1>
          </div>

          <div className="mt-8 flex max-w-xl items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-[#001e45] focus-within:ring-2 focus-within:ring-[#001e45]/10">
            <Search className="text-slate-400" size={18} />
            <input
              type="text"
              placeholder="원하시는 사례를 검색해 보세요. 예: 오피스, 공공기관"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-3 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#001e45]" size={40} />
          </div>
        ) : filteredCases.length > 0 ? (
          <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredCases.map((item, index) =>
              renderCaseLink(
                item,
                <article className="group h-full overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading={index < 8 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-[21px] font-bold tracking-[-0.02em] text-slate-900">
                        {item.title}
                      </h2>
                      <ArrowUpRight
                        size={18}
                        className="mt-1 shrink-0 text-[#001e45] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                    <p className="mt-3 line-clamp-2 text-[15px] leading-6 text-slate-600">{getPreviewText(item)}</p>
                  </div>
                </article>,
                'block h-full',
              ),
            )}
          </section>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white py-32 text-slate-500">
            <p>{searchTerm ? '검색 결과가 없습니다.' : '등록된 설치 사례가 없습니다.'}</p>
          </div>
        )}
      </Container>
    </main>
  );
};
