import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Container } from './ui/Container';
import { Banner, getHeroBanners } from '../src/api/cmsApi';

interface VisualSlide {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    link: string;
    buttonText: string;
    brandText: string;
}

const fallbackSlides: VisualSlide[] = [
    {
        id: 'fallback-1',
        title: 'B2B Rental Platform For Workplace',
        subtitle: '기업 운영에 필요한 가구와 IT 장비를 빠르게 구성하고 설치합니다.',
        imageUrl:
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1900&q=80',
        link: '/products',
        buttonText: '상품 보기',
        brandText: 'HUMAN PARTNER',
    },
    {
        id: 'fallback-2',
        title: 'Corporate Project Setup In One Place',
        subtitle: '상담부터 견적, 설치, 운영까지 단일 창구로 진행하세요.',
        imageUrl:
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1900&q=80',
        link: '/cs',
        buttonText: '기업 제휴 문의',
        brandText: 'ENTERPRISE RENTAL',
    },
    {
        id: 'fallback-3',
        title: 'Fast Delivery. Stable Operation.',
        subtitle: '프로젝트 일정에 맞춰 설치와 운영 지원을 제공합니다.',
        imageUrl:
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1900&q=80',
        link: '/cs',
        buttonText: '상담 접수',
        brandText: 'B2B SOLUTION',
    },
];

const mapBannerToSlide = (banner: Banner, index: number): VisualSlide | null => {
    if (!banner.image_url) return null;

    const link = banner.target_product_code
        ? `/p/${banner.target_product_code}`
        : banner.link || '/';

    return {
        id: banner.id || `hero-${index}`,
        title: banner.title || 'HUMAN PARTNER',
        subtitle: banner.subtitle || '',
        imageUrl: banner.image_url,
        link,
        buttonText: banner.button_text || '자세히 보기',
        brandText: banner.brand_text || 'HUMAN PARTNER',
    };
};

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

export const MainVisualSlider: React.FC = () => {
    const [slides, setSlides] = useState<VisualSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    // Touch swipe state
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goNext();
        } else if (isRightSwipe) {
            goPrev();
        }
    };

    useEffect(() => {
        const loadSlides = async () => {
            try {
                const banners = await getHeroBanners();
                const mappedSlides = banners
                    .map(mapBannerToSlide)
                    .filter((item): item is VisualSlide => item !== null);
                setSlides(mappedSlides.length > 0 ? mappedSlides : fallbackSlides);
            } catch (error) {
                console.error('Failed to load main visual slides:', error);
                setSlides(fallbackSlides);
            } finally {
                setLoading(false);
            }
        };
        loadSlides();
    }, []);

    const slideCount = slides.length;

    useEffect(() => {
        if (slideCount <= 1 || paused) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slideCount);
        }, 5000);
        return () => clearInterval(timer);
    }, [paused, slideCount]);

    const goPrev = () => {
        if (slideCount <= 1) return;
        setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
    };

    const goNext = () => {
        if (slideCount <= 1) return;
        setActiveIndex((prev) => (prev + 1) % slideCount);
    };

    const safeIndex = useMemo(() => {
        if (slideCount === 0) return 0;
        return Math.min(activeIndex, slideCount - 1);
    }, [activeIndex, slideCount]);

    if (loading) {
        return (
            <section className="relative h-[500px] bg-slate-900 md:h-[72vh] lg:h-[78vh]">
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={38} />
                </div>
            </section>
        );
    }

    return (
        <section
            className="relative h-[500px] overflow-hidden bg-slate-900 md:h-[72vh] lg:h-[88vh]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {slides.map((slide, index) => {
                const visible = safeIndex === index;
                const overlayContent = (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out"
                            style={{
                                backgroundImage: `url(${slide.imageUrl})`,
                                transform: visible ? 'scale(1.04)' : 'scale(1)',
                            }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.5)_42%,rgba(0,0,0,0.32)_100%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.28)_100%)]" />
                        <Container className="relative z-10 flex h-full items-center">
                            <div className="max-w-3xl text-white">
                                <p className="inline-flex rounded-full border border-white/20 bg-black/30 px-2.5 py-1 md:px-3 md:py-1 text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-white/90">
                                    {slide.brandText}
                                </p>
                                <h1 className="mt-3 md:mt-5 whitespace-pre-wrap break-keep text-2xl sm:text-3xl font-extrabold leading-[1.3] tracking-tight md:text-6xl md:leading-[1.12]">
                                    {slide.title}
                                </h1>
                                <p className="mt-3 md:mt-5 max-w-2xl whitespace-pre-wrap break-keep text-[14px] sm:text-base font-medium leading-relaxed text-white/80 md:text-lg">
                                    {slide.subtitle}
                                </p>
                                <div className="mt-6 md:mt-8">
                                    <span className="inline-flex rounded-lg md:rounded-xl bg-white px-4 py-2.5 md:px-6 md:py-3.5 text-sm md:text-[15px] font-bold text-[#001E45] shadow-lg transition-transform hover:scale-105">
                                        {slide.buttonText}
                                    </span>
                                </div>
                            </div>
                        </Container>
                    </>
                );

                const baseClass = `absolute inset-0 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`;

                if (isExternalLink(slide.link)) {
                    return (
                        <a
                            key={slide.id}
                            href={slide.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={baseClass}
                        >
                            {overlayContent}
                        </a>
                    );
                }

                return (
                    <Link key={slide.id} to={slide.link} className={baseClass}>
                        {overlayContent}
                    </Link>
                );
            })}

            {slideCount > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white backdrop-blur hover:bg-black/45 md:flex"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/30 text-white backdrop-blur hover:bg-black/45 md:flex"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => setActiveIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${safeIndex === index ? 'w-8 bg-[#001e45]' : 'w-2 bg-white/60 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};
