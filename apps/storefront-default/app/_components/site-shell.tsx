import type { ReactNode } from 'react';

export function SiteHeader() {
  const megaCategories = ['전체상품', '기타', '빙수재료', '오일', '커피원두(홀빈)', '티백', '제철과일', '건강식품', '박스특가'];
  const brands = ['서브큐', 'Anchor', 'Mutti', 'Coup de pates'];
  const directLinks = ['전체상품', '정기배송', '대량구매', '박스특가', '선물하기', '타임세일', '사업자 인증/혜택', '샘플신청'];
  const hotKeywords = ['크로와상', '스콘', '쿠키', '냉동생지', '타임세일'];

  return (
    <header style={{ backgroundColor: '#fff', position: 'relative', zIndex: 30 }}>
      <a
        href="/member/join.html"
        style={{
          lineHeight: '44px',
          textAlign: 'center',
          backgroundColor: '#d91f29',
          fontSize: 15,
          color: '#fff',
          display: 'block',
          textDecoration: 'none',
        }}
      >
        신규가입 시 <strong>1만원 쿠폰</strong>을 지급해드려요!
      </a>

      <div style={{ width: 1472, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 126,
          }}
        >
          <div style={{ width: 250, height: 74, display: 'flex', alignItems: 'center' }}>
            <a
              href="/"
              style={{
                width: 250,
                height: 74,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                textDecoration: 'none',
                color: '#111827',
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1, color: '#d91f29', fontWeight: 900, letterSpacing: '0.16em', marginBottom: 6 }}>SERVEQ</span>
              <span style={{ fontSize: 34, lineHeight: 1, fontWeight: 900, letterSpacing: '-0.05em' }}>서브큐</span>
            </a>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#6b7280', marginBottom: 8 }}>SEARCH PRODUCTS</div>
            <div style={{ position: 'relative' }}>
              <form action="/product/search.html" method="get">
                <input
                  name="keyword"
                  placeholder="찾으시는 상품을 입력해보세요"
                  style={{
                    width: 560,
                    height: 52,
                    paddingRight: 56,
                    paddingLeft: 26,
                    backgroundColor: '#fff',
                    border: '2px solid #d91f29',
                    borderRadius: 26,
                    outline: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    width: 32,
                    height: 32,
                    border: 0,
                    borderRadius: '50%',
                    background: '#d91f29',
                    color: '#fff',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  ⌕
                </button>
                <span style={{ position: 'absolute', right: 54, top: 14, height: 24, padding: '0 10px', borderRadius: 999, background: '#fff1f2', color: '#d91f29', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>
                  사업자 전용
                </span>
              </form>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: '#111827' }}>인기검색어</span>
              <span style={{ height: 20, padding: '0 7px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em' }}>LIVE</span>
              {hotKeywords.map((keyword, index) => (
                <span key={keyword} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: index === hotKeywords.length - 1 ? '0' : '1px solid #eef2f7' }}>
                  <span style={{ color: '#d91f29', fontWeight: 900 }}>{index + 1}</span>
                  <span style={{ color: '#374151', fontWeight: 600 }}>{keyword}</span>
                  <span style={{ color: index < 2 ? '#d91f29' : '#2563eb', fontWeight: 900, fontSize: 10 }}>{index < 2 ? '▲' : '▼'}</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ width: 250 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>OFFICIAL MALL</span>
            </div>
            <ul
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
                textAlign: 'right',
                marginTop: 0,
                marginBottom: 24,
                padding: 0,
                listStyle: 'none',
                fontSize: 12,
                color: '#111827',
              }}
            >
              <li style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ height: 18, padding: '0 6px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em' }}>NEW</span>
                <a href="/member/join.html" style={{ textDecoration: 'none', color: '#d91f29', fontWeight: 800 }}>
                  회원가입
                </a>
              </li>
              <li style={{ color: '#d1d5db' }}>|</li>
              <li>
                <a href="/member/login.html" style={{ textDecoration: 'none', color: '#111827' }}>
                  로그인
                </a>
              </li>
              <li style={{ color: '#d1d5db' }}>|</li>
              <li>
                <a href="/board/index.html" style={{ textDecoration: 'none', color: '#111827' }}>
                  고객센터
                </a>
              </li>
            </ul>
            <ul
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 18,
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {[
                { href: '/myshop/index.html', label: '마이페이지', count: null },
                { href: '/cart', label: '장바구니', count: '2' },
                { href: '/order-lookup', label: '배송조회', count: 'N' },
              ].map((item, index) => (
                <li key={item.label}>
                  <a href={item.href} style={{ textDecoration: 'none', color: '#111827', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: index % 2 === 0 ? '#f3f4f6' : '#fff1f2', display: 'grid', placeItems: 'center' }}>
                      <span style={{ width: 9, height: 9, borderRadius: index === 1 ? '50%' : 3, background: index % 2 === 0 ? '#374151' : '#d91f29', display: 'block' }} />
                    </span>
                    <span>{item.label}</span>
                    {item.count ? (
                      <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: item.label === '장바구니' ? '#d91f29' : '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>
                        {item.count}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <nav
            style={{
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'space-between',
              borderTop: '1px solid #e5e7eb',
              borderBottom: '1px solid #e5e7eb',
              height: 66,
            }}
          >
            <details style={{ width: 234, position: 'relative' }}>
              <summary
                style={{
                  height: 66,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  listStyle: 'none',
                  cursor: 'pointer',
                  color: '#111827',
                  fontWeight: 900,
                  fontSize: 16,
                  borderRight: '1px solid #e5e7eb',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: 18 }}>☰</span>
                <span>전체상품</span>
              </summary>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 320px',
                  gap: 28,
                  position: 'absolute',
                  left: 0,
                  width: 1040,
                  top: 66,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderTop: 0,
                  boxShadow: '0 18px 30px rgba(15, 23, 42, 0.06)',
                  padding: '24px 28px 28px',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#d91f29', marginBottom: 16, letterSpacing: '0.08em' }}>CATEGORY</div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '16px 28px',
                    }}
                  >
                    {megaCategories.map((item, index) => (
                      <li key={item}>
                        <a
                          href="/"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            textDecoration: 'none',
                            color: '#111827',
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          <span style={{ width: 34, height: 34, borderRadius: 12, background: index % 2 === 0 ? '#fff1f2' : '#eff6ff', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
                            <span style={{ width: 14, height: 14, borderRadius: 5, background: index % 2 === 0 ? '#d91f29' : '#2563eb', display: 'block' }} />
                          </span>
                          <span>{item}</span>
                        </a>
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 14 }}>바로가기</div>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '10px 18px',
                      }}
                    >
                      {directLinks.map((item) => (
                        <li key={item}>
                          <a
                            href="/"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                              padding: '12px 0',
                              textDecoration: 'none',
                              color: '#111827',
                              fontSize: 14,
                              fontWeight: 700,
                              borderBottom: '1px solid #f3f4f6',
                            }}
                          >
                            <span>{item}</span>
                            <span style={{ color: '#9ca3af' }}>→</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateRows: '176px auto', gap: 16 }}>
                  <a
                    href="/"
                    style={{
                      textDecoration: 'none',
                      color: '#111827',
                      background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                      padding: '22px 22px',
                      display: 'block',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#d91f29', marginBottom: 10 }}>SPECIAL ZONE</div>
                    <div style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.04em', fontWeight: 900, marginBottom: 10 }}>사업자 맞춤 혜택과 특가</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: '#4b5563' }}>대량구매, 정기배송, 타임세일을 한 번에 확인하세요.</div>
                  </a>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12 }}>
                    {brands.map((brand, index) => (
                      <li key={brand}>
                        <a
                          href="/"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            height: 58,
                            border: '1px solid #e5e7eb',
                            textDecoration: 'none',
                            color: '#111827',
                            fontWeight: 800,
                            background: '#fff',
                            padding: '0 16px',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 28, height: 28, borderRadius: 10, background: index % 2 === 0 ? '#f3f4f6' : '#fff1f2', display: 'grid', placeItems: 'center' }}>
                              <span style={{ width: 12, height: 12, borderRadius: 4, background: index % 2 === 0 ? '#374151' : '#d91f29', display: 'block' }} />
                            </span>
                            <span>{brand}</span>
                          </span>
                          <span style={{ color: '#9ca3af' }}>→</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
            <div style={{ display: 'flex', alignItems: 'center', gap: 38, flex: 1, paddingLeft: 38, fontSize: 16, fontWeight: 800 }}>
              <a href="/" style={{ textDecoration: 'none', color: '#111827', whiteSpace: 'nowrap', position: 'relative', paddingBottom: 2 }}>
                추천상품
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: -22, height: 3, background: '#111827' }} />
              </a>
              <a href="/cart" style={{ textDecoration: 'none', color: '#111827', whiteSpace: 'nowrap' }}>장바구니</a>
              <a href="/checkout" style={{ textDecoration: 'none', color: '#111827', whiteSpace: 'nowrap' }}>주문서</a>
              <a href="/order-lookup" style={{ textDecoration: 'none', color: '#111827', whiteSpace: 'nowrap' }}>주문조회</a>
              <a href="/" style={{ textDecoration: 'none', color: '#d91f29', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>이달의 특가</span>
                <span style={{ fontSize: 11, fontWeight: 900, background: '#d91f29', color: '#fff', padding: '2px 6px', lineHeight: 1.4 }}>HOT</span>
              </a>
            </div>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', color: '#d91f29' }}>NOTICE</span>
              <span style={{ height: 22, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>LIVE</span>
              <span style={{ fontSize: 14, color: '#111827', fontWeight: 700 }}>사업자 회원 전용 혜택과 타임세일을 지금 확인해보세요.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 800, color: '#374151' }}>신규가입 쿠폰</span>
              <span style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 800, color: '#374151' }}>사업자 특가</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                <span style={{ width: 24, height: 24, border: '1px solid #d1d5db', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, color: '#6b7280' }}>‹</span>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>1 / 3</span>
                <span style={{ width: 24, height: 24, border: '1px solid #111827', background: '#111827', display: 'grid', placeItems: 'center', fontSize: 11, color: '#fff' }}>›</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const familySites = ['삼양사', '삼양홀딩스', '큐원', '상쾌환', '어바웃미', 'OMS시스템'];
  const socials = ['유튜브', '카카오톡', '인스타그램', '네이버 블로그'];
  const serviceBadges = ['정품보장', '사업자전용', '대량구매', '정기배송'];
  const paymentBadges = ['이니시스', '에스크로', '기업은행'];

  return (
    <footer style={{ background: '#f7f7f7', borderTop: '1px solid #e5e7eb', paddingTop: 0 }}>
      <div style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ width: 1472, margin: '0 auto', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>FOOTER MENU</span>
            <ul style={{ display: 'flex', gap: 0, listStyle: 'none', padding: 0, margin: 0, fontSize: 14, flexWrap: 'wrap' }}>
              {[
                '회사소개',
                '사업소개',
                '이용안내',
                '사이트 이용약관',
                '개인정보처리방침',
                '임직원 인증',
                '입점/제휴문의',
              ].map((item, index, arr) => (
                <li key={item} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <a href="#" style={{ textDecoration: 'none', color: '#111827', fontWeight: item === '개인정보처리방침' ? 800 : 500, paddingRight: 14 }}>
                    {item}
                  </a>
                  {index < arr.length - 1 ? <span style={{ color: '#d1d5db', paddingRight: 14 }}>|</span> : null}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {serviceBadges.map((badge, index) => (
              <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#374151' }}>
                <span style={{ width: 18, height: 18, borderRadius: 6, background: index % 2 === 0 ? '#fff1f2' : '#eff6ff', display: 'grid', placeItems: 'center' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: index % 2 === 0 ? '#d91f29' : '#2563eb', display: 'block' }} />
                </span>
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: 1472, margin: '0 auto', paddingTop: 34 }}>
        <div style={{ paddingBottom: 28, display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 0.9fr', gap: 32, alignItems: 'start' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12 }}>COMPANY</span>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#d91f29', letterSpacing: '0.12em', marginBottom: 10 }}>SERVEQ</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 18 }}>삼양사</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ height: 24, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>OFFICIAL</span>
              <span style={{ height: 24, padding: '0 8px', background: '#fff', border: '1px solid #d1d5db', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>본사 운영</span>
            </div>
            <div style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.9 }}>
              <div>(주)삼양사 판교</div>
              <div>대표명 : 강호성</div>
              <div>사업자등록번호 : 781-85-00412 사업자정보확인</div>
              <div>주소 : 경기 성남시 분당구 판교로 295 6층, 7층, 8층</div>
              <div>개인정보관리책임자 : 이재헌 (serveq@samyang.com)</div>
              <div>통신판매업신고번호 : 2016-성남분당-0530</div>
            </div>
          </div>

          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', background: '#d91f29', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12 }}>CUSTOMER</span>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>고객센터</div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>1668-4486</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ height: 24, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>CS CENTER</span>
              <span style={{ height: 24, padding: '0 8px', background: '#fff', border: '1px solid #d1d5db', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>평일 운영</span>
            </div>
            <div style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.8 }}>
              <div>평일 : 10:00 ~ 17:00 (주말 공휴일 휴무)</div>
              <div>점심 : 12:00 ~ 13:00</div>
              <div>당일 주문 마감 : 11:00</div>
            </div>
          </div>

          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', background: '#374151', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 12 }}>PAYMENT</span>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>결제 / 인증</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ height: 24, padding: '0 8px', background: '#111827', color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800 }}>SAFE PAY</span>
              <span style={{ height: 24, padding: '0 8px', background: '#fff', border: '1px solid #d1d5db', color: '#4b5563', display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>보안 인증</span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {paymentBadges.map((badge, index) => (
                <span key={badge} style={{ border: '1px solid #d1d5db', background: '#fff', padding: '12px 14px', fontSize: 13, fontWeight: 800, color: '#111827', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: index % 2 === 0 ? '#eff6ff' : '#fff1f2', display: 'grid', placeItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: index % 2 === 0 ? '#2563eb' : '#d91f29', display: 'block' }} />
                  </span>
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>FAMILY</span>
            <details style={{ position: 'relative' }}>
              <summary style={{ border: '1px solid #d1d5db', background: '#fff', height: 40, display: 'flex', alignItems: 'center', padding: '0 14px', minWidth: 190, justifyContent: 'space-between', listStyle: 'none', cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ fontSize: 14, color: '#111827' }}>패밀리사이트</span>
                <span style={{ fontSize: 12 }}>▾</span>
              </summary>
              <ul style={{ position: 'absolute', left: 0, bottom: 44, margin: 0, padding: '10px 0', listStyle: 'none', width: 220, background: '#fff', border: '1px solid #d1d5db', boxShadow: '0 12px 26px rgba(15, 23, 42, 0.08)' }}>
                {familySites.map((site) => (
                  <li key={site}>
                    <a href="#" style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#111827', textDecoration: 'none' }}>{site}</a>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', background: '#d91f29', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>SOCIAL</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {socials.map((item, index) => (
                <span key={item} style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #d1d5db', display: 'grid', placeItems: 'center' }}>
                  <span style={{ width: 14, height: 14, borderRadius: index % 2 === 0 ? 5 : '50%', background: index % 2 === 0 ? '#111827' : '#d91f29', display: 'block' }} />
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ border: '1px solid #d1d5db', background: '#fff', padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>안전결제</span>
              <span style={{ border: '1px solid #d1d5db', background: '#fff', padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>고객지원</span>
              <span style={{ border: '1px solid #d1d5db', background: '#fff', padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>사업자전용</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', padding: '18px 0', background: '#efefef' }}>
        <div style={{ width: 1472, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#6b7280' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>LEGAL</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', background: '#fff', border: '1px solid #d1d5db', color: '#4b5563', fontSize: 11, fontWeight: 800 }}>VERIFIED</span>
            <span>Copyright © 2023 서브큐 all rights reserved.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#4b5563' }}>통신판매업신고 2016-성남분당-0530</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>개인정보보호 책임자 이재헌</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontWeight: 700, color: '#374151' }}>serveq@samyang.com</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontWeight: 700, color: '#374151' }}>사업자등록번호 781-85-00412</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageSectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <section style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
      <div style={{ width: 1472, margin: '0 auto', padding: '36px 0' }}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: '-0.04em' }}>{title}</h1>
        {description ? <p style={{ margin: '10px 0 0', color: '#6b7280', fontSize: 15 }}>{description}</p> : null}
      </div>
    </section>
  );
}

export function SitePageFrame({ children, title, description }: { children: ReactNode; title?: string; description?: string }) {
  return (
    <main style={{ minWidth: 1472, background: '#fff', paddingBottom: 80 }}>
      <SiteHeader />
      {title ? <PageSectionTitle title={title} description={description} /> : null}
      {children}
      <SiteFooter />
    </main>
  );
}
