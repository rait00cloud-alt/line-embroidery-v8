# Line Embroidery 

A full-stack e-commerce prototype for designing and ordering custom embroidered caps. Customers pick a hat model, customize its color, and place text or artwork on the front, back, left, or right panels using an interactive 3D design studio — then check out with Stripe.

Built with Next.js (App Router), React Three Fiber, Supabase (Soon will be deprecated to PostgreSQL), and Stripe.

## Features

### 3D Design Studio
- Interactive 3D preview of five cap models: Trucker, Snapback, Five-panel, Dad-hat, and Trucker Hat (`src/components/Models/`)
- Place designs on four regions per product: front, left, right, and back
- Design assets: custom text, image uploads, and a public asset library
- Per-layer controls: position, rotation, scale, opacity, plus undo and layer management
- Product colorways (30+ colors per model) and HSL-based color customization

### AI Tools
- AI logo generation powered by Google Gemini (`FloatingLogoAI`, `LogoGeneratorPopup`, `api/gemini`)
- Automatic background removal for uploaded artwork via multiple engines: IMG.LY background removal, rembg-webgpu, TensorFlow BodyPix, and ONNX Runtime (`api/remove-bg`)

### Commerce
- Cart and multi-currency support with live exchange rates (`CurrencyProvider`, `useExchangeRate`)
- Stripe checkout with embedded flow, webhooks, and payment verification
- Shipping rates via Shippo (`api/shipping`)
- Coupons, order confirmation emails (Resend/Nodemailer), purchase history

### Accounts & Content
- Authentication (login, register, password reset) backed by Supabase
- Customer profile with orders, saved designs, addresses, and coupons
- Marketing pages: home, about, vintage collection, enterprise contact form
- Legal pages: terms and privacy policy

### Internationalization
- Locale-prefixed routes (`/en/...`, `/pt/...`) via next-intl
- Message files for English, Portuguese, Spanish, French, and Chinese in `src/messages/` (en and pt enabled in routing)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 18 |
| 3D | three.js, @react-three/fiber, @react-three/drei, three-mesh-bvh |
| Styling | Tailwind CSS 4, Framer Motion, lucide-react, Embla Carousel |
| Database / Auth | Supabase |
| Payments | Stripe (@stripe/react-stripe-js) |
| AI / ML | Google Gemini, OpenAI SDK, ONNX Runtime, TensorFlow.js |
| Email / Shipping | Resend, Nodemailer, Shippo |

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file with your keys (Supabase, Stripe, Gemini/OpenAI, Shippo, Resend).

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev     # start dev server (bound to 0.0.0.0)
npm run build   # production build
npm run start   # serve production build
npm run lint    # run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # localized pages (home, products, design studio,
│   │                      # cart, checkout, profile, auth, legal...)
│   └── api/               # route handlers (stripe, gemini, remove-bg,
│                          # shipping, exchange-rate, emails...)
├── components/
│   ├── Models/            # 3D cap models (trucker, snapback, dad-hat...)
│   ├── DesignPage/        # design studio canvas, sidebar, tools, layers
│   ├── Products/          # product cards and filters
│   ├── Checkout/, Cart/, Profile/, Login/, Register/
│   └── lib/               # supabase clients, design utils, model registry
├── contexts/              # cart state
├── data/                  # product catalog
├── hooks/                 # bg removal, textures, exchange rates
├── messages/              # i18n translations
├── types/                 # shared TypeScript types
└── utils/                 # helpers (scroll lock, device, color mapping)
```
