# Asset Migration & Component Extraction Plan

## ✅ Assets Copied (16 files)

### Images & Media
1. **Flash Screen** - `flash_screen.jpeg` (Full-screen loading image)
2. **Video Streams** - `uhd_30fps.mp4` (3 copies in different folders)

### Betting Chips (8 PNG images)
- `coins/2500.png`
- `coins/5000.png`
- `coins/10000.png`
- `coins/20000.png`
- `coins/30000.png`
- `coins/40000.png`
- `coins/50000.png`
- `coins/100000.png`
- `coins/Select Coins.png`

### Playing Cards (3 samples - Need Full Deck)
- `cards/D7.png` (Diamond 7)
- `cards/DJ.png` (Diamond Jack)
- `cards/DQ.png` (Diamond Queen)

**⚠️ IMPORTANT:** We need to get ALL 52 card images from legacy system or generate them.

## 📋 Legacy Components to Extract & Upgrade

### Priority 1: Core Game Components (Must Have)
1. ✅ **FlashScreenOverlay** (84 lines) - Loading screen with flash image
   - Uses `/flash_screen.jpeg`
   - Gold spinner animation
   - Progress bar with shimmer effect
   - Auto-dismisses after duration
   
2. ✅ **BettingChip** (82 lines) - Interactive betting chips
   - Uses coin images from `/coins/`
   - Hover and selection animations
   - Image fallback to text
   - Amount formatting (₹100k, ₹2.5k, etc.)

3. ✅ **PlayingCard** (60 lines) - Card display component
   - Displays rank and suit
   - Multiple sizes (sm, md, lg, xl)
   - Winning animation (gold ring)
   - White background with border

4. ✅ **CircularTimer** (44 lines) - Countdown timer
   - Shows remaining betting seconds
   - Gold border with pulsing animation
   - Phase-aware display
   - Centered overlay

5. ✅ **LoadingSpinner** (121 lines) - Multiple loading components
   - Basic spinner
   - LoadingOverlay component
   - LoadingButton component
   - Customizable size and color

### Priority 2: Game UI Components
6. **CardDealAnimation** - Card dealing animations
7. **CardGrid** - Grid layout for cards
8. **RoundTransition** - Round start/end transitions
9. **NoWinnerTransition** - No winner announcement
10. **RoundNotification** - Round status notifications
11. **UserBetsDisplay** - Display user's active bets
12. **GameHistoryModal** - Game history popup
13. **LiveBetMonitoring** - Real-time bet feed

### Priority 3: User Interface Components
14. **Navbar** - Top navigation bar
15. **MobileMenu** - Mobile navigation
16. **Footer** - Bottom footer
17. **Breadcrumb** - Navigation breadcrumbs
18. **WebSocketStatus** - Connection status indicator
19. **PersistentSidePanel** - Side panel for game info

