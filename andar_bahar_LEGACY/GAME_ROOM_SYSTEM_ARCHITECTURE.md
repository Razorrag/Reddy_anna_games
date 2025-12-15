# 🎮 Multi-Game Room System Architecture
## Reddy Anna Games - Complete Game Room Implementation

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Database Schema](#database-schema)
4. [Room Management](#room-management)
5. [Player Management](#player-management)
6. [Real-time Synchronization](#real-time-synchronization)
7. [Game Flow](#game-flow)
8. [Security & Validation](#security--validation)
9. [Scalability Considerations](#scalability-considerations)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 System Overview

### Vision
Create a scalable, multi-room gaming platform where multiple Andar Bahar games can run simultaneously, with players able to join different rooms, watch games, place bets, and interact in real-time.

### Key Features
- **Multiple Game Rooms**: Support for unlimited concurrent game rooms
- **Room Types**: Public rooms, private rooms, VIP rooms with different bet limits
- **Dynamic Scaling**: Rooms automatically created/destroyed based on demand
- **Real-time Sync**: WebSocket-based synchronization across all clients
- **Room Lobbies**: Centralized lobby showing all active rooms
- **Spectator Mode**: Watch games without betting
- **Room Analytics**: Per-room statistics and monitoring
- **Cross-room Chat**: Optional chat system for social interaction

---

## 🏗️ Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Lobby   │  │  Room 1  │  │  Room 2  │  │  Room N  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │ WebSocket
        ┌─────────────▼─────────────────────────────────────┐
        │          WebSocket Server (routes.ts)             │
        │  ┌─────────────────────────────────────────────┐  │
        │  │     Room Manager (Singleton)                │  │
        │  │  - Create/Destroy Rooms                     │  │
        │  │  - Route Messages to Rooms                  │  │
        │  │  - Monitor Room Health                      │  │
        │  └─────────────────────────────────────────────┘  │
        │                                                    │
        │  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
        │  │  Room 1   │  │  Room 2   │  │  Room N   │    │
        │  │  Instance │  │  Instance │  │  Instance │    │
        │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
        └────────┼───────────────┼───────────────┼──────────┘
                 │               │               │
        ┌────────▼───────────────▼───────────────▼──────────┐
        │         Database Layer (Supabase)                 │
        │  - game_rooms                                     │
        │  - room_participants                              │
        │  - game_sessions (per room)                       │
        │  - bets (with room_id)                            │
        │  - room_analytics                                 │
        └───────────────────────────────────────────────────┘
```

### Component Architecture

```typescript
// Core Components
├── RoomManager (Singleton)
│   ├── createRoom()
│   ├── destroyRoom()
│   ├── getRoomById()
│   ├── getAllActiveRooms()
│   └── routeMessageToRoom()
│
├── GameRoom (Instance per room)
│   ├── roomId: string
│   ├── gameState: GameState
│   ├── participants: Set<Participant>
│   ├── config: RoomConfig
│   ├── broadcast()
│   ├── handleBet()
│   ├── startGame()
│   └── dealCard()
│
├── Participant
│   ├── userId: string
│   ├── role: 'player' | 'spectator' | 'admin'
│   ├── ws: WebSocket
│   ├── roomId: string
│   └── seatNumber?: number
│
└── RoomConfig
    ├── name: string
    ├── type: 'public' | 'private' | 'vip'
    ├── minBet: number
    ├── maxBet: number
    ├── maxPlayers: number
    └── settings: GameSettings
```

---

## 🗄️ Database Schema

### New Tables

```sql
-- Game Rooms Table
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., "ROOM-001"
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'public', 'private', 'vip'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'closed'
    
    -- Betting Configuration
    min_bet DECIMAL(10,2) NOT NULL DEFAULT 1000,
    max_bet DECIMAL(10,2) NOT NULL DEFAULT 100000,
    
    -- Capacity
    max_players INT NOT NULL DEFAULT 50,
    current_players INT NOT NULL DEFAULT 0,
    current_spectators INT NOT NULL DEFAULT 0,
    
    -- Game State
    current_game_id UUID REFERENCES game_sessions(id),
    games_played INT NOT NULL DEFAULT 0,
    
    -- Admin
    created_by UUID REFERENCES users(id),
    host_admin_id UUID REFERENCES admin_users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_room_type CHECK (type IN ('public', 'private', 'vip')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'closed')),
    CONSTRAINT valid_bet_range CHECK (min_bet <= max_bet),
    CONSTRAINT valid_player_count CHECK (current_players >= 0 AND current_players <= max_players)
);

-- Room Participants Table
CREATE TABLE room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participant Details
    role VARCHAR(20) NOT NULL DEFAULT 'player', -- 'player', 'spectator', 'admin'
    seat_number INT,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'away', 'left'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics (for this room session)
    games_played INT DEFAULT 0,
    total_bets_placed DECIMAL(15,2) DEFAULT 0,
    total_winnings DECIMAL(15,2) DEFAULT 0,
    
    UNIQUE(room_id, user_id),
    CONSTRAINT valid_participant_role CHECK (role IN ('player', 'spectator', 'admin')),
    CONSTRAINT valid_participant_status CHECK (status IN ('active', 'away', 'left'))
);

-- Room Analytics Table
CREATE TABLE room_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    
    -- Time Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Game Stats
    total_games INT NOT NULL DEFAULT 0,
    total_rounds INT NOT NULL DEFAULT 0,
    avg_game_duration_seconds INT,
    
    -- Player Stats
    unique_players INT NOT NULL DEFAULT 0,
    peak_concurrent_players INT NOT NULL DEFAULT 0,
    avg_players_per_game DECIMAL(5,2),
    
    -- Betting Stats
    total_bets_placed INT NOT NULL DEFAULT 0,
    total_bet_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_payout_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    house_profit DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Performance Metrics
    avg_bet_time_ms INT,
    avg_response_time_ms INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Chat Messages (Optional)
CREATE TABLE room_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'emoji', 'system'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_message_length CHECK (LENGTH(message) <= 500)
);
```

### Modified Tables

```sql
-- Add room_id to existing tables
ALTER TABLE game_sessions 
ADD COLUMN room_id UUID REFERENCES game_rooms(id);

ALTER TABLE bets 
ADD COLUMN room_id UUID REFERENCES game_rooms(id);

ALTER TABLE game_history 
ADD COLUMN room_id UUID REFERENCES game_rooms(id);

-- Create indexes for performance
CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_type ON game_rooms(type);
CREATE INDEX idx_room_participants_room ON room_participants(room_id);
CREATE INDEX idx_room_participants_user ON room_participants(user_id);
CREATE INDEX idx_room_analytics_room_period ON room_analytics(room_id, period_start, period_end);
CREATE INDEX idx_bets_room ON bets(room_id);
CREATE INDEX idx_game_sessions_room ON game_sessions(room_id);
```

---

## 🎮 Room Management

### Room Types & Configuration

```typescript
// Room Types
export enum RoomType {
    PUBLIC = 'public',      // Open to all players
    PRIVATE = 'private',    // Invitation only
    VIP = 'vip'            // High rollers, special privileges
}

// Room Status
export enum RoomStatus {
    ACTIVE = 'active',      // Room is running
    PAUSED = 'paused',      // Temporarily paused
    CLOSED = 'closed'       // Permanently closed
}

// Room Configuration Interface
export interface RoomConfig {
    name: string;
    type: RoomType;
    minBet: number;
    maxBet: number;
    maxPlayers: number;
    
    // Game Settings
    timerDuration: number;
    autoStartEnabled: boolean;
    spectatorAllowed: boolean;
    chatEnabled: boolean;
    
    // Advanced Settings
    betLimits: {
        perRound: number;
        perGame: number;
    };
    
    features: {
        multipleRoundsEnabled: boolean;
        bonusRoundsEnabled: boolean;
        sideShowEnabled: boolean;
    };
}

// Default Room Templates
export const ROOM_TEMPLATES = {
    beginner: {
        name: 'Beginner Room',
        type: RoomType.PUBLIC,
        minBet: 100,
        maxBet: 5000,
        maxPlayers: 100
    },
    standard: {
        name: 'Standard Room',
        type: RoomType.PUBLIC,
        minBet: 1000,
        maxBet: 50000,
        maxPlayers: 50
    },
    highRoller: {
        name: 'High Roller Room',
        type: RoomType.VIP,
        minBet: 10000,
        maxBet: 500000,
        maxPlayers: 20
    }
};
```

### Room Manager Implementation

```typescript
// server/room-manager.ts
export class RoomManager {
    private static instance: RoomManager;
    private rooms: Map<string, GameRoom> = new Map();
    private roomsByCode: Map<string, GameRoom> = new Map();
    
    private constructor() {}
    
    static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }
    
    // Create a new room
    async createRoom(config: RoomConfig, createdBy: string): Promise<GameRoom> {
        const roomCode = this.generateRoomCode();
        const roomId = uuidv4();
        
        // Create room in database
        const dbRoom = await storage.createRoom({
            id: roomId,
            room_code: roomCode,
            name: config.name,
            type: config.type,
            min_bet: config.minBet,
            max_bet: config.maxBet,
            max_players: config.maxPlayers,
            created_by: createdBy,
            metadata: config
        });
        
        // Create in-memory room instance
        const room = new GameRoom(roomId, roomCode, config);
        this.rooms.set(roomId, room);
        this.roomsByCode.set(roomCode, room);
        
        console.log(`🎮 Room created: ${roomCode} (${config.name})`);
        return room;
    }
    
    // Get room by ID or code
    getRoom(identifier: string): GameRoom | undefined {
        return this.rooms.get(identifier) || this.roomsByCode.get(identifier);
    }
    
    // Get all active rooms
    getActiveRooms(): GameRoom[] {
        return Array.from(this.rooms.values()).filter(room => room.isActive());
    }
    
    // Close and cleanup room
    async closeRoom(roomId: string, reason: string = 'Admin closed'): Promise<void> {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        // Notify all participants
        room.broadcast({
            type: 'room_closing',
            data: { reason, timestamp: Date.now() }
        });
        
        // Cleanup room
        await room.cleanup();
        
        // Update database
        await storage.updateRoom(roomId, {
            status: RoomStatus.CLOSED,
            closed_at: new Date()
        });
        
        // Remove from memory
        this.rooms.delete(roomId);
        this.roomsByCode.delete(room.roomCode);
        
        console.log(`🚪 Room closed: ${room.roomCode}`);
    }
    
    // Auto-cleanup empty rooms
    async cleanupEmptyRooms(): Promise<void> {
        const emptyRooms = Array.from(this.rooms.values())
            .filter(room => room.getParticipantCount() === 0 && room.isIdle());
        
        for (const room of emptyRooms) {
            await this.closeRoom(room.roomId, 'Auto-cleanup: Empty room');
        }
    }
    
    // Generate unique room code
    private generateRoomCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code: string;
        do {
            code = Array.from({ length: 6 }, () => 
                chars[Math.floor(Math.random() * chars.length)]
            ).join('');
        } while (this.roomsByCode.has(code));
        return code;
    }
    
    // Room statistics
    getRoomStats(): RoomStats {
        const rooms = Array.from(this.rooms.values());
        return {
            totalRooms: rooms.length,
            activeRooms: rooms.filter(r => r.isActive()).length,
            totalPlayers: rooms.reduce((sum, r) => sum + r.getPlayerCount(), 0),
            totalSpectators: rooms.reduce((sum, r) => sum + r.getSpectatorCount(), 0)
        };
    }
}
```

---

## 👥 Player Management

### Participant System

```typescript
// server/game-room.ts
export class GameRoom {
    private roomId: string;
    private roomCode: string;
    private config: RoomConfig;
    private gameState: GameState;
    private participants: Map<string, Participant> = new Map();
    private spectators: Set<string> = new Set();
    
    constructor(roomId: string, roomCode: string, config: RoomConfig) {
        this.roomId = roomId;
        this.roomCode = roomCode;
        this.config = config;
        this.gameState = new GameState();
    }
    
    // Join room
    async joinRoom(userId: string, ws: WebSocket, role: ParticipantRole): Promise<JoinResult> {
        // Validate capacity
        if (role === 'player' && this.getPlayerCount() >= this.config.maxPlayers) {
            return { success: false, error: 'Room is full' };
        }
        
        // Check if already in room
        if (this.participants.has(userId)) {
            return { success: false, error: 'Already in room' };
        }
        
        // Create participant
        const participant: Participant = {
            userId,
            ws,
            role,
            roomId: this.roomId,
            joinedAt: Date.now()
        };
        
        this.participants.set(userId, participant);
        
        if (role === 'spectator') {
            this.spectators.add(userId);
        }
        
        // Add to database
        await storage.addRoomParticipant({
            room_id: this.roomId,
            user_id: userId,
            role: role
        });
        
        // Broadcast join event
        this.broadcast({
            type: 'participant_joined',
            data: {
                userId,
                role,
                participantCount: this.getParticipantCount()
            }
        }, participant);
        
        // Send current game state to new participant
        const gameStateForUser = await this.getGameStateForUser(userId);
        ws.send(JSON.stringify({
            type: 'room_joined',
            data: {
                roomId: this.roomId,
                roomCode: this.roomCode,
                gameState: gameStateForUser,
                participants: this.getParticipantList()
            }
        }));
        
        console.log(`👤 ${userId} joined room ${this.roomCode} as ${role}`);
        return { success: true };
    }
    
    // Leave room
    async leaveRoom(userId: string): Promise<void> {
        const participant = this.participants.get(userId);
        if (!participant) return;
        
        // Remove from participants
        this.participants.delete(userId);
        this.spectators.delete(userId);
        
        // Update database
        await storage.updateRoomParticipant(this.roomId, userId, {
            status: 'left',
            left_at: new Date()
        });
        
        // Broadcast leave event
        this.broadcast({
            type: 'participant_left',
            data: {
                userId,
                participantCount: this.getParticipantCount()
            }
        });
        
        console.log(`👋 ${userId} left room ${this.roomCode}`);
        
        // Auto-cleanup if room is empty
        if (this.getParticipantCount() === 0) {
            setTimeout(() => this.checkAutoCleanup(), 60000); // 1 minute grace period
        }
    }
    
    // Broadcast to all participants in room
    broadcast(message: any, excludeParticipant?: Participant): void {
        const messageStr = JSON.stringify({ 
            ...message, 
            roomId: this.roomId,
            timestamp: Date.now() 
        });
        
        this.participants.forEach(participant => {
            if (participant !== excludeParticipant && 
                participant.ws.readyState === WebSocket.OPEN) {
                participant.ws.send(messageStr);
            }
        });
    }
    
    // Broadcast to specific role
    broadcastToRole(message: any, role: ParticipantRole): void {
        const messageStr = JSON.stringify({ 
            ...message, 
            roomId: this.roomId,
            timestamp: Date.now() 
        });
        
        this.participants.forEach(participant => {
            if (participant.role === role && 
                participant.ws.readyState === WebSocket.OPEN) {
                participant.ws.send(messageStr);
            }
        });
    }
    
    // Get participant counts
    getParticipantCount(): number {
        return this.participants.size;
    }
    
    getPlayerCount(): number {
        return Array.from(this.participants.values())
            .filter(p => p.role === 'player').length;
    }
    
    getSpectatorCount(): number {
        return this.spectators.size;
    }
    
    // Get participant list for UI
    getParticipantList(): ParticipantInfo[] {
        return Array.from(this.participants.values()).map(p => ({
            userId: p.userId,
            role: p.role,
            joinedAt: p.joinedAt
        }));
    }
}
```

---

## ⚡ Real-time Synchronization

### WebSocket Message Routing

```typescript
// server/routes.ts - Enhanced WebSocket Handler
wss.on('connection', (ws: WebSocket) => {
    let client: WSClient | null = null;
    let currentRoomId: string | null = null;
    
    ws.on('message', async (data: Buffer) => {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
            // Room Management Messages
            case 'room:join': {
                const { roomId, role } = message.data;
                const room = RoomManager.getInstance().getRoom(roomId);
                
                if (!room) {
                    sendError(ws, 'Room not found');
                    return;
                }
                
                const result = await room.joinRoom(client!.userId, ws, role);
                if (result.success) {
                    currentRoomId = roomId;
                    ws.send(JSON.stringify({
                        type: 'room:join_success',
                        data: result
                    }));
                } else {
                    sendError(ws, result.error);
                }
                break;
            }
            
            case 'room:leave': {
                if (currentRoomId) {
                    const room = RoomManager.getInstance().getRoom(currentRoomId);
                    if (room) {
                        await room.leaveRoom(client!.userId);
                        currentRoomId = null;
                    }
                }
                break;
            }
            
            case 'room:list': {
                const rooms = RoomManager.getInstance().getActiveRooms();
                ws.send(JSON.stringify({
                    type: 'room:list_response',
                    data: { rooms: rooms.map(r => r.getPublicInfo()) }
                }));
                break;
            }
            
            // Game Actions (routed to specific room)
            case 'place_bet':
            case 'start_game':
            case 'deal_card': {
                if (!currentRoomId) {
                    sendError(ws, 'Not in a room');
                    return;
                }
                
                const room = RoomManager.getInstance().getRoom(currentRoomId);
                if (room) {
                    await room.handleGameAction(client!, message);
                }
                break;
            }
        }
    });
    
    // Cleanup on disconnect
    ws.on('close', () => {
        if (currentRoomId) {
            const room = RoomManager.getInstance().getRoom(currentRoomId);
            if (room && client) {
                room.leaveRoom(client.userId);
            }
        }
    });
});
```

---

## 🎯 Game Flow

### Room-Specific Game Lifecycle

```typescript
export class GameRoom {
    // ... previous code ...
    
