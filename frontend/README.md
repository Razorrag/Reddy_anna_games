# Reddy Anna Gaming Portal - Frontend

Modern, responsive frontend for the Reddy Anna gaming platform with **Royal Indian Theme**.

## 🎨 Royal Theme Features

- **Deep Blue/Indigo Backgrounds** - Luxurious dark royal backgrounds
- **Gold Accents** - Shimmering gold text and highlights
- **Neon Aqua Glow** - Interactive elements with cyan glow effects
- **Rich Brown Game Table** - Traditional poker table aesthetic
- **Warm Earth Tones** - Orange, maroon, and teal accents

## 🚀 Tech Stack

- **React 18.3** - Latest React with concurrent features
- **TypeScript 5.6** - Full type safety
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling with custom royal theme
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management
- **Socket.IO Client** - Real-time WebSocket communication
- **Wouter** - Lightweight routing
- **Radix UI** - Accessible component primitives
- **Sonner** - Beautiful toast notifications

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── game/        # Game-specific components
│   │   ├── auth/        # Authentication components
│   │   └── common/      # Common components
│   ├── layouts/         # Page layouts
│   │   ├── PlayerLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── PartnerLayout.tsx
│   ├── pages/           # Page components
│   │   ├── public/      # Public pages (landing)
│   │   ├── auth/        # Login/signup pages
│   │   ├── player/      # Player dashboard & game
│   │   ├── admin/       # Admin panel pages
│   │   └── partner/     # Partner portal pages
│   ├── store/           # Zustand stores
│   │   ├── authStore.ts
│   │   ├── gameStore.ts
│   │   ├── userStore.ts
│   │   └── partnerStore.ts
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useGame.ts
│   │   ├── useWebSocket.ts
│   │   └── queries/     # TanStack Query hooks
│   ├── lib/             # Utility functions
│   │   ├── api.ts       # API client
│   │   ├── socket.ts    # WebSocket client
│   │   └── utils.ts     # Helper functions
│   ├── types/           # TypeScript types
│   │   ├── api.ts
│   │   ├── game.ts
│   │   └── user.ts
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles with royal theme
├── .env.example         # Environment variables template
├── index.html           # HTML entry point
├── package.json         # Dependencies
├── tailwind.config.ts   # Tailwind configuration with royal theme
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🎯 Features

### Player Features (10 pages)
- 🎮 **Game Room** - Live Andar Bahar with video stream
- 📊 **Dashboard** - Overview of stats and balance
- 👤 **Profile** - User profile management
- 💰 **Wallet** - Main balance + bonus balance
- 📜 **Transactions** - Complete transaction history
- 🎁 **Bonuses** - View and manage bonuses
- 🔗 **Referral** - Referral code and earnings
- 📖 **Game History** - Personal betting history
- 💳 **Deposit** - WhatsApp-based deposit requests
- 💸 **Withdraw** - Withdrawal requests

### Admin Features (15 pages)
- 📊 **Dashboard** - Real-time analytics
- 👥 **Users** - User management
- 🎮 **Game Control** - Control game rounds
- 💰 **Deposits** - Approve/reject deposits
- 💸 **Withdrawals** - Process withdrawals
- 🎁 **Bonuses** - Bonus management
- 🤝 **Partners** - Partner management
- 📈 **Analytics** - Detailed analytics
- 📑 **Reports** - Generate reports
- 📖 **Game History** - All game history
- 💳 **Transactions** - All transactions
- ⚙️ **Settings** - System settings
- 🎥 **Stream Settings** - OvenMediaEngine config

### Partner Features (6 pages)
- 📊 **Dashboard** - Earnings overview
- 👤 **Profile** - Partner profile
- 👥 **Players** - Referred players list
- 💸 **Withdrawals** - Withdrawal management
- 💰 **Commissions** - Commission tracking
- 📖 **Game History** - Player game history

## 🎨 Custom Tailwind Classes

### Backgrounds
- `bg-royal-gradient` - Royal blue gradient
- `bg-gold-gradient` - Gold gradient
- `bg-neon-gradient` - Neon cyan gradient

