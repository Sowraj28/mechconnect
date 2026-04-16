#!/bin/bash
set -e

echo "🚀 Setting up SewageConnect..."

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from https://nodejs.org"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "⚙️  Setting up environment..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your credentials:"
    echo "   1. DATABASE_URL  - Neon PostgreSQL URL (https://neon.tech)"
    echo "   2. NEXTAUTH_SECRET - Run: openssl rand -base64 32"
    echo "   3. Cloudinary credentials (https://cloudinary.com)"
    echo ""
    echo "Press Enter after editing .env.local to continue..."
    read
fi

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Setup complete! Starting development server..."
echo "   App: http://localhost:3000"
echo "   User: http://localhost:3000/auth/login"
echo "   Driver: http://localhost:3000/driver/login"
echo ""

npm run dev
