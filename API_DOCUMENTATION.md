# 🔌 ANDAR BAHAR API DOCUMENTATION

**Version:** 1.0  
**Base URL:** `https://api.yourdomain.com`  
**WebSocket URL:** `wss://api.yourdomain.com`

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Game Management](#game-management)
4. [Betting Operations](#betting-operations)
5. [Admin Operations](#admin-operations)
6. [WebSocket Events](#websocket-events)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## 🔐 AUTHENTICATION

### Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "player123",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "referralCode": "REF123" // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "player123",
      "phone": "+919876543210",
      "balance": "0.00",
      "role": "player",
      "referralCode": "PLY123",
      "createdAt": "2025-12-19T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "player123",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "player123",
      "balance": "5000.00",
      "role": "player"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👤 USER MANAGEMENT

### Get User Profile

**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player123",
    "phone": "+919876543210",
    "balance": "5000.00",
    "role": "player",
    "referralCode": "PLY123",
    "totalBets": 25,
    "totalWins": 12,
    "totalLosses": 13,
    "winRate": 48.0,
    "createdAt": "2025-12-19T10:00:00.000Z"
  }
}
```

---

### Get Balance

**Endpoint:** `GET /api/users/balance`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "balance": "5000.00",
    "currency": "INR",
    "lastUpdated": "2025-12-19T10:30:00.000Z"
  }
}
```

---

### Get Transaction History

**Endpoint:** `GET /api/users/transactions`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Transaction type (deposit, bet, win, withdrawal)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "bet",
        "amount": "2500.00",
        "balanceBefore": "7500.00",
        "balanceAfter": "5000.00",
        "status": "completed",
        "description": "Bet placed on Andar for round 42",
        "createdAt": "2025-12-19T10:25:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

---

## 🎮 GAME MANAGEMENT

### Get Active Game

**Endpoint:** `GET /api/games/active`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Andar Bahar",
    "status": "active",
    "currentRound": {
      "id": "uuid",
      "roundNumber": 1,
      "status": "betting",
      "jokerCard": "KH",
      "bettingStartTime": "2025-12-19T10:30:00.000Z",
      "bettingEndTime": "2025-12-19T10:30:30.000Z",
      "totalAndarBets": "25000.00",
      "totalBaharBets": "30000.00",
      "currentCardPosition": 0,
      "expectedNextSide": "bahar"
    }
  }
}
```

---

### Get Current Round

**Endpoint:** `GET /api/games/:gameId/current-round`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "gameId": "uuid",
    "roundNumber": 1,
    "status": "betting",
    "jokerCard": "KH",
    "bettingStartTime": "2025-12-19T10:30:00.000Z",
    "bettingEndTime": "2025-12-19T10:30:30.000Z",
    "totalAndarBets": "25000.00",
    "totalBaharBets": "30000.00",
    "totalBetAmount": "55000.00",
    "currentCardPosition": 0,
    "expectedNextSide": "bahar",
    "cardsDealt": 0,
    "cards": []
  }
}
```

---

### Get Card Sequence

**Endpoint:** `GET /api/games/rounds/:roundId/cards`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "roundId": "uuid",
    "roundNumber": 1,
    "jokerCard": "KH",
    "cards": [
      {
        "id": "uuid",
        "card": "7D",
        "side": "bahar",
        "position": 1,
        "isWinningCard": false,
        "createdAt": "2025-12-19T10:30:35.000Z"
      },
      {
        "id": "uuid",
        "card": "QS",
        "side": "andar",
        "position": 2,
        "isWinningCard": false,
        "createdAt": "2025-12-19T10:30:40.000Z"
      }
    ]
  }
}
```

---

### Get Game History

**Endpoint:** `GET /api/games/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "roundNumber": 42,
        "betSide": "andar",
        "betAmount": "2500.00",
        "result": "won",
        "payoutAmount": "5000.00",
        "jokerCard": "KH",
        "winningCard": "KD",
        "winningSide": "andar",
        "createdAt": "2025-12-19T10:25:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 60
    }
  }
}
```

---

## 💰 BETTING OPERATIONS

### Place Bet

**Endpoint:** `POST /api/games/bet`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roundId": "uuid",
  "betSide": "andar",
  "amount": 2500
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "bet": {
      "id": "uuid",
      "userId": "uuid",
      "roundId": "uuid",
      "betSide": "andar",
      "amount": "2500.00",
      "status": "pending",
      "betRound": 1,
      "createdAt": "2025-12-19T10:30:15.000Z"
    },
    "balance": "7500.00"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance. Required: ₹2500, Available: ₹1000"
  }
}
```

