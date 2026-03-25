# SPEC GIAO VIỆC: XÂY NỀN TẢNG ECOMMERCE BẰNG NEXT.JS

## 1) Mục tiêu tổng thể

Xây một nền tảng web bán hàng bằng **Next.js** có chức năng tương đương **WordPress + WooCommerce** ở mức production cơ bản, nhưng kiến trúc phải theo hướng:

- **1 commerce core dùng chung**
- **nhiều frontend template / theme khác nhau**
- thay giao diện mà **không phải viết lại backend**
- có thể dùng để triển khai nhiều site bán hàng khác nhau sau này

Nói ngắn:
> Xây một hệ thống ecommerce headless/modular, không phải một website đơn lẻ.

---

## 2) Mục tiêu kỹ thuật bắt buộc

Hệ thống phải có khả năng:

- quản lý sản phẩm
- quản lý danh mục
- sản phẩm biến thể
- tồn kho
- giá / sale price
- giỏ hàng
- checkout
- tạo đơn hàng
- quản lý đơn hàng
- coupon / discount cơ bản
- thanh toán COD + chuyển khoản thủ công
- tài khoản khách hàng
- trang nội dung cơ bản
- SEO cơ bản
- admin panel
- theme/template switching

---

## 3) Yêu cầu kiến trúc

### 3.1 Kiến trúc tổng thể
Phải tách thành các lớp:

1. **Commerce Core**
   - chứa logic nghiệp vụ ecommerce
   - không phụ thuộc UI

2. **Admin App**
   - dùng để quản trị dữ liệu và cấu hình site

3. **Storefront Layer**
   - lớp frontend public cho khách mua hàng

4. **Theme/Template Layer**
   - cho phép nhiều giao diện khác nhau dùng cùng 1 core

### 3.2 Nguyên tắc bắt buộc
- không viết kiểu “1 template = 1 hệ thống riêng”
- không để business logic nằm trong component UI
- không để frontend query DB tùy tiện
- phải có data contract rõ giữa core và theme
- ưu tiên extensibility hơn hack nhanh

---

## 4) Tech stack bắt buộc

### Frontend / fullstack
- Next.js 15
- TypeScript
- App Router
- Server Actions khi hợp lý
- TailwindCSS
- shadcn/ui hoặc component system tương đương

### Backend / data
- PostgreSQL
- Prisma ORM

### Auth
- Auth.js / NextAuth hoặc giải pháp tương đương
- hỗ trợ admin auth + customer auth

### Upload / media
- thiết kế abstraction để sau này dùng:
  - local storage
  - S3
  - Cloudflare R2
  - MinIO

---

## 5) Cấu trúc repo đề xuất

Ưu tiên **monorepo**.

### Cấu trúc mong muốn
- `apps/admin`
- `apps/storefront-default`
- `apps/storefront-minimal` hoặc placeholder theme app
- `packages/core`
- `packages/db`
- `packages/ui`
- `packages/theme-sdk`
- `packages/config`
- `packages/integrations`

Nếu chưa cần nhiều storefront ngay, vẫn phải thiết kế để sau thêm được dễ dàng.

---

## 6) Chức năng phase 1 bắt buộc phải làm

### 6.1 Admin
- login admin
- dashboard đơn giản
- CRUD sản phẩm
- CRUD danh mục
- xem danh sách đơn hàng
- xem chi tiết đơn hàng
- cấu hình site cơ bản

### 6.2 Catalog
- sản phẩm đơn
- sản phẩm có slug
- ảnh đại diện
- giá thường / giá sale
- mô tả
- tồn kho
- trạng thái publish/draft
- danh mục

### 6.3 Storefront
- homepage cơ bản
- product listing
- product detail
- category page
- add to cart
- cart page
- checkout page
- order success page

### 6.4 Checkout
- guest checkout
- thông tin khách hàng
- địa chỉ giao hàng
- phương thức thanh toán:
  - COD
  - chuyển khoản thủ công
- tạo order thành công trong DB

### 6.5 Orders
- tạo đơn hàng
- lưu line items
- subtotal
- shipping
- discount
- total
- trạng thái:
  - pending
  - confirmed
  - paid
  - processing
  - completed
  - cancelled

### 6.6 Theme foundation
- có **theme contract v1**
- storefront hiện tại phải tuân theo contract
- có khả năng thêm template khác mà không đập core

---

## 7) Chức năng phase 2 sẽ làm tiếp
Không cần full ở phase đầu, nhưng kiến trúc phải mở sẵn cho:

- product variants
- attributes
- coupon rules nâng cao
- shipping zones
- customer accounts
- wishlist
- reviews
- blog/pages
- menu builder
- media manager
- SEO nâng cao
- payment gateway adapter
- shipping provider adapter
- multi-theme switching hoàn chỉnh

---

## 8) Theme system bắt buộc phải thiết kế ngay từ đầu

### 8.1 Theme contract v1
Cần định nghĩa rõ:
- layout slots
- page types
- product card data shape
- collection page data shape
- homepage section shape
- menu/footer config shape
- site config shape

### 8.2 Theme data contract
Mọi storefront template phải consume dữ liệu đã chuẩn hóa như:
- product summary
- product detail
- category tree
- cart summary
- checkout summary
- homepage sections

Không để mỗi theme tự invent data shape riêng.

### 8.3 Theme registry
Phải thiết kế để sau này có thể đăng ký nhiều theme:
- `default-commerce`
- `minimal-shop`
- `fashion-store`
- `electronics-store`

Chưa cần build hết, nhưng phải có chỗ cắm.

---

## 9) Core modules cần có

Cu Li phải tách business logic thành các module rõ ràng:

- `catalog`
- `categories`
- `pricing`
- `inventory`
- `cart`
- `checkout`
- `orders`
- `customers`
- `content`
- `themes`
- `seo`
- `payments`
- `shipping`

Mỗi module cần:
- domain model
- service layer
- validation
- data access layer rõ ràng

---

## 10) Database schema v1 cần có

Các bảng / entity tối thiểu:

- users
- customer_profiles
- addresses
- products
- product_images
- categories
- product_categories
- inventory
- carts
- cart_items
- orders
- order_items
- payments
- coupons
- pages
- settings
- themes
- theme_configs

Nên chuẩn bị chỗ mở rộng cho:
- product_variants
- attributes
- reviews
- media
- menu_items
- posts
- shipments
- audit_logs

---

## 11) Yêu cầu code quality

- TypeScript strict
- code có module boundaries rõ
- không duplicate logic giữa admin và storefront
- schema validation rõ ràng
- dùng reusable UI components
- naming nhất quán
- không hardcode business logic vào template
- phải seed data dev được

---

## 12) Yêu cầu vận hành

Cu Li phải chuẩn bị tối thiểu:

- `.env.example`
- setup database local
- migrate schema
- seed demo data
- script dev
- script build
- script lint
- script typecheck

Nếu làm monorepo:
- workspace config rõ
- docs chạy local ngắn gọn

---

## 13) Deliverables bắt buộc

Cu Li phải trả ra các đầu việc sau:

### Deliverable 1 — Kiến trúc
- đề xuất cấu trúc monorepo
- giải thích boundaries giữa apps/packages
- giải thích flow dữ liệu giữa core ↔ storefront ↔ admin ↔ themes

### Deliverable 2 — DB schema v1
- Prisma schema
- migration đầu tiên
- seed data cơ bản

### Deliverable 3 — Theme contract v1
- định nghĩa interface/type rõ ràng
- chứng minh storefront-default dùng contract này

### Deliverable 4 — Foundation code
- admin app scaffold
- storefront app scaffold
- core package scaffold
- db package scaffold

### Deliverable 5 — Commerce MVP
- CRUD product/category
- storefront listing/detail
- cart
- checkout
- order creation

---

## 14) Definition of Done cho phase đầu

Phase đầu chỉ được coi là xong khi:

- admin login được
- admin tạo sản phẩm được
- admin tạo danh mục được
- storefront hiển thị danh sách sản phẩm được
- trang chi tiết sản phẩm chạy được
- thêm vào giỏ được
- checkout được
- tạo đơn hàng thành công vào DB
- admin xem được đơn hàng
- có ít nhất 1 theme storefront hoàn chỉnh
- có foundation để thêm theme thứ 2 mà không sửa core

---

## 15) Thứ tự thực hiện bắt buộc

Cu Li phải làm theo thứ tự này:

### Bước 1
Chốt:
- monorepo structure
- package boundaries
- module boundaries

### Bước 2
Thiết kế:
- Prisma schema v1
- theme contract v1
- storefront normalized data shape

### Bước 3
Scaffold:
- apps
- packages
- auth
- db
- seed

### Bước 4
Làm MVP:
- catalog
- product detail
- cart
- checkout
- orders
- admin CRUD

### Bước 5
Hardening:
- validation
- error handling
- SEO base
- env docs
- dev scripts

Không được nhảy vào code full UI trước khi chốt architecture.

---

## 16) Những thứ không được làm

- không code kiểu copy-paste logic giữa nhiều template
- không trộn admin logic vào storefront
- không làm schema rối theo kiểu WordPress meta tables
- không buộc theme phụ thuộc trực tiếp DB schema
- không tối ưu payment/shipping nâng cao quá sớm
- không làm “nhiều giao diện” bằng cách clone nguyên app

---

## 17) Output format Cu Li phải trả về

Mỗi lần làm, Cu Li phải báo theo format ngắn:

### Khi bắt đầu
- scope đang làm
- file sẽ tạo/sửa
- quyết định kiến trúc nếu có

### Khi xong mỗi chặng
- đã xong gì
- file nào đã tạo/sửa
- blocker gì còn lại
- bước tiếp theo là gì

Không trả lời lan man. Không scope-creep.

---

## 18) Prompt giao việc ngắn để gửi cho Cu Li

Dùng nguyên đoạn này:

---

**Nhiệm vụ của mày:**

Xây một nền tảng ecommerce bằng Next.js có chức năng tương đương WordPress + WooCommerce ở mức production cơ bản, nhưng kiến trúc phải modular/headless để 1 commerce core có thể dùng chung cho nhiều frontend template/theme khác nhau.

**Yêu cầu bắt buộc:**
- monorepo
- Next.js + TypeScript + App Router
- PostgreSQL + Prisma
- admin app + storefront app + shared core packages
- theme system tách khỏi business logic
- normalized storefront data contract
- phase đầu phải có:
  - admin login
  - CRUD sản phẩm
  - CRUD danh mục
  - storefront listing/detail
  - cart
  - checkout
  - order creation
  - admin order management
  - theme contract v1

**Thứ tự làm:**
1. chốt architecture
2. chốt schema DB v1
3. chốt theme contract v1
4. scaffold repo
5. code foundation
6. code MVP commerce flow

**Rule:**
- không code bừa trước khi chốt architecture
- không để business logic dính UI
- không clone logic cho từng template
- mọi thứ phải reusable
- báo cáo ngắn: đã làm gì / file nào / blocker / next

Bắt đầu bằng:
1. đề xuất cấu trúc monorepo
2. đề xuất Prisma schema v1
3. đề xuất theme contract v1
4. sau đó scaffold repo luôn
