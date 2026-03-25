import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { getAllInstallationCases, InstallationCase } from '../src/api/cmsApi';
import { extractInstallationCaseContent } from '../src/utils/installationCaseContent';

const TEXT = {
  notFoundTitle: '게시글을 찾을 수 없습니다.',
  notFoundDescription: '삭제되었거나 비공개 처리된 설치사례입니다.',
  backToList: '목록으로 돌아가기',
  breadcrumbHome: '홈',
  breadcrumbCases: '고객사례',
  emptyContent: '상세 내용이 아직 등록되지 않았습니다.',
  otherCasesEyebrow: 'MORE CASES',
  otherCasesTitle: '다른 설치 사례도 함께 보세요',
  otherCasesDescription: '비슷한 규모의 프로젝트와 다양한 렌탈 구성을 한 번에 비교해볼 수 있습니다.',
  prevSlide: '이전 사례 보기',
  nextSlide: '다음 사례 보기',
  viewCase: '사례 보기',
  pageTitleSuffix: '휴먼파트너 설치 사례',
  pageDescriptionFallback: '휴먼파트너 맞춤 렌탈 솔루션 설치 사례입니다.',
};

export const InstallationCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<InstallationCase | null>(null);
  const [allCases, setAllCases] = useState<InstallationCase[]>([]);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getAllInstallationCases();
        const activeCases = data.filter((item) => item.is_active);
        const found = activeCases.find((item) => item.id === id) || null;
        setAllCases(activeCases);
        setPost(found);
      } catch (error) {
        console.error('Failed to load post detail:', error);
        setAllCases([]);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadPost();
    }
  }, [id]);

  const parsedContent = useMemo(() => extractInstallationCaseContent(post?.content), [post?.content]);

  const otherCases = useMemo(() => allCases.filter((item) => item.id !== post?.id).slice(0, 8), [allCases, post?.id]);

  const scrollOtherCases = (direction: 'prev' | 'next') => {
    const slider = sliderRef.current;
    if (!slider) return;

    const distance = Math.max(slider.clientWidth * 0.82, 260);
    slider.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] pb-20 pt-10">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] pb-20 pt-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">{TEXT.notFoundTitle}</h1>
        <p className="mt-4 text-slate-500">{TEXT.notFoundDescription}</p>
        <button
          onClick={() => navigate('/cases')}
          className="mt-8 rounded-lg bg-[#001e45] px-6 py-2 text-white transition hover:bg-[#152b66]"
        >
          {TEXT.backToList}
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20 pt-10">
      <Helmet>
        <title>{`${post.title} | ${TEXT.pageTitleSuffix}`}</title>
        <meta name="description" content={post.subtitle || TEXT.pageDescriptionFallback} />
      </Helmet>

      <Container className="max-w-[1000px]">
        <nav className="mb-6 flex items-center text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">{TEXT.breadcrumbHome}</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/cases" className="hover:text-slate-900">{TEXT.breadcrumbCases}</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="max-w-[200px] truncate font-medium text-slate-900 sm:max-w-[400px]">{post.title}</span>
        </nav>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-12">
          <div className="mb-10 border-b border-slate-100 pb-8 text-center">
            <h1 className="text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em] text-slate-900 md:text-[38px]">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="mt-4 text-base font-medium leading-7 text-slate-500 md:text-[17px]">
                {post.subtitle}
              </p>
            )}
            {post.created_at && (
              <p className="mt-6 text-sm text-slate-400">{new Date(post.created_at).toLocaleDateString('ko-KR')}</p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl bg-slate-50">
            <img src={post.image_url} alt={post.title} className="h-auto max-h-[700px] w-full rounded-2xl object-cover" />
          </div>

          <div className="mt-12 space-y-8">
            {parsedContent.blocks.length > 0 ? (
              parsedContent.blocks.map((block) => {
                if (block.type === 'heading') {
                  return (
                    <h2
                      key={block.id}
                      className="text-[24px] font-extrabold leading-[1.35] tracking-[-0.02em] text-slate-900 md:text-[30px]"
                    >
                      {block.text}
                    </h2>
                  );
                }

                if (block.type === 'image' && block.imageUrl) {
                  return (
                    <figure key={block.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm">
                      <img src={block.imageUrl} alt={block.caption || post.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      {block.caption && (
                        <figcaption className="border-t border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-500">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                return (
                  <p key={block.id} className="whitespace-pre-line text-[16px] leading-8 text-slate-700 md:text-[17px] md:leading-8">
                    {block.text}
                  </p>
                );
              })
            ) : parsedContent.bodyContent ? (
              <div
                className="prose prose-lg mx-auto max-w-none prose-slate prose-img:rounded-2xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: parsedContent.bodyContent }}
              />
            ) : (
              <div className="py-16 text-center text-lg text-slate-500">{TEXT.emptyContent}</div>
            )}
          </div>
        </div>

        {otherCases.length > 0 && (
          <section className="mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-[#001e45]/75">{TEXT.otherCasesEyebrow}</p>
                <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-slate-900 md:text-[30px]">
                  {TEXT.otherCasesTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 md:text-[15px]">{TEXT.otherCasesDescription}</p>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <button
                  type="button"
                  onClick={() => scrollOtherCases('prev')}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 transition hover:border-slate-900 hover:bg-slate-900"
                  aria-label={TEXT.prevSlide}
                >
                  <ChevronLeft size={18} className="text-slate-700 transition group-hover:text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollOtherCases('next')}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 transition hover:border-slate-900 hover:bg-slate-900"
                  aria-label={TEXT.nextSlide}
                >
                  <ChevronRight size={18} className="text-slate-700 transition group-hover:text-white" />
                </button>
              </div>
            </div>

            <div ref={sliderRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-5">
              {otherCases.map((item) => (
                <article
                  key={item.id}
                  className="group w-[82vw] shrink-0 snap-start overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 sm:w-[56vw] md:w-[340px]"
                >
                  <Link to={`/cases/${item.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-slate-900">{item.title}</h3>
                      {item.subtitle && <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{item.subtitle}</p>}
                      <div className="inline-flex items-center gap-1 text-sm font-semibold text-[#001e45]">
                        <span>{TEXT.viewCase}</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/cases"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            {TEXT.backToList}
          </Link>
        </div>
      </Container>
    </main>
  );
};