---

### Undo Last Bet

**Endpoint:** `POST /api/games/undo-bet`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "betId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Bet undone successfully",
    "refundAmount": "2500.00",
    "newBalance": "10000.00"
  }
}
```

---

### Rebet Previous Round

**Endpoint:** `POST /api/games/rebet`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentRoundId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Bets replayed successfully",
    "betsPlaced": [
      {
        "id": "uuid",
        "betSide": "andar",
        "amount": "2500.00"
      },
      {
        "id": "uuid",
        "betSide": "bahar",
        "amount": "1000.00"
      }
    ],
    "totalAmount": "3500.00",
    "newBalance": "6500.00"
  }
}
```

---

### Double Bets

**Endpoint:** `POST /api/games/double-bets`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "roundId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Bets doubled successfully",
    "newBets": [
      {
        "id": "uuid",
        "betSide": "andar",
        "amount": "2500.00"
      }
    ],
    "totalAmount": "2500.00",
    "newBalance": "5000.00"
  }
}
```

---

## 🔧 ADMIN OPERATIONS

### Create New Round

**Endpoint:** `POST /api/admin/games/:gameId/new-round`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "openingCard": "KH"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "round": {
      "id": "uuid",
      "gameId": "uuid",
      "roundNumber": 43,
      "status": "betting",
      "jokerCard": "KH",
      "bettingStartTime": "2025-12-19T10:30:00.000Z",
      "bettingEndTime": "2025-12-19T10:30:30.000Z",
      "createdAt": "2025-12-19T10:30:00.000Z"
    }
  }
}
```

---

### Deal Card

**Endpoint:** `POST /api/admin/rounds/:roundId/deal-card`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "card": "7D",
  "side": "bahar"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "card": {
      "id": "uuid",
      "card": "7D",
      "side": "bahar",
      "position": 1,
      "isWinningCard": false
    },
    "progression": {
      "expectedNextSide": "andar",
      "nextPosition": 2,
      "shouldProgressToNextRound": false,
      "roundComplete": false
    }
  }
}
```

---

### Close Betting

**Endpoint:** `POST /api/admin/rounds/:roundId/close-betting`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Betting closed successfully",
    "roundId": "uuid",
    "totalBets": "55000.00",
    "totalAndarBets": "25000.00",
    "totalBaharBets": "30000.00"
  }
}
```

---

### Get Dashboard Stats

**Endpoint:** `GET /api/admin/dashboard`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "activeUsers": 85,
      "totalBets": "2500000.00",
      "totalPayouts": "2400000.00",
      "profit": "100000.00",
      "currentRound": 43
    },
    "recentGames": [
      {
        "roundNumber": 42,
        "winningSide": "andar",
        "totalBets": "55000.00",
        "totalPayouts": "52000.00",
        "profit": "3000.00"
      }
    ]
  }
}
```

---

## 🔌 WEBSOCKET EVENTS

### Connection

**URL:** `wss://api.yourdomain.com`

