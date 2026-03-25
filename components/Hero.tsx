import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './ui/Container';
import { getHeroBanners, Banner } from '../src/api/cmsApi';

export const Hero: React.FC = () => {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Load banners from DB
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await getHeroBanners();
        setSlides(banners);
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Reversed from 8000ms back to 5000ms
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <section className="relative w-full h-[500px] md:h-[800px] bg-brand-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </section>
    );
  }

  if (slides.length === 0) {
    // If no banners from DB, display a placeholder to keep layout and prompt admin to add banners.
    return (
      <section className="relative w-full h-[500px] md:h-[800px] bg-brand-900 flex flex-col items-center justify-center">
        <h2 className="text-xl md:text-2xl text-white/50 mb-2">등록된 메인 배너가 없습니다</h2>
        <p className="text-white/30 text-sm">관리자 페이지(CMS)에서 [배너]를 추가해주세요.</p>
      </section>
    );
  }

  return (
    <section
      className="relative w-full h-[500px] md:h-[800px] bg-brand-900 overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const linkHref = slide.target_product_code ? `/p/${slide.target_product_code}` : slide.link || '/';
        const isExternal = linkHref.startsWith('http');

        const SlideContent = (
          <>
            {/* Background Image */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-[7000ms] group-hover/slide:scale-105"
              style={{ backgroundImage: `url(${slide.image_url})` }}
            >
              {/* Overlay gradient - Adjusted for better background visibility */}
              <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
            </div>

            {/* Content Area */}
            <Container className="relative h-full flex flex-col justify-center text-white z-20">
              <div className="max-w-4xl">
                {/* Brand Pill */}
                <div className={`inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-black/20 backdrop-blur-lg border border-white/10 text-[8px] md:text-[9px] font-medium text-brand-400 transition-all duration-1000 delay-300 transform uppercase tracking-[0.2em] mb-6 md:mb-8
                  ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_var(--tw-shadow-color)] shadow-brand-400 animate-pulse"></span>
                  {slide.brand_text || 'Premium Solution'}
                </div>

                {/* Main Title */}
                <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tighter text-white mb-6 md:mb-8 transition-all duration-1000 delay-500 transform drop-shadow-2xl
                  ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}>
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className={`text-sm md:text-base font-normal text-slate-100/80 leading-relaxed break-keep max-w-xl transition-all duration-1000 delay-700 transform drop-shadow-lg
                  ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}>
                  {slide.subtitle}
                </p>

                {/* Action - Button from rntech style but Blue instead of Orange */}
                <div className={`mt-10 md:mt-14 transition-all duration-1000 delay-1000 transform flex gap-4
                  ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}>
                  <div className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                    자세히 보기 <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Container>
          </>
        );

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out
              ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            `}
          >
            {isExternal ? (
              <a
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full relative group/slide cursor-pointer"
              >
                {SlideContent}
              </a>
            ) : (
              <Link
                to={linkHref}
                className="block w-full h-full relative group/slide cursor-pointer"
              >
                {SlideContent}
              </Link>
            )}
          </div>
        );
      })}

      {/* Navigation Arrows - Hidden on mobile, show on hover desktop */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md hidden md:flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md hidden md:flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      {/* Indicators - Premium Bar Style */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group relative py-4"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`h-1 transition-all duration-500 rounded-full
              ${index === currentSlide ? 'w-10 bg-brand-400' : 'w-6 bg-white/30 group-hover:bg-white/50'}
            `} />
          </button>
        ))}
      </div>
    </section>
  );
};