### Buttons
- `btn-gold` - Gold accent button
- `btn-neon` - Neon cyan button with glow
- `btn-andar` - ANDAR button (warm orange)
- `btn-bahar` - BAHAR button (cyan)

### Text Effects
- `text-gold-shimmer` - Animated gold shimmer
- `text-glow-gold` - Gold glow effect
- `text-glow-cyan` - Cyan glow effect

### Components
- `card-royal` - Royal-themed card
- `input-royal` - Styled input field
- `chip` - Betting chip display
- `playing-card` - Playing card component
- `game-table` - Game table surface
- `balance-display` - Balance widget
- `timer-countdown` - Timer display
- `winner-announce` - Winner announcement

### Animations
- `animate-pulse-gold` - Gold pulsing animation
- `animate-pulse-neon` - Neon pulsing animation
- `animate-shimmer` - Shimmer effect
- `animate-glow` - Glow animation
- `animate-float` - Floating animation

## 🔧 Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_STREAM_URL=ws://localhost:3333/app/stream
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 API Integration

The frontend connects to the backend API at `http://localhost:3000`:

### REST API Endpoints
- Authentication: `/api/auth/*`
- User Management: `/api/users/*`
- Game Management: `/api/games/*`
- Betting: `/api/bets/*`
- Partner System: `/api/partners/*`
- Bonus System: `/api/bonuses/*`
- Payments: `/api/payments/*`

### WebSocket Events
- **Player Events:** `join`, `leave`, `place_bet`, `cancel_bet`
- **Admin Events:** `create_round`, `start_round`, `close_betting`, `deal_cards`, `process_payouts`
- **Broadcasts:** `round_update`, `winner_announce`, `balance_update`

## 🎮 Game Flow

1. **Join Game Room** - Connect via WebSocket
2. **Place Bets** - 30-second betting window
3. **Watch Live Stream** - OvenMediaEngine video feed
4. **Real-time Updates** - WebSocket broadcasts
5. **Winner Announcement** - Celebrate wins
6. **Balance Update** - Instant balance updates

## 🔐 Authentication

- **JWT-based** authentication
- Tokens stored in localStorage
- Automatic token refresh
- Protected routes with auth guards

## 📱 Responsive Design

- **Mobile-first** approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Touch-optimized betting interface
- Adaptive layouts for all screen sizes

## 🎨 Theme Customization

Colors are defined in [`tailwind.config.ts`](tailwind.config.ts):

```typescript
colors: {
  royal: {
    dark: '#0A0E27',      // Deep navy background
    medium: '#1A1F3A',    // Card backgrounds
    light: '#2A3154',     // Hover states
  },
  gold: {
    DEFAULT: '#FFD700',   // Pure gold
    light: '#FFE55C',     // Light gold
    dark: '#B8860B',      // Dark gold
  },
  neon: {
    cyan: '#00F5FF',      // Bright cyan
    aqua: '#00E5FF',      // Aqua buttons
    blue: '#00D4FF',      // Blue glow
  },
}
```

## 🚀 Deployment

### Docker Deployment

Frontend is included in the main `docker-compose.yml`:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend
```

### Production Build

```bash
npm run build
```

Build output will be in `dist/` directory.

## 📊 Performance

- **Code Splitting** - Automatic route-based code splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Optimized images
- **Caching** - Aggressive caching strategy
- **Bundle Size** - Optimized bundle size

## 🐛 Debugging

- **React DevTools** - Browser extension for React debugging
- **TanStack Query DevTools** - Built-in query debugging (dev mode)
- **Console Logging** - Structured logging
- **Error Boundaries** - Graceful error handling

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow ESLint rules
- Use functional components with hooks
- Prefer composition over inheritance

### State Management
- Use Zustand for client state
- Use TanStack Query for server state
- Keep components stateless when possible

### Naming Conventions
- Components: `PascalCase` (e.g., `GameRoom.tsx`)
- Files: `camelCase` for utilities, `PascalCase` for components
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## 🔗 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Database Schema](../backend/src/db/schema.ts)
- [WebSocket Events](../backend/src/websocket/game-flow.ts)
- [Deployment Guide](../BUILD_AND_RUN.md)

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues and questions, contact the development team.