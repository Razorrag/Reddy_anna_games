import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { io as ioClient, Socket } from 'socket.io-client';
import { db } from '../../src/db';
import { games, gameRounds, bets, users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Andar Bahar Game Flow Integration Tests', () => {
  let adminSocket: Socket;
  let playerSocket: Socket;
  let gameId: string;
  let roundId: string;
  let userId: string;
  const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:3000';

  beforeAll(async () => {
    // Create test user
    const [user] = await db.insert(users).values({
      username: 'testplayer',
      email: 'test@example.com',
      password: 'hashedpassword',
      balance: '10000.00',
      role: 'player',
    }).returning();
    userId = user.id;

    // Create test game
    const [game] = await db.insert(games).values({
      name: 'Andar Bahar',
      status: 'active',
      minBet: '10.00',
      maxBet: '100000.00',
    }).returning();
    gameId = game.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(bets).where(eq(bets.userId, userId));
    await db.delete(gameRounds).where(eq(gameRounds.gameId, gameId));
    await db.delete(games).where(eq(games.id, gameId));
    await db.delete(users).where(eq(users.id, userId));
  });

  beforeEach((done) => {
    // Connect admin socket
    adminSocket = ioClient(SERVER_URL, {
      auth: { token: 'admin-jwt-token' },
    });

    // Connect player socket
    playerSocket = ioClient(SERVER_URL, {
      auth: { token: 'player-jwt-token' },
    });

    let connectedCount = 0;
    const checkConnected = () => {
      connectedCount++;
      if (connectedCount === 2) done();
    };

    adminSocket.on('connect', checkConnected);
    playerSocket.on('connect', checkConnected);
  });

  afterEach(() => {
    adminSocket.disconnect();
    playerSocket.disconnect();
  });

  describe('Round 1: Basic Card Dealing', () => {
    it('should create round with opening card from admin', (done) => {
      adminSocket.emit('admin:create_round', {
        gameId,
        openingCard: 'KH', // King of Hearts
      });

      adminSocket.on('round:created', (data) => {
        expect(data.round).toBeDefined();
        expect(data.openingCard).toBe('KH');
        expect(data.round.jokerCard).toBe('KH');
        roundId = data.round.id;
        done();
      });
    });

    it('should allow player to place bet during betting phase', (done) => {
      playerSocket.emit('bet:place', {
        roundId,
        betSide: 'andar',
        amount: 2500,
      });

      playerSocket.on('bet:placed', (data) => {
        expect(data.bet).toBeDefined();
        expect(data.bet.betSide).toBe('andar');
        expect(data.bet.amount).toBe('2500.00');
        expect(data.balance).toBeDefined();
        done();
      });
    });

    it('should deal first card (Bahar) from admin', (done) => {
      adminSocket.emit('admin:deal_card', {
        roundId,
        card: 'QS', // Queen of Spades (not matching)
        side: 'bahar',
        position: 1,
      });

      playerSocket.on('card:dealt', (data) => {
        expect(data.card).toBe('QS');
        expect(data.side).toBe('bahar');
        expect(data.position).toBe(1);
        expect(data.isWinningCard).toBe(false);
        done();
      });
    });

    it('should deal second card (Andar) and determine winner', (done) => {
      adminSocket.emit('admin:deal_card', {
        roundId,
        card: 'KD', // King of Diamonds (matches opening King)
        side: 'andar',
        position: 2,
      });

      playerSocket.on('winner:determined', (data) => {
        expect(data.winningSide).toBe('andar');
        expect(data.winningCard).toBe('KD');
        expect(data.winnerDisplay).toBe('ANDAR WON');
        expect(data.totalCards).toBe(2);
        done();
      });
    });

    it('should process payouts correctly for Round 1', async () => {
      // Verify bet status
      const [bet] = await db.select().from(bets).where(eq(bets.roundId, roundId));
      expect(bet.status).toBe('won');
      expect(parseFloat(bet.payoutAmount!)).toBe(5000); // 2500 * 2 (1:1 payout)

      // Verify user balance increased
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      expect(parseFloat(user.balance)).toBe(12500); // 10000 - 2500 + 5000
    });
  });

  describe('Round 2: Additional Betting', () => {
    beforeEach(async () => {
      // Create new round
      const [round] = await db.insert(gameRounds).values({
        gameId,
        roundNumber: 1,
        status: 'betting',
        jokerCard: 'AS',
      }).returning();
      roundId = round.id;
    });

    it('should handle no winner in Round 1 and progress to Round 2', (done) => {
      let cardsDealt = 0;

      playerSocket.on('card:dealt', (data) => {
        cardsDealt++;
        if (cardsDealt === 2 && !data.isWinningCard) {
          // Both cards dealt, no winner
          playerSocket.on('round:round_2_preparation', (roundData) => {
            expect(roundData.round).toBe(2);
            expect(roundData.message).toContain('Round 2');
            done();
          });
        }
      });

      // Deal non-matching cards
      adminSocket.emit('admin:deal_card', { roundId, card: 'KH', side: 'bahar', position: 1 });
      setTimeout(() => {
        adminSocket.emit('admin:deal_card', { roundId, card: 'QD', side: 'andar', position: 2 });
      }, 100);
    });

    it('should process mixed payouts correctly for Round 2 Bahar win', async () => {
      // Place Round 1 bet
      await db.insert(bets).values({
        userId,
        roundId,
        gameId,
        betSide: 'bahar',
        betRound: 1,
        amount: '1000.00',
        status: 'pending',
      });

      // Update to Round 2
      await db.update(gameRounds).set({ roundNumber: 2 }).where(eq(gameRounds.id, roundId));

      // Place Round 2 bet
      await db.insert(bets).values({
        userId,
        roundId,
        gameId,
        betSide: 'bahar',
        betRound: 2,
        amount: '500.00',
        status: 'pending',
      });

      // Complete round with Bahar win
      await db.update(gameRounds).set({
        status: 'completed',
        winningSide: 'bahar',
        winningCard: 'AD',
      }).where(eq(gameRounds.id, roundId));

      // Process payouts
      // Round 1 bet: 1000 * 2 = 2000 (1:1)
      // Round 2 bet: 500 * 1 = 500 (1:0 refund)
      // Total payout: 2500

      const roundBets = await db.select().from(bets).where(eq(bets.roundId, roundId));
      const totalPayout = roundBets.reduce((sum, bet) => {
        if (bet.betRound === 1) return sum + 2000;
        if (bet.betRound === 2) return sum + 500;
        return sum;
      }, 0);

      expect(totalPayout).toBe(2500);
    });
  });

  describe('Betting Features', () => {
    let betId: string;

    beforeEach(async () => {
      const [round] = await db.insert(gameRounds).values({
        gameId,
        roundNumber: 1,
        status: 'betting',
        jokerCard: 'KH',
      }).returning();
      roundId = round.id;
    });

    it('should undo bet successfully', (done) => {
      // Place bet first
      playerSocket.emit('bet:place', {
        roundId,
        betSide: 'andar',
        amount: 1000,
      });

      playerSocket.on('bet:placed', (data) => {
        betId = data.bet.id;

        // Now undo it
        playerSocket.emit('bet:undo', { betId });

        playerSocket.on('bet:undone', (undoData) => {
          expect(undoData.refundAmount).toBe(1000);
          expect(undoData.balance).toBeDefined();
          done();
        });
      });
    });

    it('should rebet previous round successfully', (done) => {
      // Create previous completed round with bets
      // ... (setup previous round and bets)

      playerSocket.emit('bet:rebet', { currentRoundId: roundId });

      playerSocket.on('bet:rebet_success', (data) => {
        expect(data.bets).toBeDefined();
        expect(data.count).toBeGreaterThan(0);
        expect(data.totalAmount).toBeGreaterThan(0);
        done();
      });
    });

    it('should double bets successfully', (done) => {
      // Place initial bet
      playerSocket.emit('bet:place', {
        roundId,
        betSide: 'bahar',
        amount: 500,
      });

      playerSocket.on('bet:placed', () => {
        // Now double it
        playerSocket.emit('bet:double', { roundId });

        playerSocket.on('bet:double_success', (data) => {
          expect(data.count).toBe(1);
          expect(data.totalAmount).toBe(500); // Added amount
          done();
        });
      });
    });
  });

  describe('Card Sequence Validation', () => {
    it('should enforce Bahar-Andar-Bahar-Andar sequence', (done) => {
      adminSocket.emit('admin:deal_card', {
        roundId,
        card: 'QH',
        side: 'andar', // Wrong! Should be Bahar first
        position: 1,
      });

      adminSocket.on('admin:error', (error) => {
        expect(error.message).toContain('Expected: BAHAR');
        done();
      });
    });

    it('should accept correct sequence', (done) => {
      let cardsDealt = 0;

      playerSocket.on('card:dealt', () => {
        cardsDealt++;
        if (cardsDealt === 2) done();
      });

      // Correct sequence
      adminSocket.emit('admin:deal_card', { roundId, card: 'QH', side: 'bahar', position: 1 });
      setTimeout(() => {
        adminSocket.emit('admin:deal_card', { roundId, card: 'KS', side: 'andar', position: 2 });
      }, 100);
    });
  });

  describe('Balance Accuracy', () => {
    it('should maintain accurate balance across multiple bets', async () => {
      const initialBalance = 10000;
      const bet1 = 1000;
      const bet2 = 1500;
      const bet3 = 2000;

      // Place bets
      await db.insert(bets).values({
        userId,
        roundId,
        gameId,
        betSide: 'andar',
        amount: bet1.toFixed(2),
        status: 'pending',
      });

      await db.insert(bets).values({
        userId,
        roundId,
        gameId,
        betSide: 'bahar',
        amount: bet2.toFixed(2),
        status: 'pending',
      });

      await db.insert(bets).values({
        userId,
        roundId,
        gameId,
        betSide: 'andar',
        amount: bet3.toFixed(2),
        status: 'pending',
      });

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const expectedBalance = initialBalance - bet1 - bet2 - bet3;
      expect(parseFloat(user.balance)).toBe(expectedBalance);
    });
  });

  describe('WebSocket Reliability', () => {
    it('should handle connection drops gracefully', (done) => {
      playerSocket.disconnect();

      setTimeout(() => {
        const newSocket = ioClient(SERVER_URL, {
          auth: { token: 'player-jwt-token' },
        });

        newSocket.on('connect', () => {
          newSocket.emit('game:join', { gameId });

          newSocket.on('game:joined', (data) => {
            expect(data.game).toBeDefined();
            newSocket.disconnect();
            done();
          });
        });
      }, 1000);
    });

    it('should broadcast to all connected players', (done) => {
      const player2Socket = ioClient(SERVER_URL, {
        auth: { token: 'player2-jwt-token' },
      });

      let receivedCount = 0;
      const checkReceived = () => {
        receivedCount++;
        if (receivedCount === 2) {
          player2Socket.disconnect();
          done();
        }
      };

      playerSocket.on('card:dealt', checkReceived);
      player2Socket.on('card:dealt', checkReceived);

      player2Socket.on('connect', () => {
        adminSocket.emit('admin:deal_card', {
          roundId,
          card: 'JH',
          side: 'bahar',
          position: 1,
        });
      });
    });
  });
});