### Priority 4: Admin Components
20. **AdminLayout** - Admin panel layout
21. **AdminDashboard/** - Dashboard components
22. **AdminGamePanel/** - Game control panel
23. **AnalyticsDashboard** - Analytics visualization
24. **LiveAnalyticsTicker** - Real-time analytics
25. **UserDetailsModal** - User info popup
26. **UserBalanceModal** - Balance management
27. **UserPasswordModal** - Password reset

### Priority 5: Forms & Modals
28. **WalletModal** - Deposit/withdraw modal
29. **Form/** - Form components
30. **Button/** - Button components

### Priority 6: Auth & Protection
31. **ProtectedRoute** - Player route guard
32. **ProtectedAdminRoute** - Admin route guard
33. **ProtectedPartnerRoute** - Partner route guard

### Priority 7: Additional Features
34. **WhatsAppFloatButton** - WhatsApp support button
35. **LanguageSelector** - Language switcher
36. **ThemeGuide** - Theme documentation
37. **GameRules/** - Game rules display
38. **HeroSection/** - Landing page hero
39. **ImageSlider/** - Image carousel
40. **About/** - About section
41. **Contact/** - Contact section
42. **Notification/** - Notification system
43. **UserProfile/** - User profile components
44. **Bonus/** - Bonus display components
45. **ErrorBoundary** - Error handling

## 🎨 Component Upgrade Strategy

For each legacy component, we'll:

### 1. **Adapt to Royal Theme**
- Replace colors with royal palette (gold, indigo, cyan)
- Add glow effects for interactive elements
- Enhance animations with shimmer and pulse

### 2. **Update Dependencies**
- Replace `@/lib/utils` with our utilities
- Update `@/types` imports to new types
- Use Zustand stores instead of context
- Integrate TanStack Query for data fetching

### 3. **Add TypeScript Strictness**
- Proper type definitions
- Remove `any` types
- Add JSDoc comments

### 4. **Enhance Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support

### 5. **Mobile Optimization**
- Touch-friendly sizes
- Responsive breakpoints
- Mobile-specific interactions

### 6. **Performance Optimization**
- Memoization where needed
- Lazy loading
- Code splitting

## 🔧 Missing Assets to Generate

### Playing Cards (49 missing)
Need to generate or source:
- **Hearts (♥):** A, 2-10, J, Q, K (13 cards)
- **Diamonds (♦):** A, 2-6, 8-10, K (10 cards - we have 7, J, Q)
- **Clubs (♣):** A, 2-10, J, Q, K (13 cards)
- **Spades (♠):** A, 2-10, J, Q, K (13 cards)

**Options:**
1. Extract from legacy if available
2. Generate using design tool
3. Use SVG card deck library
4. Create programmatic SVG cards

### Icons & Logos
- Crown icon (referenced in index.html)
- App logo
- Favicon set (16x16, 32x32, 192x192, 512x512)

## 📂 Component Organization

```
frontend/src/
├── components/
│   ├── game/                      # Game-specific components
│   │   ├── FlashScreenOverlay.tsx ✅
│   │   ├── BettingChip.tsx        ✅
│   │   ├── PlayingCard.tsx        ✅
│   │   ├── CircularTimer.tsx      ✅
│   │   ├── CardDealAnimation.tsx  📋
│   │   ├── CardGrid.tsx           📋
│   │   ├── RoundTransition.tsx    📋
│   │   ├── UserBetsDisplay.tsx    📋
│   │   ├── GameHistoryModal.tsx   📋
│   │   └── LiveBetMonitoring.tsx  📋
│   ├── common/                    # Reusable components
│   │   ├── LoadingSpinner.tsx     ✅
│   │   ├── Navbar.tsx             📋
│   │   ├── Footer.tsx             📋
│   │   ├── WebSocketStatus.tsx    📋
│   │   └── ErrorBoundary.tsx      📋
│   ├── admin/                     # Admin components
│   │   ├── AdminLayout.tsx        📋
│   │   ├── AnalyticsDashboard.tsx 📋
│   │   ├── UserDetailsModal.tsx   📋
│   │   └── LiveAnalyticsTicker.tsx 📋
│   ├── auth/                      # Auth components
│   │   ├── ProtectedRoute.tsx     📋
│   │   ├── LoginForm.tsx          📋
│   │   └── SignupForm.tsx         📋
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx             📋
│       ├── card.tsx               📋
│       ├── modal.tsx              📋
│       └── ... (more shadcn components)
```

## 🎯 Implementation Order

### Phase 1: Core Components (Next - Phase 12)
1. ✅ Copy FlashScreenOverlay
2. ✅ Copy BettingChip
3. ✅ Copy PlayingCard
4. ✅ Copy CircularTimer
5. ✅ Copy LoadingSpinner
6. Create utility functions (`cn`, `formatCurrency`, etc.)
7. Create type definitions

### Phase 2: Game Components (Phase 13)
1. CardDealAnimation
2. CardGrid
3. RoundTransition
4. UserBetsDisplay
5. GameHistoryModal

### Phase 3: Layout Components (Phase 13-14)
1. Navbar with royal theme
2. Footer with royal theme
3. AdminLayout
4. PlayerLayout (already in App.tsx)
5. PartnerLayout (already in App.tsx)

### Phase 4: Auth Components (Phase 14)
1. ProtectedRoute guards
2. Login form
3. Signup form
4. Password reset

### Phase 5: Admin Components (Phase 17)
1. AdminDashboard
2. AnalyticsDashboard
3. User modals
4. Game control panel

## 🎨 Theme Enhancements

Each component will be enhanced with:

### Visual Effects
- **Gold shimmer** on text
- **Neon cyan glow** on buttons
- **Pulse animations** on timers
- **Float animations** on chips
- **Fade transitions** on modals
- **Slide animations** on panels

### Shadows
- Gold glow shadows for buttons
- Neon cyan shadows for interactive elements
- Deep shadows for depth
- Inner shadows for inset effects

### Gradients
- Royal blue background gradients
- Gold text gradients
- Neon button gradients
- Card shimmer gradients

### Animations
- Smooth transitions (300ms)
- Bounce on hover
- Scale on active
- Rotate on loading
- Slide on panel open

## 📊 Progress Tracking

### Assets
- ✅ Flash screen (1/1)
- ✅ Betting chips (8/8)
- ⚠️ Playing cards (3/52) - **Need 49 more**
- ❌ Icons (0/5)

### Components Copied
- ✅ FlashScreenOverlay
- ✅ BettingChip
- ✅ PlayingCard
- ✅ CircularTimer
- ✅ LoadingSpinner
- ❌ Remaining ~40 components

### Components Adapted
- ❌ None yet (will adapt during Phase 12-13)

## 🚀 Next Steps

1. **Create utility functions** (`lib/utils.ts`, `lib/cn.ts`)
2. **Create type definitions** (`types/game.ts`, `types/user.ts`)
3. **Copy and adapt 5 core components** to new frontend
4. **Generate/source missing card images**
5. **Create crown icon and logos**
6. **Set up shadcn/ui components**
7. **Begin Phase 12: State Management**

---

**Status:** Assets copied, components identified, ready for extraction and upgrade.