import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Boxes, CheckCircle2, Loader2, Package, Phone } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { getProductById, getProducts, Product } from '../src/api/productApi';

const fallbackImage =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

const formatPrice = (price?: number) => {
  if (!price) return '견적 문의';
  return `${price.toLocaleString()}원`;
};

const renderComponentList = (
  title: string,
  items:
    | Product['basic_components']
    | Product['additional_components']
    | Product['cooperative_components']
    | Product['place_components']
    | Product['food_components'],
) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${item.name}-${index}`}
            className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
          >
            <div>
              <p className="font-semibold text-slate-900">{item.name}</p>
              {'model_name' in item && item.model_name && (
                <p className="mt-1 text-sm text-slate-500">{item.model_name}</p>
              )}
            </div>
            <div className="text-right text-sm font-semibold text-[#001e45]">
              {'quantity' in item && typeof item.quantity === 'number' && <p>{item.quantity}개</p>}
              {'price' in item && typeof item.price === 'number' && <p>{formatPrice(item.price)}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('상품 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [productData, allProducts] = await Promise.all([getProductById(id), getProducts()]);

        if (!productData) {
          setError('상품 정보를 찾을 수 없습니다.');
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        setProduct(productData);
        setRelatedProducts(
          allProducts
            .filter((item) => item.id !== productData.id && item.category === productData.category)
            .slice(0, 4),
        );
      } catch (loadError) {
        console.error('Failed to load product detail:', loadError);
        setError('상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const description = useMemo(() => {
    if (!product) return '';
    return product.description || product.short_description || '제품 상세 정보는 견적 문의를 통해 안내해드립니다.';
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#001e45]" size={40} />
      </div>
    );
  }

  if (!product || error) {
    return (
      <main className="bg-white py-20">
        <Container className="max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-slate-900">{error || '상품 정보를 찾을 수 없습니다.'}</h1>
          <p className="mt-4 text-slate-500">상품 목록으로 돌아가 다른 제품을 확인해보세요.</p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#001e45] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#132f66]"
          >
            상품 목록으로 이동
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 pb-24 pt-8 md:pt-12">
      <Helmet>
        <title>{`${product.name} | 휴먼파트너`}</title>
        <meta
          name="description"
          content={product.short_description || description}
        />
        <meta property="og:title" content={`${product.name} | 휴먼파트너`} />
        <meta property="og:description" content={product.short_description || description} />
        <meta property="og:image" content={product.image_url || fallbackImage} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container className="space-y-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#001e45]">
          <ArrowLeft size={16} />
          상품 목록으로 돌아가기
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <img
              src={product.image_url || fallbackImage}
              alt={product.name}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#001e45]/70">
              {product.category || 'PRODUCT'}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">{description}</p>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <span className="text-sm font-semibold text-slate-500">기준 안내</span>
                <span className="text-2xl font-extrabold text-[#001e45]">{formatPrice(product.price)}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>재고</span>
                  <span className="font-semibold text-slate-900">{product.stock > 0 ? `${product.stock}개` : '문의 필요'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>추천 용도</span>
                  <span className="font-semibold text-slate-900">{product.category || '사무 환경 구성'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              <Link
                to="/quote-request"
                className="inline-flex items-center justify-center rounded-2xl bg-[#001e45] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#132f66]"
              >
                견적 문의하기
              </Link>
              <a
                href="tel:1800-1985"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Phone size={16} />
                전화 상담 1800-1985
              </a>
            </div>

            <div className="mt-8 rounded-2xl border border-[#001e45]/10 bg-[#001e45]/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-[#001e45]" size={18} />
                <div className="text-sm leading-6 text-slate-600">
                  설치 일정, 수량, 현장 조건에 따라 최종 견적은 달라질 수 있습니다.
                  문의를 남겨주시면 담당자가 확인 후 맞춤 제안을 드립니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-3">
                <Package className="text-[#001e45]" size={20} />
                <h2 className="text-xl font-bold text-slate-900">제품 소개</h2>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600 md:text-base">{description}</p>
            </section>

            {renderComponentList('기본 구성', product.basic_components)}
            {renderComponentList('협력 품목', product.cooperative_components)}
            {renderComponentList('추가 구성', product.additional_components)}
            {renderComponentList('장소 관련 품목', product.place_components)}
            {renderComponentList('식음 관련 품목', product.food_components)}
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Boxes className="text-[#001e45]" size={20} />
                <h2 className="text-lg font-bold text-slate-900">도입 안내</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <li>필요 수량과 기간을 남겨주시면 맞춤 견적을 안내합니다.</li>
                <li>현장 여건에 따라 배송, 설치, 회수 조건이 달라질 수 있습니다.</li>
                <li>기업/기관 환경에 맞는 구성 제안이 가능합니다.</li>
              </ul>
            </section>

            {relatedProducts.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">같은 카테고리 상품</h2>
                <div className="mt-5 space-y-4">
                  {relatedProducts.map((related) => (
                    <Link
                      key={related.id}
                      to={`/products/${related.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <img
                        src={related.image_url || fallbackImage}
                        alt={related.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{related.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{related.category || '기본 상품'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </section>
      </Container>
    </main>
  );
};
