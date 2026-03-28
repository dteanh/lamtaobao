export const dynamic = 'force-dynamic';

import { getCatalogCollection } from '@culi/core/catalog';
import { getCategorySummaries } from '@culi/core/categories';
import { SiteFooter, SiteHeader } from './_components/site-shell';

function categoryHref(slug: string) {
  return `/categories/${slug}`;
}

export default async function HomePage() {
  const [collection, categories] = await Promise.all([
    getCatalogCollection({ page: 1, pageSize: 12 }),
    getCategorySummaries(),
  ]);

  const featured = collection.items.slice(0, 8);
  const bestItems = collection.items.slice(4, 12);
  const quickCategories = categories.slice(0, 8);
  const categoryMenu = categories.slice(0, 10);
  const supportLinks = [
    { title: '정기배송', body: '자주 쓰는 식자재를\n편하게 받아보세요', href: '/' },
    { title: '대량구매', body: '매장·사업장용 수량도\n빠르게 상담해드려요', href: '/' },
    { title: '샘플신청', body: '신메뉴 테스트용 샘플을\n간편하게 확인하세요', href: '/' },
    { title: '사업자 혜택', body: '회원등급·쿠폰·혜택을\n사업자 기준으로 정리', href: '/' },
  ];
  const quickIconThemes = [
    ['#fde8e8', '#d91f29'],
    ['#fff2d8', '#b45309'],
    ['#e8f1ff', '#2563eb'],
    ['#ecfdf3', '#059669'],
    ['#f3e8ff', '#7c3aed'],
    ['#ffe4e6', '#e11d48'],
    ['#e0f2fe', '#0284c7'],
    ['#fef3c7', '#ca8a04'],
  ];
  const categoryIconThemes = [
    ['#fff1f2', '#d91f29'],
    ['#eff6ff', '#2563eb'],
    ['#ecfdf3', '#059669'],
    ['#fef3c7', '#ca8a04'],
    ['#f3e8ff', '#7c3aed'],
  ];
  const promoBanners = [
    {
      eyebrow: 'BOX SPECIAL',
      title: '박스특가로 인기 상품을 더 가볍게',
      body: '매장 운영에 자주 쓰는 상품을 묶음 단가로 빠르게 확인하세요.',
      background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      color: '#9f1239',
      accent: '#ffd2dc',
    },
    {
      eyebrow: 'TIME SALE',
      title: '지금 바로 확인하는 한정 특가',
      body: '카페/베이커리 추천 품목을 기간 한정가로 묶었습니다.',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      color: '#1d4ed8',
      accent: '#bfdbfe',
    },
  ];
  const bestTabs = ['베이커리', '카페재료', '냉동/간편식', '음료/시럽', '사업자 추천'];
  const heroCards = [
    {
      eyebrow: '쿠키맛집 등극',
      title: collection.items[0]?.title ?? '추천 디저트',
      body: '굽기만 하세요\n진하고 쫀득한 미국식 정통 쿠키',
      href: collection.items[0] ? `/products/${collection.items[0].slug}` : '#',
      background: 'linear-gradient(120deg, #2b160d 0%, #7c3f13 34%, #f4d4b4 100%)',
      accent: '#fff1e8',
    },
    {
      eyebrow: '겉바속촉 고급 스콘 맛집',
      title: collection.items[1]?.title ?? '인기 스콘',
      body: '해동 후 20분만 구워주세요!\n손님들이 좋아해요',
      href: collection.items[1] ? `/products/${collection.items[1].slug}` : '#',
      background: 'linear-gradient(120deg, #6f2f10 0%, #c76721 45%, #f6d9b0 100%)',
      accent: '#fff4df',
    },
    {
      eyebrow: '카페 디저트 고민 끝',
      title: collection.items[2]?.title ?? '추천 디저트 셀렉션',
      body: '해동NO! 발효NO!\n굽기만 하면 고급 디저트 완성',
      href: collection.items[2] ? `/products/${collection.items[2].slug}` : '#',
      background: 'linear-gradient(120deg, #1f3650 0%, #2e6a86 42%, #d7eef3 100%)',
      accent: '#ecfeff',
    },
  ];

  return (
    <main style={{ minWidth: 1472, background: '#fff' }}>
      <SiteHeader />

      <section style={{ background: '#fff' }}>
        <div style={{ width: 1472, margin: '0 auto', paddingTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
            <div
              style={{
                minHeight: 548,
                borderRadius: 0,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr',
                position: 'relative',
              }}
            >
              <span style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, height: 32, padding: '0 14px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
                MAIN BANNER
              </span>
              <a
                href={heroCards[0].href}
                style={{
                  textDecoration: 'none',
                  color: '#fff',
                  background: heroCards[0].background,
                  padding: '68px 60px',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 360px',
                  alignItems: 'stretch',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 24% 28%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 34%)',
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>{heroCards[0].eyebrow}</div>
                    <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.04, letterSpacing: '-0.055em', maxWidth: 640 }}>
                      {heroCards[0].title}
                    </h1>
                    <p style={{ margin: '22px 0 0', fontSize: 23, lineHeight: 1.58, whiteSpace: 'pre-line', maxWidth: 520 }}>
                      {heroCards[0].body}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ height: 46, padding: '0 22px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 800 }}>
                      지금 보러가기
                    </span>
                    <span style={{ height: 34, padding: '0 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 800 }}>
                      TODAY PICK
                    </span>
                    <span style={{ fontSize: 14, opacity: 0.85 }}>01 / 03</span>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: 300,
                      height: 392,
                      borderRadius: '32px 32px 0 32px',
                      background: `linear-gradient(180deg, ${heroCards[0].accent} 0%, rgba(255,255,255,0.26) 100%)`,
                      boxShadow: '0 28px 54px rgba(0,0,0,0.16)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: '18px 18px auto 18px', height: 150, borderRadius: 24, background: 'rgba(255,255,255,0.32)' }} />
                    <div style={{ position: 'absolute', left: 24, right: 24, bottom: 24, height: 174, borderRadius: 28, background: 'rgba(255,255,255,0.94)', color: '#111827', padding: '22px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#d91f29', marginBottom: 10 }}>SERVEQ PICK</div>
                      <div style={{ fontSize: 28, lineHeight: 1.18, letterSpacing: '-0.04em', fontWeight: 900, marginBottom: 10 }}>
                        홈카페부터
                        <br />
                        매장 디저트까지
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.65, color: '#4b5563' }}>추천 상품과 시즌 기획전을 메인 배너처럼 진하게 보여주는 처리입니다.</div>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 18, position: 'relative' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, height: 32, padding: '0 14px', background: '#d91f29', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
                SIDE BANNERS
              </span>
              {heroCards.slice(1).map((card, index) => (
                <a
                  key={card.title}
                  href={card.href}
                  style={{
                    textDecoration: 'none',
                    color: '#fff',
                    background: card.background,
                    padding: '34px 32px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 112px',
                    minHeight: 265,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 24% 24%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 36%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{card.eyebrow}</div>
                      <div style={{ fontSize: 31, lineHeight: 1.14, fontWeight: 800, letterSpacing: '-0.035em' }}>{card.title}</div>
                      <p style={{ margin: '16px 0 0', fontSize: 17, lineHeight: 1.6, whiteSpace: 'pre-line', maxWidth: 220 }}>{card.body}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ height: 38, padding: '0 16px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.34)', display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 800 }}>
                        바로가기
                      </span>
                      <span style={{ height: 28, padding: '0 10px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>
                        SUB PICK
                      </span>
                      <span style={{ fontSize: 13, opacity: 0.8 }}>0{index + 2}</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        width: 96,
                        height: 188,
                        borderRadius: '22px 22px 0 22px',
                        background: `linear-gradient(180deg, ${card.accent} 0%, rgba(255,255,255,0.18) 100%)`,
                        border: '1px solid rgba(255,255,255,0.22)',
                        boxShadow: '0 18px 32px rgba(0,0,0,0.14)',
                      }}
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: '#6b7280', letterSpacing: '0.08em' }}>MAIN VISUAL</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>01</span>
              <div style={{ flex: 1, height: 3, background: '#e5e7eb', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '34%', background: '#111827' }} />
              </div>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 700 }}>03</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 800 }}>배너 넘기기</span>
              <span style={{ width: 34, height: 34, border: '1px solid #d1d5db', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, color: '#6b7280' }}>‹</span>
              <span style={{ width: 34, height: 34, border: '1px solid #111827', background: '#111827', display: 'grid', placeItems: 'center', fontSize: 14, color: '#fff' }}>›</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', paddingTop: 28 }}>
        <div style={{ width: 1472, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, height: 32, padding: '0 14px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
            QUICK ZONE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, padding: '12px 16px', background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}>
            <span style={{ color: '#4b5563' }}>자주 찾는 카테고리와 바로가기를 한 번에 모아둔 빠른 이동 영역</span>
            <span style={{ color: '#111827', fontWeight: 800 }}>빠른 이동</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#d91f29' }}>QUICK MENU</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>자주 찾는 카테고리를 빠르게 이동하세요</span>
            </div>
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>전체 카테고리 →</span>
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
              gap: 18,
            }}
          >
            {quickCategories.map((category, index) => {
              const [bg, fg] = quickIconThemes[index % quickIconThemes.length];
              return (
                <li key={category.id}>
                  <a
                    href={categoryHref(category.slug)}
                    style={{ textDecoration: 'none', color: '#111827', display: 'block', textAlign: 'center', padding: '14px 8px 10px', border: '1px solid #f1f5f9', background: '#fff' }}
                  >
                    <div
                      style={{
                        width: 110,
                        height: 110,
                        margin: '0 auto 12px',
                        borderRadius: '50%',
                        background: bg,
                        border: '1px solid #ececec',
                        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'relative',
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 16, background: fg, opacity: 0.95 }} />
                      <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 28, right: 28, opacity: 0.95 }} />
                      <div style={{ position: 'absolute', width: 22, height: 4, borderRadius: 999, background: '#fff', bottom: 32, left: 44, transform: 'translateX(-50%)', opacity: 0.95 }} />
                    </div>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{category.name}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>빠른 이동</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>인기 카테고리를 한 번에 모아둔 빠른 이동 메뉴</span>
            <span style={{ color: '#374151', fontWeight: 800 }}>카테고리 전체 펼치기 →</span>
          </div>
        </div>
      </section>

      <section id="featured" style={{ paddingTop: 82, background: '#fff' }}>
        <div style={{ width: 1472, margin: '0 auto', background: '#fcfcfc', padding: '32px 34px 36px', border: '1px solid #f1f5f9', position: 'relative' }}>
          <span style={{ position: 'absolute', top: -1, left: -1, height: 32, padding: '0 14px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
            FEATURED ZONE
          </span>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#d91f29' }}>FEATURED</span>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>전체보기 →</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.2, letterSpacing: '-0.04em', textAlign: 'center', fontWeight: 900 }}>
              자신있는 추천상품 구경하고 가실래요?
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, padding: '12px 16px', background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}>
            <span style={{ color: '#4b5563' }}>오늘 기준 추천 상품 · 신상품/행사상품 우선 노출</span>
            <span style={{ color: '#111827', fontWeight: 800 }}>업데이트 06:20</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {['신상품', '인기상품', 'MD추천', '행사상품'].map((tab, index) => (
              <span
                key={tab}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 104,
                  height: 40,
                  padding: '0 16px',
                  background: index === 0 ? '#111827' : '#fff',
                  color: index === 0 ? '#fff' : '#374151',
                  border: index === 0 ? '1px solid #111827' : '1px solid #d1d5db',
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 26,
            }}
          >
            {featured.map((item, index) => (
              <li key={item.id}>
                <a href={`/products/${item.slug}`} style={{ textDecoration: 'none', color: '#111827', display: 'block' }}>
                  <div style={{ position: 'relative', marginBottom: 18 }}>
                    <div
                      style={{
                        aspectRatio: '1 / 1',
                        background: item.featuredImage?.url
                          ? `center / cover no-repeat url(${item.featuredImage.url})`
                          : 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)',
                      }}
                    />
                    <div style={{ position: 'absolute', left: 14, top: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ height: 26, padding: '0 10px', background: '#d91f29', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 800 }}>
                        {index < 2 ? 'BEST' : '추천'}
                      </span>
                      {item.price.sale ? (
                        <span style={{ height: 26, padding: '0 10px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 800 }}>
                          SALE
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      style={{
                        position: 'absolute',
                        right: 12,
                        bottom: 12,
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: 0,
                        background: '#fff',
                        boxShadow: '0 10px 18px rgba(0,0,0,0.10)',
                        cursor: 'pointer',
                        fontSize: 18,
                      }}
                    >
                      🛒
                    </button>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#d91f29', marginBottom: 8, fontWeight: 800, letterSpacing: '0.02em' }}>{item.categorySlugs[0] ?? '브랜드'}</div>
                    <div style={{ fontSize: 19, lineHeight: 1.48, fontWeight: 800, minHeight: 58, letterSpacing: '-0.03em' }}>{item.title}</div>
                    <div style={{ marginTop: 10, color: '#6b7280', fontSize: 14, minHeight: 44, lineHeight: 1.6 }}>
                      {item.excerpt ?? '상세 페이지에서 상품 특징과 옵션을 확인하세요.'}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.price.sale ? <span style={{ fontSize: 18, color: '#d91f29', fontWeight: 900 }}>특가</span> : null}
                      <strong style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{item.price.active.formatted}</strong>
                      {item.price.sale ? (
                        <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>
                          {item.price.regular.formatted}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#4b5563', background: '#f3f4f6', padding: '6px 10px' }}>무료배송 조건 확인</span>
                      <span style={{ fontSize: 12, color: '#4b5563', background: '#f9fafb', padding: '6px 10px' }}>사업자 추천</span>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                      <span style={{ height: 24, padding: '0 8px', background: '#fff1f2', color: '#d91f29', display: 'inline-flex', alignItems: 'center', fontWeight: 800 }}>오늘출고</span>
                      <span style={{ height: 24, padding: '0 8px', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', fontWeight: 800 }}>냉동보관</span>
                      <span style={{ height: 24, padding: '0 8px', background: '#f9fafb', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontWeight: 700 }}>사업자전용 혜택</span>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                      <span>리뷰 128</span>
                      <span>찜 2.3k</span>
                      <span style={{ fontWeight: 800, color: '#374151' }}>자세히 →</span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 28 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 800, letterSpacing: '0.08em' }}>FEATURED PAGE</span>
            <span style={{ width: 36, height: 36, border: '1px solid #d1d5db', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, color: '#6b7280' }}>‹</span>
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>1 / 4</span>
            <span style={{ width: 36, height: 36, border: '1px solid #111827', background: '#111827', display: 'grid', placeItems: 'center', fontSize: 14, color: '#fff' }}>›</span>
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', paddingTop: 58 }}>
        <div style={{ width: 1472, margin: '0 auto' }}>
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 26 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#d91f29' }}>SPECIAL PROMOTION</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>지금 확인해야 하는 특가와 기획전</span>
            </div>
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>기획전 전체보기 →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
            {promoBanners.map((banner, index) => (
              <a
                key={banner.title}
                href="/"
                style={{
                  textDecoration: 'none',
                  color: '#111827',
                  minHeight: 220,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 160px',
                  alignItems: 'stretch',
                  background: banner.background,
                  padding: '34px 36px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, height: 28, padding: '0 12px', background: index === 0 ? '#111827' : '#d91f29', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>
                  PROMO ZONE
                </span>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 20% 24%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 34%)',
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: banner.color, marginBottom: 16 }}>{banner.eyebrow}</div>
                  <div style={{ fontSize: 34, lineHeight: 1.22, letterSpacing: '-0.04em', fontWeight: 900, marginBottom: 14 }}>{banner.title}</div>
                  <div style={{ fontSize: 17, lineHeight: 1.7, color: '#4b5563', maxWidth: 520 }}>{banner.body}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                    <span style={{ height: 36, padding: '0 14px', borderRadius: 999, background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 800 }}>
                      프로모션 보기
                    </span>
                    <span style={{ height: 26, padding: '0 10px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', color: banner.color, display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>
                      LIMITED
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      width: 128,
                      height: 152,
                      borderRadius: '26px 26px 0 26px',
                      background: `linear-gradient(180deg, ${banner.accent} 0%, rgba(255,255,255,0.48) 100%)`,
                      boxShadow: '0 18px 34px rgba(15, 23, 42, 0.10)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: '12px 12px auto 12px', height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.42)' }} />
                    <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18, height: 58, borderRadius: 18, background: index === 0 ? '#fff7f8' : '#f8fbff', border: '1px solid rgba(255,255,255,0.72)' }} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" style={{ paddingTop: 92, paddingBottom: 96, background: '#fff' }}>
        <div style={{ width: 1472, margin: '0 auto', background: '#fcfcfc', padding: '34px 34px 38px', border: '1px solid #f1f5f9', position: 'relative' }}>
          <span style={{ position: 'absolute', top: -1, left: -1, height: 32, padding: '0 14px', background: '#374151', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
            CATEGORY ZONE
          </span>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#d91f29' }}>CATEGORY CURATION</span>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>추천 테마 더보기 →</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.2, letterSpacing: '-0.04em', textAlign: 'center', fontWeight: 900 }}>
              테마별 추천상품을 둘러보세요~
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, padding: '12px 16px', background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}>
            <span style={{ color: '#4b5563' }}>카페/베이커리 운영 기준으로 자주 찾는 테마를 우선 정리</span>
            <span style={{ color: '#111827', fontWeight: 800 }}>테마 큐레이션</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            {['카페 운영', '베이커리', '시즌 추천', '대용량', '행사 상품'].map((chip, index) => (
              <span
                key={chip}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 104,
                  height: 38,
                  padding: '0 16px',
                  background: index === 0 ? '#111827' : '#fff',
                  color: index === 0 ? '#fff' : '#374151',
                  border: index === 0 ? '1px solid #111827' : '1px solid #d1d5db',
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 18 }}>
            {categoryMenu.map((category, index) => {
              const [bg, fg] = categoryIconThemes[index % categoryIconThemes.length];
              return (
                <a
                  key={category.id}
                  href={categoryHref(category.slug)}
                  style={{
                    textDecoration: 'none',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                    padding: '26px 22px',
                    display: 'block',
                    minHeight: 148,
                    background: index % 2 === 0 ? '#fff7f7' : '#f8fafc',
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      background: bg,
                      borderRadius: 18,
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                      marginBottom: 18,
                      position: 'relative',
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: fg }} />
                    <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: '#fff', top: 10, right: 10 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ height: 24, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>THEME</span>
                    <span style={{ height: 24, padding: '0 8px', background: '#fff', border: '1px solid #d1d5db', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>운영 추천</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.35 }}>{category.name}</div>
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>상품 {category.count}개</div>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#374151' }}>
                    <span>테마 보러가기</span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ background: '#f8f8f8', padding: '92px 0 96px' }}>
        <div style={{ width: 1472, margin: '0 auto', background: '#fbfbfb', padding: '32px 34px 36px', border: '1px solid #eceff3', position: 'relative' }}>
          <span style={{ position: 'absolute', top: -1, left: -1, height: 32, padding: '0 14px', background: '#d91f29', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
            BEST ZONE
          </span>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#d91f29' }}>BEST PICK</span>
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>카테고리별 더보기 →</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.2, letterSpacing: '-0.04em', textAlign: 'center', fontWeight: 900 }}>
              카테고리별 BEST, 추천드려요!
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, padding: '12px 16px', background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}>
            <span style={{ color: '#4b5563' }}>카테고리별 반응이 좋은 상품 중심 · 운영 추천 상품 큐레이션</span>
            <span style={{ color: '#111827', fontWeight: 800 }}>BEST 업데이트</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            {bestTabs.map((tab, index) => (
              <span
                key={tab}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 118,
                  height: 46,
                  padding: '0 18px',
                  background: index === 0 ? '#111827' : '#fff',
                  color: index === 0 ? '#fff' : '#374151',
                  border: index === 0 ? '1px solid #111827' : '1px solid #d1d5db',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {tab}
              </span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 26 }}>
            {bestItems.map((item, index) => (
              <a key={item.id} href={`/products/${item.slug}`} style={{ textDecoration: 'none', color: '#111827', display: 'block', background: '#fff', padding: 18 }}>
                <div style={{ position: 'relative', marginBottom: 18 }}>
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      background: item.featuredImage?.url
                        ? `center / cover no-repeat url(${item.featuredImage.url})`
                        : 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', left: 14, top: 14, display: 'flex', gap: 6 }}>
                    <span style={{ height: 26, padding: '0 10px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 800 }}>
                      {index < 2 ? 'MD 추천' : 'BEST'}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', right: 12, bottom: 12, width: 42, height: 42, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 18px rgba(0,0,0,0.10)' }}>🛒</div>
                </div>
                <div style={{ fontSize: 12, color: '#d91f29', marginBottom: 8, fontWeight: 800, letterSpacing: '0.02em' }}>{item.categorySlugs[0] ?? 'BEST'}</div>
                <div style={{ fontSize: 19, lineHeight: 1.45, fontWeight: 800, minHeight: 58, letterSpacing: '-0.03em' }}>{item.title}</div>
                <div style={{ marginTop: 10, color: '#6b7280', fontSize: 14, minHeight: 44, lineHeight: 1.6 }}>{item.excerpt ?? '카테고리별로 반응이 좋은 대표 상품입니다.'}</div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.price.sale ? <span style={{ fontSize: 18, color: '#d91f29', fontWeight: 900 }}>특가</span> : null}
                  <strong style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{item.price.active.formatted}</strong>
                  {item.price.sale ? (
                    <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>{item.price.regular.formatted}</span>
                  ) : null}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#4b5563', background: '#f3f4f6', padding: '6px 10px' }}>인기 카테고리</span>
                  <span style={{ fontSize: 12, color: '#4b5563', background: '#f9fafb', padding: '6px 10px' }}>빠른 출고</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
                  <span style={{ height: 24, padding: '0 8px', background: '#fff1f2', color: '#d91f29', display: 'inline-flex', alignItems: 'center', fontWeight: 800 }}>MD 추천</span>
                  <span style={{ height: 24, padding: '0 8px', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', fontWeight: 800 }}>당일확인</span>
                  <span style={{ height: 24, padding: '0 8px', background: '#f9fafb', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontWeight: 700 }}>카테고리 베스트</span>
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                  <span>리뷰 94</span>
                  <span>판매중</span>
                  <span style={{ fontWeight: 800, color: '#374151' }}>자세히 →</span>
                </div>
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 28 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 800, letterSpacing: '0.08em' }}>BEST PAGE</span>
            <span style={{ width: 36, height: 36, border: '1px solid #d1d5db', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, color: '#6b7280' }}>‹</span>
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>2 / 5</span>
            <span style={{ width: 36, height: 36, border: '1px solid #111827', background: '#111827', display: 'grid', placeItems: 'center', fontSize: 14, color: '#fff' }}>›</span>
          </div>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '56px 0 0' }}>
        <div style={{ width: 1472, margin: '0 auto' }}>
          <a
            href="/"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              textDecoration: 'none',
              color: '#111827',
              background: 'linear-gradient(135deg, #f4ede4 0%, #f7f1ea 100%)',
              minHeight: 240,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, height: 30, padding: '0 12px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>
              BUSINESS ZONE
            </span>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 18% 24%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 34%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ padding: '42px 48px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ height: 24, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 900 }}>B2B</span>
                <span style={{ height: 24, padding: '0 8px', background: '#fff', border: '1px solid #d6d3d1', color: '#6b7280', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>운영 지원</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#b45309', marginBottom: 14 }}>SERVEQ BUSINESS</div>
              <div style={{ fontSize: 42, lineHeight: 1.18, letterSpacing: '-0.05em', fontWeight: 900, marginBottom: 14 }}>
                매장 운영에 필요한 식자재,
                <br />
                한 번에 빠르게 준비하세요
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.7, color: '#4b5563' }}>
                정기배송, 대량구매, 샘플신청, 사업자 전용 혜택까지
                <br />
                서브큐몰에서 한 흐름으로 이어집니다.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <span style={{ height: 38, padding: '0 16px', borderRadius: 999, background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 800 }}>
                  서비스 보러가기
                </span>
                <span style={{ height: 28, padding: '0 10px', borderRadius: 999, background: '#fff', border: '1px solid #d6d3d1', color: '#6b7280', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>
                  BUSINESS ENTRY
                </span>
              </div>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 28,
                  right: 28,
                  width: 108,
                  height: 108,
                  borderRadius: 26,
                  background: 'rgba(255,255,255,0.22)',
                  border: '1px solid rgba(255,255,255,0.24)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: 34,
                  width: 172,
                  height: 168,
                  borderRadius: '28px 28px 0 28px',
                  background: 'rgba(255,255,255,0.88)',
                  boxShadow: '0 18px 34px rgba(0,0,0,0.12)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, paddingBottom: 34, textAlign: 'center' }}>
                BUSINESS
                <br />
                SUPPORT
              </div>
            </div>
          </a>
        </div>
      </section>

      <section style={{ background: '#fff', padding: '28px 0 84px' }}>
        <div style={{ width: 1472, margin: '0 auto', background: '#fcfcfc', padding: '30px 34px 34px', border: '1px solid #f1f5f9', position: 'relative' }}>
          <span style={{ position: 'absolute', top: -1, left: -1, height: 32, padding: '0 14px', background: '#b45309', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>
            SERVICE ZONE
          </span>
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 28 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, padding: '12px 16px', background: '#fff', border: '1px solid #e5e7eb', fontSize: 13 }}>
            <span style={{ color: '#4b5563' }}>대량구매 · 정기배송 · 샘플신청 · 사업자 혜택을 빠르게 연결</span>
            <span style={{ color: '#111827', fontWeight: 800 }}>서비스 안내</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: '#d91f29' }}>BUSINESS SERVICE</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>운영에 필요한 주요 기능을 빠르게 확인하세요</span>
            </div>
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 700 }}>서비스 전체보기 →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18 }}>
            {supportLinks.map((item, index) => {
              const [bg, fg] = quickIconThemes[index % quickIconThemes.length];
              return (
                <a
                  key={item.title}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    color: '#111827',
                    border: '1px solid #ececec',
                    background: index % 2 === 0 ? '#fff' : '#fafafa',
                    padding: '28px 24px',
                    minHeight: 156,
                    display: 'block',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: bg,
                      border: '1px solid rgba(0,0,0,0.04)',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: 18,
                      position: 'relative',
                    }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: fg }} />
                    <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#fff', top: 9, right: 9 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ height: 24, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>SERVICE</span>
                    <span style={{ height: 24, padding: '0 8px', background: '#fff', border: '1px solid #d1d5db', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>바로 연결</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: '#6b7280', whiteSpace: 'pre-line' }}>{item.body}</div>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#374151' }}>
                    <span>서비스 보러가기</span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
