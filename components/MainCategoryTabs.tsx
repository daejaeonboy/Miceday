import React from "react";
import { Link } from "react-router-dom";
import {
  Armchair,
  LayoutGrid,
  Monitor,
  PartyPopper,
  Printer,
  Tv,
} from "lucide-react";
import { Container } from "./ui/Container";

interface CategoryTabItem {
  name: string;
  to: string;
  icon: React.ReactNode;
}

const createCategoryLink = (category?: string, title?: string) => {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (title) {
    params.set("title", title);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
};

const categoryTabs: CategoryTabItem[] = [
  {
    name: "전체",
    to: createCategoryLink(undefined, "전체"),
    icon: <LayoutGrid size={26} strokeWidth={1.6} />,
  },
  {
    name: "IT장비",
    to: createCategoryLink("IT장비", "IT장비"),
    icon: <Monitor size={26} strokeWidth={1.6} />,
  },
  {
    name: "사무기기",
    to: createCategoryLink("사무기기", "사무기기"),
    icon: <Printer size={26} strokeWidth={1.6} />,
  },
  {
    name: "사무가구",
    to: createCategoryLink("사무가구", "사무가구"),
    icon: <Armchair size={26} strokeWidth={1.6} />,
  },
  {
    name: "가전제품",
    to: createCategoryLink("가전제품", "가전제품"),
    icon: <Tv size={26} strokeWidth={1.6} />,
  },
  {
    name: "행사용품",
    to: createCategoryLink("행사용품", "행사용품"),
    icon: <PartyPopper size={26} strokeWidth={1.6} />,
  },
];

interface MainCategoryTabsProps {
  variant?: "default" | "compact";
}

export const MainCategoryTabs: React.FC<MainCategoryTabsProps> = ({ variant = "default" }) => {
  const isCompact = variant === "compact";

  return (
    <section className={`${isCompact ? "border-b border-slate-200 bg-slate-50 py-4 md:py-6" : "border-b border-slate-200 bg-white py-10 md:py-14"}`}>
      <Container>
        {!isCompact && (
          <div className="mb-6 text-center md:mb-8 md:text-left">
            <p className="mb-3 text-[11px] font-bold tracking-[0.1em] text-[#001E45]">
              PRODUCT CATEGORY
            </p>
          </div>
        )}

        <nav aria-label="메인 카테고리">
          <div className={`grid grid-cols-3 md:grid-cols-6 ${isCompact ? "gap-2 md:gap-3" : "overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm"}`}>
            {categoryTabs.map((item, idx) => (
              <Link
                key={item.name}
                to={item.to}
                className={`group relative flex items-center justify-center gap-2 overflow-hidden text-center transition-all duration-300
                  ${isCompact 
                    ? "flex-row rounded-full border border-slate-200 bg-white px-3 py-2.5 shadow-sm hover:border-[#001E45] md:px-5 md:py-3" 
                    : `flex-col px-3 py-5 md:px-6 md:py-7 ${idx % 3 !== 0 ? 'border-l border-slate-200/70' : ''} ${idx >= 3 ? 'border-t border-slate-200/70' : ''} md:border-l md:border-t-0 md:first:border-l-0`
                  }
                `}
              >
                {/* Background Fill Hover Effect (Only in default mode) */}
                {!isCompact && (
                  <span
                    className="tab-diagonal-fill absolute inset-0"
                    style={{ "--tw-fill-color": "#001E45" } as React.CSSProperties}
                  />
                )}

                <div className={`relative z-10 transition-colors duration-300 
                  ${isCompact 
                    ? "text-[#001E45] group-hover:scale-110" 
                    : "text-slate-400 group-hover:text-white"
                  }`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: isCompact ? 18 : 26 })}
                </div>

                <span className={`relative z-10 font-bold tracking-tight transition-colors duration-300 
                  ${isCompact 
                    ? "text-[12px] text-slate-700 group-hover:text-[#001E45] md:text-[14px]" 
                    : "text-[13px] text-slate-600 group-hover:text-white md:text-[15px]"
                  }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </Container>
    </section>
  );
};
