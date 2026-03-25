import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Container } from "./ui/Container";
import { getMainReviewCards, MainReviewCard } from "../src/api/cmsApi";

interface ReviewCardItem {
  id: string;
  badge: string;
  imageHeadline: string;
  reviewText: string;
  imageUrl: string;
}

interface RenderedReviewCard {
  key: string;
  item: ReviewCardItem;
}

const fallbackCases: ReviewCardItem[] = [
  {
    id: "main-review-fallback-1",
    badge: "스타트업",
    imageHeadline: "처음 맡은 전시회 준비도\n휴먼파트너로 쉽고 빠르게",
    reviewText:
      "이전 회사에서 이용해본 경험이 있어 급한 프로젝트에도 당황하지 않았습니다.\n\n상담 후 설치까지 빠르게 진행됐고 행사 종료 후 바로 회수되어 운영 부담이 줄었습니다.",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "main-review-fallback-2",
    badge: "교육기관",
    imageHeadline: "타이트한 일정에도\n정확하게 납품",
    reviewText:
      "동시다발 일정에도 필요한 사양과 수량을 정확히 맞춰 주셨습니다.\n\n설치/회수 일정이 명확해 담당자 커뮤니케이션도 매우 수월했습니다.",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "main-review-fallback-3",
    badge: "공공기관",
    imageHeadline: "보안과 일정이 중요한 현장도\n안정적으로 운영",
    reviewText:
      "보안 조건이 까다로운 현장이었는데도 설치부터 회수까지 문제 없이 진행됐습니다.\n\n이슈 대응 속도가 빨라 프로젝트를 안정적으로 마무리할 수 있었습니다.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  },
];

const mapCardToItem = (item: MainReviewCard, index: number): ReviewCardItem | null => {
  if (!item.image_url) return null;

  return {
    id: item.id || `main-review-${index}`,
    badge: item.title || "고객 후기",
    imageHeadline: item.subtitle || "휴먼파트너 메인 리뷰",
    reviewText: item.review_text || "메인 리뷰 본문이 아직 등록되지 않았습니다.",
    imageUrl: item.image_url,
  };
};

export const InstallationCasesSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<ReviewCardItem[]>([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [isMouseDragging, setIsMouseDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const settleTimeoutRef = useRef<number | null>(null);
  const isPointerDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDeltaXRef = useRef(0);
  const dragStartIndexRef = useRef<number | null>(null);

  const renderedCases = useMemo<RenderedReviewCard[]>(() => {
    if (cases.length <= 1) {
      return cases.map((item) => ({ key: item.id, item }));
    }

    const first = cases[0];
    const last = cases[cases.length - 1];

    return [
      { key: `review-clone-head-${last.id}`, item: last },
      ...cases.map((item) => ({ key: item.id, item })),
      { key: `review-clone-tail-${first.id}`, item: first },
    ];
  }, [cases]);

  const getSnapPoints = useCallback((slider: HTMLDivElement) => {
    const slides = Array.from(slider.querySelectorAll<HTMLElement>("[data-review-slide]"));
    const maxScroll = Math.max(slider.scrollWidth - slider.clientWidth, 0);

    return slides.map((slide) => {
      const centered = slide.offsetLeft - (slider.clientWidth - slide.offsetWidth) / 2;
      return Math.min(Math.max(centered, 0), maxScroll);
    });
  }, []);

  const getNearestSnapIndex = useCallback((points: number[], currentScroll: number) => {
    let activeIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    points.forEach((point, index) => {
      const distance = Math.abs(point - currentScroll);
      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = index;
      }
    });

    return activeIndex;
  }, []);

  const getRealIndexFromRenderedIndex = useCallback(
    (renderedIndex: number) => {
      if (cases.length <= 1) return 0;
      if (renderedIndex <= 0) return cases.length - 1;
      if (renderedIndex >= cases.length + 1) return 0;
      return renderedIndex - 1;
    },
    [cases.length],
  );

  const scrollToRenderedIndex = useCallback(
    (renderedIndex: number, behavior: ScrollBehavior = "smooth") => {
      const slider = sliderRef.current;
      if (!slider) return;

      const points = getSnapPoints(slider);
      if (points.length === 0) return;

      const safeIndex = Math.min(Math.max(renderedIndex, 0), points.length - 1);
      slider.scrollTo({ left: points[safeIndex], behavior });
      setCurrentCaseIndex(getRealIndexFromRenderedIndex(safeIndex));
    },
    [getRealIndexFromRenderedIndex, getSnapPoints],
  );

  const scrollToRealIndex = useCallback(
    (realIndex: number, behavior: ScrollBehavior = "smooth") => {
      if (cases.length === 0) return;

      const safeReal = ((realIndex % cases.length) + cases.length) % cases.length;
      const renderedIndex = cases.length > 1 ? safeReal + 1 : safeReal;
      scrollToRenderedIndex(renderedIndex, behavior);
    },
    [cases.length, scrollToRenderedIndex],
  );

  useEffect(() => {
    const loadCards = async () => {
      try {
        const cards = await getMainReviewCards();
        const mapped = cards.map(mapCardToItem).filter((item): item is ReviewCardItem => item !== null);
        const safeCases = mapped.length > 0 ? mapped : fallbackCases;
        setCases(safeCases);
        setCurrentCaseIndex(0);
      } catch (error) {
        console.error("Failed to load main review cards:", error);
        setCases(fallbackCases);
        setCurrentCaseIndex(0);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  useEffect(() => {
    if (cases.length === 0) return;

    const rafId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToRealIndex(0, "auto");
      });
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [cases.length, scrollToRealIndex]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const syncActiveSlide = () => {
      const points = getSnapPoints(slider);
      if (points.length === 0) return;

      const activeIndex = getNearestSnapIndex(points, slider.scrollLeft);
      setCurrentCaseIndex(getRealIndexFromRenderedIndex(activeIndex));

      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }

      settleTimeoutRef.current = window.setTimeout(() => {
        const refreshedPoints = getSnapPoints(slider);
        if (refreshedPoints.length === 0) return;

        const settledIndex = getNearestSnapIndex(refreshedPoints, slider.scrollLeft);

        if (cases.length > 1 && settledIndex === 0) {
          slider.scrollTo({ left: refreshedPoints[refreshedPoints.length - 2], behavior: "auto" });
          setCurrentCaseIndex(cases.length - 1);
          settleTimeoutRef.current = null;
          return;
        }

        if (cases.length > 1 && settledIndex === refreshedPoints.length - 1) {
          slider.scrollTo({ left: refreshedPoints[1], behavior: "auto" });
          setCurrentCaseIndex(0);
          settleTimeoutRef.current = null;
          return;
        }

        setCurrentCaseIndex(getRealIndexFromRenderedIndex(settledIndex));
        settleTimeoutRef.current = null;
      }, 120);
    };

    slider.addEventListener("scroll", syncActiveSlide, { passive: true });
    syncActiveSlide();

    return () => {
      slider.removeEventListener("scroll", syncActiveSlide);
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
        settleTimeoutRef.current = null;
      }
    };
  }, [cases.length, getNearestSnapIndex, getRealIndexFromRenderedIndex, getSnapPoints]);

  const finishMouseDrag = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider || !isPointerDraggingRef.current) return;

    const dragDeltaX = dragDeltaXRef.current;
    const dragThreshold = 4;

    isPointerDraggingRef.current = false;
    setIsMouseDragging(false);
    slider.style.scrollSnapType = "";

    if (pointerIdRef.current !== null && slider.hasPointerCapture(pointerIdRef.current)) {
      slider.releasePointerCapture(pointerIdRef.current);
    }
    pointerIdRef.current = null;

    const points = getSnapPoints(slider);
    if (points.length === 0) {
      dragDeltaXRef.current = 0;
      dragStartIndexRef.current = null;
      return;
    }

    const activeIndex = getNearestSnapIndex(points, slider.scrollLeft);
    const currentIndex = dragStartIndexRef.current ?? activeIndex;
    const lastIndex = points.length - 1;
    const lastRealIndex = Math.max(lastIndex - 1, 0);

    let targetIndex = activeIndex;
    if (Math.abs(dragDeltaX) >= dragThreshold) {
      targetIndex = dragDeltaX < 0 ? currentIndex + 1 : currentIndex - 1;

      if (cases.length > 1 && dragDeltaX < 0 && currentIndex === lastIndex) {
        targetIndex = 1;
      }

      if (cases.length > 1 && dragDeltaX > 0 && currentIndex === 0) {
        targetIndex = lastRealIndex;
      }

      targetIndex = Math.min(Math.max(targetIndex, 0), lastIndex);
    }

    slider.scrollTo({ left: points[targetIndex], behavior: "smooth" });
    dragDeltaXRef.current = 0;
    dragStartIndexRef.current = null;
  }, [cases.length, getNearestSnapIndex, getSnapPoints]);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    isPointerDraggingRef.current = true;
    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = slider.scrollLeft;
    dragDeltaXRef.current = 0;
    const points = getSnapPoints(slider);
    dragStartIndexRef.current = points.length > 0 ? getNearestSnapIndex(points, slider.scrollLeft) : null;
    setIsMouseDragging(true);

    slider.style.scrollSnapType = "none";
    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isPointerDraggingRef.current || event.pointerType !== "mouse") return;

    const slider = sliderRef.current;
    if (!slider) return;

    const delta = event.clientX - dragStartXRef.current;
    dragDeltaXRef.current = delta;
    slider.scrollLeft = dragStartScrollRef.current - delta;
  };

  const scrollByPage = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const snapPoints = getSnapPoints(slider);
    if (snapPoints.length === 0) return;

    const currentIndex = getNearestSnapIndex(snapPoints, slider.scrollLeft);
    const lastIndex = snapPoints.length - 1;
    const lastRealIndex = Math.max(lastIndex - 1, 0);

    let targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (cases.length > 1 && direction === "next" && currentIndex === lastIndex) {
      targetIndex = 1;
    }

    if (cases.length > 1 && direction === "prev" && currentIndex === 0) {
      targetIndex = lastRealIndex;
    }

    targetIndex = Math.min(Math.max(targetIndex, 0), lastIndex);

    scrollToRenderedIndex(targetIndex, "smooth");
  };

  if (loading) {
    return (
      <section className="border-t border-slate-100 bg-white py-16 md:py-24">
        <Container>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-[11px] font-bold tracking-[0.15em] text-[#001E45]/80">REVIEW</p>
              <h2 className="text-[26px] font-bold leading-[1.4] text-slate-900 md:text-[42px] md:leading-[1.25]">
                올인원 렌탈 솔루션을 경험한
                <br className="md:hidden" /> 고객의 소리
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={38} />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="overflow-hidden border-t border-slate-100 bg-white py-16 md:py-24">
      <Container>
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-[11px] font-bold tracking-[0.15em] text-[#001E45]/80">REVIEW</p>
            <h2 className="text-[26px] font-bold leading-[1.4] text-slate-900 md:text-[42px] md:leading-[1.25]">
              올인원 렌탈 솔루션을 경험한
              <br className="md:hidden" /> 고객의 소리
            </h2>
            <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600 md:text-[15px]">
              사무실 구성부터 국내외 행사 및 전시 프로젝트까지.
              <br />
              휴먼파트너에서 필요한 물품을 한 번에 렌탈해 소중한 시간과 비용을 절약할 수 있습니다.
            </p>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <p className="min-w-[74px] text-right text-sm font-semibold tracking-wide text-slate-500">
              <span className="text-base text-slate-900">{cases.length > 0 ? currentCaseIndex + 1 : 0}</span>
              <span className="mx-1 text-slate-300">/</span>
              <span>{cases.length}</span>
            </p>
            <button
              onClick={() => scrollByPage("prev")}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-slate-900 transition hover:bg-slate-900"
              aria-label="이전 리뷰 보기"
            >
              <ChevronLeft size={20} className="text-slate-900 transition group-hover:text-white" />
            </button>
            <button
              onClick={() => scrollByPage("next")}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-slate-900 transition hover:bg-slate-900"
              aria-label="다음 리뷰 보기"
            >
              <ChevronRight size={20} className="text-slate-900 transition group-hover:text-white" />
            </button>
          </div>
        </div>
      </Container>

      <div
        ref={sliderRef}
        className={`no-scrollbar flex gap-8 overflow-x-auto px-[7vw] pb-10 select-none xl:px-[calc((100vw-1120px)/2)] ${
          isMouseDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          scrollSnapType: isMouseDragging ? "none" : "x mandatory",
          touchAction: "pan-x pan-y", // Allow horizontal scrolling natively
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishMouseDrag}
        onPointerCancel={finishMouseDrag}
        onLostPointerCapture={finishMouseDrag}
      >
        {renderedCases.map(({ key, item }) => {
          const subtitleLines = (item.imageHeadline || "휴먼파트너 메인 리뷰")
            .split(/\\n|\n/)
            .map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ));

          return (
            <article
              key={key}
              data-review-slide
              className="group relative flex w-[90vw] max-w-[1240px] shrink-0 snap-center flex-col overflow-hidden rounded-[18px] border border-slate-100 shadow-sm transition-shadow hover:shadow-xl md:flex-row"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 md:w-1/2 md:aspect-auto md:rounded-l-lg">
                <img
                  src={item.imageUrl}
                  alt={item.badge}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="pointer-events-none absolute bottom-6 right-6 text-right md:bottom-10 md:right-10">
                  <h3 className="text-xl font-bold leading-snug tracking-tight text-white md:text-2xl">{subtitleLines}</h3>
                </div>
              </div>

              <div className="relative flex w-full flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
                <div className="absolute left-[-1.5rem] top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-[#de7b57] shadow-lg md:flex md:rounded-sm">
                  <svg width="16" height="14" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.89502 16L9.6133 0H4.49301L0 16H5.89502ZM16.2817 16L20 0H14.8797L10.3867 16H16.2817Z"
                      fill="white"
                    />
                  </svg>
                </div>

                <div className="mb-6 flex">
                  <span className="inline-block rounded-md bg-slate-50 px-3 py-1.5 text-[13px] font-bold tracking-tight text-slate-500 border border-slate-200/60">
                    {item.badge}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-[15px] font-medium leading-[1.7] text-slate-600 md:text-[16px]">
                  "{item.reviewText}"
                </p>

                <div className="absolute bottom-8 right-8 text-[#de7b57] opacity-20">
                  <svg
                    width="32"
                    height="26"
                    viewBox="0 0 20 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rotate-180"
                  >
                    <path
                      d="M5.89502 16L9.6133 0H4.49301L0 16H5.89502ZM16.2817 16L20 0H14.8797L10.3867 16H16.2817Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        {cases.map((item, index) => (
          <button
            key={`review-indicator-${item.id}-${index}`}
            type="button"
            onClick={() => scrollToRealIndex(index)}
            aria-label={`${index + 1}번째 리뷰 보기`}
            className={`h-2.5 rounded-full transition-all duration-200 ${
              currentCaseIndex === index ? "w-8 bg-slate-900" : "w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
