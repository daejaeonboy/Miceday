import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { getProductByCode, getProductById } from '../src/api/productApi';
import { NOINDEX_ROBOTS } from '../src/seo';

export const RedirectToProduct = () => {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveProduct = async () => {
            if (!code) {
                navigate('/');
                return;
            }

            try {
                let product = null;

                // Check if code is a UUID (UUID v4 format check)
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code);

                if (isUuid) {
                    product = await getProductById(code);
                }

                // If not UUID or not found by ID, try looking up by product_code
                if (!product) {
                    product = await getProductByCode(code);
                }

                if (product) {
                    navigate(`/products/${product.id}`, { replace: true });
                } else {
                    // Product not found
                    console.warn(`Product not found for code/id: ${code}`);
                    alert('상품을 찾을 수 없습니다.');
                    navigate('/');
                }
            } catch (error) {
                console.error('Error resolving product code:', error);
                navigate('/');
            }
        };

        resolveProduct();
    }, [code, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <Seo
                title="상품 페이지로 이동 중 | 행사어때"
                description="행사어때 상품 상세 페이지로 이동 중입니다."
                canonical="/products"
                robots={NOINDEX_ROBOTS}
            />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39B54A]"></div>
        </div>
    );
};
