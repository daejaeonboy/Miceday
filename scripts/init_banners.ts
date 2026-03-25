import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fallbackBanners = [
  {
    title: '대규모 기업용 PC 렌탈 솔루션',
    subtitle: '10대부터 100대 이상 대량 도입, 유지보수까지 원스톱으로 해결하세요.',
    image_url: 'https://images.unsplash.com/photo-1542744094-24638ea0b46c?q=80&w=2070&auto=format&fit=crop',
    brand_text: 'B2B 최적화',
    button_text: '상담하기',
    banner_type: 'hero',
    link: '/cs',
    display_order: 1,
    is_active: true
  },
  {
    title: '최신 인텔 AI PC 및 고사양 워크스테이션',
    subtitle: '업무 생산성을 극대화하는 최신 사양 IT 기기를 합리적인 렌탈료로 도입해보세요.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    brand_text: 'PREMIUM LAPTOP',
    button_text: '상품보기',
    banner_type: 'hero',
    link: '/products',
    display_order: 2,
    is_active: true
  },
  {
      title: '장애인 표준사업장 우선구매 혜택',
      subtitle: '휴먼파트너는 인증받은 대전지역 MICE/IT 전문 파트너입니다. 공공기관 의무구매 실적을 채우세요.',
      image_url: 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=1931&auto=format&fit=crop',
      brand_text: 'PUBLIC SECTOR',
      button_text: '자세히보기',
      banner_type: 'hero',
      link: '/company',
      display_order: 3,
      is_active: true
    }
];

async function seedBanners() {
  console.log('Inserting default banners...');
  for (const banner of fallbackBanners) {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner]);
    if (error) {
      console.error('Error inserting banner:', banner.title, error);
    } else {
      console.log('Inserted:', banner.title);
    }
  }
  console.log('Done seeding banners.');
}

seedBanners();