**Authentication:**
```javascript
const socket = io('wss://api.yourdomain.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

### Client → Server Events

#### Join Game

**Event:** `game:join`

**Payload:**
```json
{
  "gameId": "uuid"
}
```

**Response Event:** `game:joined`

---

#### Place Bet

**Event:** `game:bet_place`

**Payload:**
```json
{
  "roundId": "uuid",
  "betSide": "andar",
  "amount": 2500
}
```

**Response Event:** `game:bet_placed`

---

### Server → Client Events

#### Round Created

**Event:** `game:round_created`

**Payload:**
```json
{
  "round": {
    "id": "uuid",
    "roundNumber": 43,
    "jokerCard": "KH",
    "status": "betting"
  },
  "openingCard": "KH",
  "message": "New round started! Opening card: KH"
}
```

---

#### Betting Timer

**Event:** `game:betting_timer`

**Payload:**
```json
{
  "timeRemaining": 25,
  "totalDuration": 30
}
```

---

#### Betting Closed

**Event:** `game:betting_closed`

**Payload:**
```json
{
  "roundId": "uuid",
  "totalBets": "55000.00",
  "message": "Betting closed! Dealing cards..."
}
```

---

#### Card Dealt

**Event:** `game:card_dealt`

**Payload:**
```json
{
  "roundId": "uuid",
  "card": "7D",
  "side": "bahar",
  "position": 1,
  "isWinningCard": false,
  "expectedNextSide": "andar",
  "nextPosition": 2
}
```

---

#### Winner Declared

**Event:** `game:winner_declaration`

**Payload:**
```json
{
  "roundId": "uuid",
  "winningSide": "andar",
  "winningCard": "KD",
  "winnerDisplayText": "ANDAR WON",
  "totalCards": 5,
  "round": 1
}
```

---

#### Balance Updated

**Event:** `user:balance_updated`

**Payload:**
```json
{
  "balance": "10000.00",
  "change": "+5000.00",
  "reason": "Payout for Round 42"
}
```

---

#### Stats Updated

**Event:** `game:stats_updated`

**Payload:**
```json
{
  "roundId": "uuid",
  "totalAndarBets": "28000.00",
  "totalBaharBets": "32000.00",
  "totalBetAmount": "60000.00"
}
```

---

## ⚠️ ERROR HANDLING

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific field error"
    }
  }
}
```

---

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INSUFFICIENT_BALANCE` | 400 | User balance too low |
| `BETTING_CLOSED` | 400 | Betting phase has ended |
| `INVALID_BET_SIDE` | 400 | Bet side must be 'andar' or 'bahar' |
| `ROUND_NOT_FOUND` | 404 | Round does not exist |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🚦 RATE LIMITING

### Limits

| Endpoint Category | Requests per Minute | Burst |
|-------------------|---------------------|-------|
| Authentication | 5 | 10 |
| Game Operations | 30 | 50 |
| Betting Operations | 20 | 30 |
| Admin Operations | 60 | 100 |

### Rate Limit Headers

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 🔒 SECURITY

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Access tokens expire after 24 hours
- Refresh tokens expire after 30 days

### CORS Policy

Allowed origins must be configured in backend environment variables.

---

## 📝 EXAMPLES

### Complete Betting Flow

```javascript
// 1. Connect to WebSocket
const socket = io('wss://api.yourdomain.com', {
  auth: { token: userToken }
});

// 2. Join game
socket.emit('game:join', { gameId: 'game-uuid' });

// 3. Listen for round created
socket.on('game:round_created', (data) => {
  console.log('New round:', data.roundNumber);
  console.log('Opening card:', data.openingCard);
});

// 4. Place bet
socket.emit('game:bet_place', {
  roundId: 'round-uuid',
  betSide: 'andar',
  amount: 2500
});

// 5. Listen for bet confirmation
socket.on('game:bet_placed', (data) => {
  console.log('Bet placed:', data.bet);
  console.log('New balance:', data.balance);
});

// 6. Watch card dealing
socket.on('game:card_dealt', (data) => {
  console.log('Card dealt:', data.card, 'on', data.side);
});

// 7. See winner
socket.on('game:winner_declaration', (data) => {
  console.log(data.winnerDisplayText);
  if (data.winningSide === 'andar') {
    console.log('You won!');
  }
});
```

---

## 📚 ADDITIONAL RESOURCES

- [System Architecture](./ANDAR_BAHAR_COMPLETE_IMPLEMENTATION_STATUS.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Testing Guide](./backend/tests/integration/game-flow.test.ts)
- [Frontend Components](./frontend/src/components/)

---

**API Version:** 1.0  
**Last Updated:** December 19, 2025  
**Maintainer:** Development Team
