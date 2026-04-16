# SewageConnect 🚰

India's #1 platform for Sewage & Septic Tank Cleaning Services — JustDial-style marketplace for sewage truck operators.

## 🚀 Quick Start (Minimum Commands)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in credentials
cp .env.example .env.local
# Edit .env.local with your Neon DB URL, Cloudinary keys, etc.

# 3. Setup database
npx prisma generate && npx prisma db push

# 4. Run development server
npm run dev
```

Open http://localhost:3000

Or simply run the setup script:
```bash
chmod +x setup.sh && ./setup.sh
```

---

## 🌐 Pages Overview

| URL | Description |
|-----|-------------|
| `/` | Landing page (JustDial-style) |
| `/user/search` | Search listings with filters |
| `/user/dashboard` | User dashboard |
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/driver/login` | Driver login |
| `/driver/register` | Driver registration |
| `/driver/dashboard` | Driver dashboard |
| `/driver/vehicles` | Vehicle management |
| `/driver/revenue` | Revenue & expenses + PDF export |
| `/driver/reviews` | Customer reviews |
| `/driver/payments` | Payment & subscription |
| `/driver/settings` | Driver settings |

---

## 🛠️ Environment Setup

### 1. Neon PostgreSQL (Free)
1. Go to https://neon.tech
2. Create account → New Project → "sewageconnect"
3. Copy connection string → paste as `DATABASE_URL`

### 2. Cloudinary (Free)
1. Go to https://cloudinary.com
2. Dashboard → copy Cloud Name, API Key, Secret
3. Add to `.env.local`

### 3. NextAuth Secret
```bash
openssl rand -base64 32
# Copy output → NEXTAUTH_SECRET
```

---

## 🏗️ Features

### User Side
- 🔍 JustDial-style search with city/service filters
- 📱 Verified operator profiles with photos & reviews
- 📞 Call/WhatsApp operators (requires login)
- ⭐ Review system with star ratings
- 🔐 Login/Register required for contact info

### Driver Side  
- 📊 Dashboard with stats, revenue charts, booking history
- 🚛 Multi-vehicle management (individual or organization)
- 💰 Revenue tracking per vehicle with PDF export
- ⭐ Customer reviews page
- 💳 Subscription payments (₹99/month or ₹999/year per vehicle)
- 🔔 Real-time notifications
- 🔗 Google Form link per vehicle for work completion

### Pricing
- Monthly: ₹99/vehicle/month
- Annual: ₹999/vehicle/year
- Payment bypassed in demo mode

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Vercel Environment Variables to Set:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your vercel URL)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, React
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Images**: Cloudinary
- **Charts**: Recharts
- **PDF**: jsPDF + AutoTable
- **Hosting**: Vercel

---

## 📁 Project Structure

```
sewage-app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/login/           # User auth
│   ├── auth/register/
│   ├── user/                 # User section
│   │   ├── layout.tsx        # User navbar
│   │   ├── dashboard/
│   │   └── search/           # JustDial-style listings
│   ├── driver/               # Driver section
│   │   ├── layout.tsx        # Driver sidebar
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── revenue/          # PDF export
│   │   ├── reviews/
│   │   ├── payments/
│   │   └── settings/
│   └── api/                  # API routes
│       ├── auth/
│       ├── drivers/
│       ├── vehicles/
│       ├── bookings/
│       ├── reviews/
│       ├── payments/
│       ├── revenue/
│       └── notifications/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

---

## 📝 Google Forms Integration

For each vehicle, drivers should:
1. Create a Google Form with fields: Area, Cost, Fuel Expense, Driver Salary, Other Expense, Work Description
2. Copy the form link
3. Paste it in the vehicle settings on SewageConnect

Customers/drivers fill this form after each job completion, which auto-notifies the owner.

---

## 🤝 Support

Contact: support@sewageconnect.in