    async startGame(adminId: string, openingCard: string): Promise<void> {
        // Validate admin permissions
        const admin = this.participants.get(adminId);
        if (!admin || admin.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        
        // Create new game session for this room
        const gameId = await storage.createGameSession({
            room_id: this.roomId,
            opening_card: openingCard,
            phase: 'betting',
            current_timer: this.config.timerDuration,
            round: 1
        });
        
        // Reset room game state
        this.gameState.startNewGame();
        this.gameState.gameId = gameId;
        this.gameState.openingCard = openingCard;
        this.gameState.phase = 'betting';
        
        // Start betting timer
        this.startTimer(this.config.timerDuration);
        
        // Broadcast game start to all participants
        this.broadcast({
            type: 'game_start',
            data: {
                gameId,
                openingCard,
                phase: 'betting',
                timer: this.config.timerDuration,
                round: 1
            }
        });
        
        console.log(`🎮 Game started in room ${this.roomCode}: ${gameId}`);
    }
    
    async handleBet(userId: string, betData: BetData): Promise<void> {
        // Validate bet
        if (this.gameState.phase !== 'betting') {
            throw new Error('Betting is closed');
        }
        
        if (betData.amount < this.config.minBet || betData.amount > this.config.maxBet) {
            throw new Error(`Bet must be between ₹${this.config.minBet} and ₹${this.config.maxBet}`);
        }
        
        // Process bet through existing bet handler
        // But now with room context
        const result = await storage.placeBet({
            user_id: userId,
            game_id: this.gameState.gameId,
            room_id: this.roomId,
            amount: betData.amount,
            side: betData.side,
            round: this.gameState.currentRound
        });
        
        // Update room statistics
        this.gameState.addBet(betData.side, betData.amount, this.gameState.currentRound);
        
        // Broadcast bet to room
        this.broadcast({
            type: 'bet_placed',
            data: {
                userId,
                amount: betData.amount,
                side: betData.side,
                round: this.gameState.currentRound,
                roomTotals: {
                    andar: this.gameState.round1Bets.andar + this.gameState.round2Bets.andar,
                    bahar: this.gameState.round1Bets.bahar + this.gameState.round2Bets.bahar
                }
            }
        });
        
        // Send confirmation to bettor
        const participant = this.participants.get(userId);
        if (participant) {
            participant.ws.send(JSON.stringify({
                type: 'bet_confirmed',
                data: {
                    betId: result.id,
                    newBalance: result.newBalance
                }
            }));
        }
    }
    
    // Handle game completion
    async completeGame(winner: 'andar' | 'bahar', winningCard: string): Promise<void> {
        this.gameState.winner = winner;
        this.gameState.winningCard = winningCard;
        this.gameState.phase = 'complete';
        
        // Calculate and distribute payouts
        const payouts = await this.calculatePayouts();
        
        // Broadcast game complete
        this.broadcast({
            type: 'game_complete',
            data: {
                winner,
                winningCard,
                payouts: payouts.summary,
                totalPayout: payouts.total
            }
        });
        
        // Update room analytics
        await this.updateRoomAnalytics();
        
        // Auto-start next game if enabled
        if (this.config.autoStartEnabled) {
            setTimeout(() => this.prepareNextGame(), 5000);
        }
    }
}
```

---

## 🔒 Security & Validation

### Room Access Control

```typescript
// Middleware for room access
export async function validateRoomAccess(
    userId: string, 
    roomId: string, 
    requiredRole?: ParticipantRole
): Promise<ValidationResult> {
    const room = RoomManager.getInstance().getRoom(roomId);
    
    if (!room) {
        return { valid: false, error: 'Room not found' };
    }
    
    const participant = room.getParticipant(userId);
    
    if (!participant) {
        return { valid: false, error: 'Not a participant of this room' };
    }
    
    if (requiredRole && participant.role !== requiredRole) {
        return { valid: false, error: 'Insufficient permissions' };
    }
    
    return { valid: true };
}

// Rate limiting per room
const roomRateLimits = new Map<string, Map<string, RateLimit>>();

export function checkRoomRateLimit(
    roomId: string, 
    userId: string, 
    action: string
): boolean {
    if (!roomRateLimits.has(roomId)) {
        roomRateLimits.set(roomId, new Map());
    }
    
    const roomLimits = roomRateLimits.get(roomId)!;
    const key = `${userId}:${action}`;
    const limit = roomLimits.get(key);
    
    const now = Date.now();
    if (!limit) {
        roomLimits.set(key, { count: 1, resetTime: now + 60000 });
        return true;
    }
    
    if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + 60000;
        return true;
    }
    
