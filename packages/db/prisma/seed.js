const bcrypt = require('bcryptjs');
const { PrismaClient, ProductStatus, PaymentMethodCode, OrderStatus, CouponType } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@culi.local' },
    update: { role: 'ADMIN', name: 'Admin', passwordHash: await bcrypt.hash('dev-only', 10) },
    create: {
      email: 'admin@culi.local',
      name: 'Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('dev-only', 10),
    },
  });

  const catSkincare = await prisma.category.upsert({
    where: { slug: 'skincare' },
    update: { name: 'Skincare' },
    create: { slug: 'skincare', name: 'Skincare', description: 'Chăm sóc da' },
  });

  const catSupplements = await prisma.category.upsert({
    where: { slug: 'supplements' },
    update: { name: 'Supplements' },
    create: { slug: 'supplements', name: 'Supplements', description: 'Thực phẩm bổ sung' },
  });

  const serum = await prisma.product.upsert({
    where: { slug: 'vitamin-c-serum' },
    update: {
      title: 'Vitamin C Serum',
      status: ProductStatus.PUBLISHED,
      price: 320000,
      salePrice: 280000,
      excerpt: 'Serum sáng da cơ bản',
      description: '<p>Vitamin C serum cho routine hằng ngày.</p>',
    },
    create: {
      slug: 'vitamin-c-serum',
      sku: 'SERUM-001',
      title: 'Vitamin C Serum',
      excerpt: 'Serum sáng da cơ bản',
      description: '<p>Vitamin C serum cho routine hằng ngày.</p>',
      status: ProductStatus.PUBLISHED,
      currency: 'VND',
      price: 320000,
      salePrice: 280000,
    },
  });

  const collagen = await prisma.product.upsert({
    where: { slug: 'marine-collagen' },
    update: {
      title: 'Marine Collagen',
      status: ProductStatus.PUBLISHED,
      price: 540000,
      excerpt: 'Collagen cơ bản phase 1',
      description: '<p>Marine collagen dạng bột.</p>',
    },
    create: {
      slug: 'marine-collagen',
      sku: 'COLLAGEN-001',
      title: 'Marine Collagen',
      excerpt: 'Collagen cơ bản phase 1',
      description: '<p>Marine collagen dạng bột.</p>',
      status: ProductStatus.PUBLISHED,
      currency: 'VND',
      price: 540000,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: serum.id, url: 'https://placehold.co/800x800?text=Serum', alt: 'Vitamin C Serum', position: 0 },
      { productId: collagen.id, url: 'https://placehold.co/800x800?text=Collagen', alt: 'Marine Collagen', position: 0 },
    ],
    skipDuplicates: true,
  });

  const serumImage = await prisma.productImage.findFirst({ where: { productId: serum.id }, orderBy: { position: 'asc' } });
  const collagenImage = await prisma.productImage.findFirst({ where: { productId: collagen.id }, orderBy: { position: 'asc' } });
  await prisma.product.update({ where: { id: serum.id }, data: { featuredImageId: serumImage?.id } });
  await prisma.product.update({ where: { id: collagen.id }, data: { featuredImageId: collagenImage?.id } });

  await prisma.inventory.upsert({ where: { productId: serum.id }, update: { quantity: 18, reserved: 0 }, create: { productId: serum.id, quantity: 18, reserved: 0 } });
  await prisma.inventory.upsert({ where: { productId: collagen.id }, update: { quantity: 7, reserved: 0 }, create: { productId: collagen.id, quantity: 7, reserved: 0 } });

  await prisma.productCategory.upsert({ where: { productId_categoryId: { productId: serum.id, categoryId: catSkincare.id } }, update: {}, create: { productId: serum.id, categoryId: catSkincare.id } });
  await prisma.productCategory.upsert({ where: { productId_categoryId: { productId: collagen.id, categoryId: catSupplements.id } }, update: {}, create: { productId: collagen.id, categoryId: catSupplements.id } });

  await prisma.setting.upsert({
    where: { scope_key: { scope: 'site', key: 'general' } },
    update: { value: { siteName: 'Culi Commerce Demo', currency: 'VND', contactEmail: 'hello@culi.local' } },
    create: { scope: 'site', key: 'general', value: { siteName: 'Culi Commerce Demo', currency: 'VND', contactEmail: 'hello@culi.local' } },
  });

  const theme = await prisma.theme.upsert({
    where: { key: 'default-commerce' },
    update: { isActive: true, name: 'Default Commerce', version: '0.1.0' },
    create: { key: 'default-commerce', name: 'Default Commerce', version: '0.1.0', isActive: true },
  });

  await prisma.themeConfig.upsert({
    where: { themeId_scope_configKey: { themeId: theme.id, scope: 'default', configKey: 'home.sections' } },
    update: { value: [{ id: 'hero-1', type: 'hero', headline: 'Demo storefront', body: 'Foundation ready' }, { id: 'featured-1', type: 'featuredProducts', headline: 'Best sellers' }] },
    create: { themeId: theme.id, scope: 'default', configKey: 'home.sections', value: [{ id: 'hero-1', type: 'hero', headline: 'Demo storefront', body: 'Foundation ready' }, { id: 'featured-1', type: 'featuredProducts', headline: 'Best sellers' }] },
  });

  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: { type: CouponType.PERCENTAGE, value: 10, isActive: true }, create: { code: 'WELCOME10', type: CouponType.PERCENTAGE, value: 10, isActive: true } });
  await prisma.coupon.upsert({ where: { code: 'SAVE50000' }, update: { type: CouponType.FIXED_AMOUNT, value: 50000, isActive: true, minimumSubtotal: 300000 }, create: { code: 'SAVE50000', type: CouponType.FIXED_AMOUNT, value: 50000, isActive: true, minimumSubtotal: 300000 } });

  const address = await prisma.address.create({
    data: {
      userId: admin.id,
      fullName: 'Cherry Demo',
      phone: '0900000000',
      line1: '123 Demo Street',
      city: 'Ho Chi Minh City',
      countryCode: 'VN',
      isDefault: true,
    },
  });

  const existingDemo = await prisma.order.findFirst({ where: { email: 'customer@culi.local' } });
  if (!existingDemo) {
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-DEMO-${Date.now()}`,
        userId: admin.id,
        email: 'customer@culi.local',
        phone: '0900000001',
        status: OrderStatus.PENDING,
        currency: 'VND',
        subtotal: 280000,
        shippingTotal: 30000,
        discountTotal: 0,
        total: 310000,
        paymentMethod: PaymentMethodCode.COD,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        items: { create: [{ productId: serum.id, sku: 'SERUM-001', productName: 'Vitamin C Serum', productSlug: 'vitamin-c-serum', quantity: 1, unitPrice: 280000, lineTotal: 280000 }] },
        payments: { create: [{ method: PaymentMethodCode.COD, amount: 310000 }] },
      },
    });
    console.log('Seeded order:', order.orderNumber);
  }

  console.log('Seeded admin:', admin.email);
  console.log('Seeded products:', serum.slug, collagen.slug);
  console.log('Seeded coupons: WELCOME10 SAVE50000');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