    if (limit.count >= 30) { // 30 actions per minute
        return false;
    }
    
    limit.count++;
    return true;
}
```

---

## 📈 Scalability Considerations

### Horizontal Scaling Strategy

```typescript
// For future Redis integration (multi-server support)
export interface RoomDistributionStrategy {
    // Distribute rooms across multiple servers
    assignRoomToServer(roomId: string): string;
    
    // Find which server hosts a room
    findRoomServer(roomId: string): string;
    
    // Synchronize room state across servers
    syncRoomState(roomId: string, state: Partial<GameState>): Promise<void>;
}

// Current in-memory approach (single server)
// Future: Use Redis pub/sub for cross-server communication
```

### Performance Optimization

```typescript
// Batch updates for better performance
export class GameRoom {
    private updateQueue: UpdateEvent[] = [];
    private flushInterval: NodeJS.Timeout | null = null;
    
    constructor(/* ... */) {
        // Batch broadcast every 50ms
        this.flushInterval = setInterval(() => {
            if (this.updateQueue.length > 0) {
                this.flushUpdates();
            }
        }, 50);
    }
    
    queueUpdate(event: UpdateEvent): void {
        this.updateQueue.push(event);
    }
    
    private flushUpdates(): void {
        if (this.updateQueue.length === 0) return;
        
        const batch = {
            type: 'batch_update',
            data: {
                events: this.updateQueue
            }
        };
        
        this.broadcast(batch);
        this.updateQueue = [];
    }
    
    cleanup(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
    }
}
```

---

## 🗺️ Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Database schema implementation
- [ ] RoomManager singleton
- [ ] Basic GameRoom class
- [ ] Participant management
- [ ] WebSocket message routing

### Phase 2: Game Integration (Week 2)
- [ ] Adapt existing game logic for rooms
- [ ] Room-specific bet handling
- [ ] Room-specific game state
- [ ] Payout calculation per room
- [ ] Room analytics tracking

### Phase 3: UI/UX (Week 3)
- [ ] Room lobby interface
- [ ] Room creation/management UI
- [ ] In-room game interface
- [ ] Room switching functionality
- [ ] Spectator mode UI

### Phase 4: Advanced Features (Week 4)
- [ ] Private rooms with invitations
- [ ] VIP room features
- [ ] Room chat system
- [ ] Advanced analytics dashboard
- [ ] Admin room management panel

### Phase 5: Testing & Optimization (Week 5)
- [ ] Load testing with multiple rooms
- [ ] WebSocket performance optimization
- [ ] Database query optimization
- [ ] Memory leak detection
- [ ] Security audit

---

## 📊 Monitoring & Analytics

### Room Health Metrics

```typescript
export interface RoomHealthMetrics {
    roomId: string;
    roomCode: string;
    
    // Participants
    currentPlayers: number;
    currentSpectators: number;
    peakPlayers: number;
    
    // Game Performance
    gamesPlayed: number;
    avgGameDuration: number;
    avgBetsPerGame: number;
    
    // Financial
    totalBetsAmount: number;
    totalPayoutAmount: number;
    houseProfit: number;
    
    // Technical
    avgResponseTime: number;
    errorCount: number;
    activeConnections: number;
    
    // Timestamps
    createdAt: Date;
    lastActivityAt: Date;
}
```

---

## 🎉 Conclusion

This comprehensive architecture provides a solid foundation for building a scalable, multi-room gaming platform. The system is designed to:

1. **Scale horizontally** - Add more servers as needed
2. **Handle thousands of concurrent players** across multiple rooms
3. **Maintain real-time synchronization** with minimal latency
4. **Provide rich analytics** for business insights
5. **Ensure security** at every level
6. **Deliver excellent UX** for players and admins

The modular design allows for incremental implementation and easy extension with new features.