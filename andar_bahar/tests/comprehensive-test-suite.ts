/**
 * COMPREHENSIVE TEST SUITE
 * 
 * Complete end-to-end testing for all system components:
 * - Database operations
 * - Real-time WebSocket communication
 * - Game mechanics
 * - Betting flow
 * - Authentication
 * - Performance benchmarks
 */

import { WebSocket } from 'ws';

// Test configuration
const TEST_CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  wsUrl: process.env.WS_URL || 'ws://localhost:5000',
  testTimeout: 30000, // 30 seconds
  parallelUsers: 10, // Number of concurrent users to simulate
};

// Test results
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

// Helper function to record test results
function recordTest(name: string, passed: boolean, duration: number, error?: string, details?: any) {
  testResults.push({ name, passed, duration, error, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name} (${duration}ms)`);
  if (error) console.error(`   Error: ${error}`);
  if (details) console.log(`   Details:`, details);
}

// Helper function to make HTTP requests
async function makeRequest(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const url = `${TEST_CONFIG.apiUrl}${endpoint}`;
  const headers: any = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  return {
    status: response.status,
    data: await response.json().catch(() => null)
  };
}

// 1. DATABASE TESTS
async function testDatabase() {
  console.log('\n🗄️  DATABASE TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Connection
  {
    const start = Date.now();
    try {
      const response = await makeRequest('/api/health');
      const duration = Date.now() - start;
      recordTest('Database Connection', response.status === 200, duration);
    } catch (error: any) {
      recordTest('Database Connection', false, Date.now() - start, error.message);
    }
  }
  
  // Test 2: User Creation
  {
    const start = Date.now();
    try {
      const testUser = {
        username: `test_user_${Date.now()}`,
        password: 'TestPass123!',
        mobile: `9${Math.floor(Math.random() * 1000000000)}`
      };
      
      const response = await makeRequest('/api/signup', 'POST', testUser);
      const duration = Date.now() - start;
      
      recordTest(
        'User Creation',
        response.status === 200 || response.status === 201,
        duration,
        response.status !== 200 && response.status !== 201 ? JSON.stringify(response.data) : undefined,
        { username: testUser.username }
      );
    } catch (error: any) {
      recordTest('User Creation', false, Date.now() - start, error.message);
    }
  }
  
  // Test 3: User Authentication
  {
    const start = Date.now();
    try {
      const loginData = {
        username: 'admin',
        password: 'admin123' // Adjust based on your setup
      };
      
      const response = await makeRequest('/api/login', 'POST', loginData);
      const duration = Date.now() - start;
      
      const success = response.status === 200 && response.data?.token;
      recordTest(
        'User Authentication',
        success,
        duration,
        !success ? 'Failed to authenticate or no token received' : undefined,
        success ? { tokenLength: response.data.token.length } : undefined
      );
      
      if (success) {
        (global as any).testAuthToken = response.data.token;
      }
    } catch (error: any) {
      recordTest('User Authentication', false, Date.now() - start, error.message);
    }
  }
  
  // Test 4: Balance Query
  {
    const start = Date.now();
    const token = (global as any).testAuthToken;
    
    if (!token) {
      recordTest('Balance Query', false, 0, 'No auth token available');
    } else {
      try {
        const response = await makeRequest('/api/wallet/balance', 'GET', null, token);
        const duration = Date.now() - start;
        
        const success = response.status === 200 && typeof response.data?.balance === 'number';
        recordTest(
          'Balance Query',
          success,
          duration,
          !success ? 'Invalid balance response' : undefined,
          success ? { balance: response.data.balance } : undefined
        );
      } catch (error: any) {
        recordTest('Balance Query', false, Date.now() - start, error.message);
      }
    }
  }
  
  // Test 5: Transaction History
  {
    const start = Date.now();
    const token = (global as any).testAuthToken;
    
    if (!token) {
      recordTest('Transaction History', false, 0, 'No auth token available');
    } else {
      try {
        const response = await makeRequest('/api/transactions?limit=10', 'GET', null, token);
        const duration = Date.now() - start;
        
        const success = response.status === 200 && Array.isArray(response.data);
        recordTest(
          'Transaction History',
          success,
          duration,
          !success ? 'Invalid transaction history response' : undefined,
          success ? { count: response.data.length } : undefined
        );
      } catch (error: any) {
        recordTest('Transaction History', false, Date.now() - start, error.message);
      }
    }
  }
}

// 2. WEBSOCKET TESTS
async function testWebSocket() {
  console.log('\n🔌 WEBSOCKET TESTS');
  console.log('='.repeat(50));
  
  return new Promise<void>((resolve) => {
    const token = (global as any).testAuthToken;
    
    if (!token) {
      recordTest('WebSocket Connection', false, 0, 'No auth token available');
      resolve();
      return;
    }
    
    // Test 1: Connection
    const start = Date.now();
    const ws = new WebSocket(`${TEST_CONFIG.wsUrl}/ws?token=${token}`);
    
    let connectionEstablished = false;
    let gameStateReceived = false;
    let betConfirmationReceived = false;
    
    const timeout = setTimeout(() => {
      if (!connectionEstablished) {
        recordTest('WebSocket Connection', false, Date.now() - start, 'Connection timeout');
      }
      ws.close();
      resolve();
    }, 10000);
    
    ws.on('open', () => {
      connectionEstablished = true;
      recordTest('WebSocket Connection', true, Date.now() - start);
      
      // Test 2: Game State Subscription
      const subscribeStart = Date.now();
      ws.send(JSON.stringify({
        type: 'subscribe_game',
        data: {}
      }));
      
      setTimeout(() => {
        if (!gameStateReceived) {
          recordTest('Game State Subscription', false, Date.now() - subscribeStart, 'No game state received');
        }
      }, 5000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Test 2: Game State Response
        if (message.type === 'game_state' || message.type === 'game:state') {
          if (!gameStateReceived) {
            gameStateReceived = true;
            recordTest(
              'Game State Subscription',
              true,
              Date.now() - start,
              undefined,
              {
                phase: message.data?.phase,
                round: message.data?.currentRound
              }
            );
          }
        }
        
        // Test 3: Bet Confirmation
        if (message.type === 'bet_confirmed') {
          if (!betConfirmationReceived) {
            betConfirmationReceived = true;
            recordTest(
              'Bet Confirmation',
              true,
              Date.now() - start,
              undefined,
              {
                amount: message.data?.amount,
                side: message.data?.side
              }
            );
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      if (!connectionEstablished) {
        recordTest('WebSocket Connection', false, Date.now() - start, error.message);
      }
      clearTimeout(timeout);
      ws.close();
      resolve();
    });
    
    ws.on('close', () => {
      clearTimeout(timeout);
      resolve();
    });
    
    // Test 3: Send test bet after connection established
    setTimeout(() => {
      if (connectionEstablished && gameStateReceived) {
        ws.send(JSON.stringify({
          type: 'place_bet',
          data: {
            side: 'andar',
            amount: 1000,
            round: 1
          }
        }));
      }
    }, 2000);
  });
}

// 3. GAME MECHANICS TESTS
async function testGameMechanics() {
  console.log('\n🎮 GAME MECHANICS TESTS');
  console.log('='.repeat(50));
  
  return new Promise<void>((resolve) => {
    const token = (global as any).testAuthToken;
    
    if (!token) {
      recordTest('Game Flow', false, 0, 'No auth token available');
      resolve();
      return;
    }
    
    const ws = new WebSocket(`${TEST_CONFIG.wsUrl}/ws?token=${token}`);
    const testStart = Date.now();
    
    let phaseChanges: string[] = [];
    let betPlaced = false;
    let gameCompleted = false;
    
    const timeout = setTimeout(() => {
      recordTest(
        'Complete Game Flow',
        gameCompleted,
        Date.now() - testStart,
        gameCompleted ? undefined : 'Game did not complete within timeout',
        { phasesObserved: phaseChanges, betPlaced }
      );
      ws.close();
      resolve();
    }, 25000);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'subscribe_game', data: {} }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Track phase changes
        if (message.data?.phase && !phaseChanges.includes(message.data.phase)) {
          phaseChanges.push(message.data.phase);
        }
        
        // Auto-place bet when in betting phase
        if (message.data?.phase === 'betting' && !betPlaced) {
          betPlaced = true;
          ws.send(JSON.stringify({
            type: 'place_bet',
            data: {
              side: 'andar',
              amount: 1000,
              round: message.data.currentRound || 1
            }
          }));
        }
        
        // Check for game completion
        if (message.data?.phase === 'complete' || message.type === 'game_complete') {
          gameCompleted = true;
          clearTimeout(timeout);
          recordTest(
            'Complete Game Flow',
            true,
            Date.now() - testStart,
            undefined,
            {
              phasesObserved: phaseChanges,
              betPlaced,
              winner: message.data?.winner
            }
          );
          ws.close();
          resolve();
        }
      } catch (error) {
        console.error('Error in game mechanics test:', error);
      }
    });
    
    ws.on('error', (error) => {
      recordTest('Complete Game Flow', false, Date.now() - testStart, error.message);
      clearTimeout(timeout);
      resolve();
    });
  });
}

// 4. PERFORMANCE TESTS
async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('='.repeat(50));
  
  // Test 1: API Response Time
  {
    const measurements: number[] = [];
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      try {
        await makeRequest('/api/health');
        measurements.push(Date.now() - start);
      } catch (error) {
        measurements.push(-1);
      }
    }
    
    const validMeasurements = measurements.filter(m => m > 0);
    const avgResponseTime = validMeasurements.reduce((a, b) => a + b, 0) / validMeasurements.length;
    const maxResponseTime = Math.max(...validMeasurements);
    
    recordTest(
      'API Response Time',
      avgResponseTime < 100, // Should be under 100ms
      avgResponseTime,
      avgResponseTime >= 100 ? 'Response time too slow' : undefined,
      {
        average: `${avgResponseTime.toFixed(2)}ms`,
        max: `${maxResponseTime}ms`,
        samples: iterations
      }
    );
  }
  
  // Test 2: Concurrent Bet Processing
  {
    const start = Date.now();
    const concurrentBets = 5;
    const promises: Promise<any>[] = [];
    
    for (let i = 0; i < concurrentBets; i++) {
      promises.push(
        new Promise((resolve) => {
          const ws = new WebSocket(`${TEST_CONFIG.wsUrl}/ws?token=${(global as any).testAuthToken}`);
          ws.on('open', () => {
            ws.send(JSON.stringify({
              type: 'place_bet',
              data: { side: 'andar', amount: 1000, round: 1 }
            }));
          });
          ws.on('message', (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'bet_confirmed') {
              ws.close();
              resolve(true);
            }
          });
          ws.on('error', () => resolve(false));
          setTimeout(() => {
            ws.close();
            resolve(false);
          }, 5000);
        })
      );
    }
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r === true).length;
    const duration = Date.now() - start;
    
    recordTest(
      'Concurrent Bet Processing',
      successCount === concurrentBets,
      duration,
      successCount !== concurrentBets ? `Only ${successCount}/${concurrentBets} bets processed` : undefined,
      {
        successRate: `${(successCount / concurrentBets * 100).toFixed(1)}%`,
        avgTimePerBet: `${(duration / concurrentBets).toFixed(2)}ms`
      }
    );
  }
  
  // Test 3: Memory Usage (estimate)
  {
    const start = Date.now();
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memory = process.memoryUsage();
        const heapUsedMB = memory.heapUsed / 1024 / 1024;
        
        recordTest(
          'Memory Usage',
          heapUsedMB < 500, // Should be under 500MB
          Date.now() - start,
          heapUsedMB >= 500 ? 'Memory usage too high' : undefined,
          {
            heapUsed: `${heapUsedMB.toFixed(2)}MB`,
            heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
            external: `${(memory.external / 1024 / 1024).toFixed(2)}MB`
          }
        );
      } else {
        recordTest('Memory Usage', false, 0, 'Memory monitoring not available');
      }
    } catch (error: any) {
      recordTest('Memory Usage', false, Date.now() - start, error.message);
    }
  }
}

// 5. LOAD TESTING
async function testLoad() {
  console.log('\n📊 LOAD TESTS');
  console.log('='.repeat(50));
  
  const start = Date.now();
  const users = TEST_CONFIG.parallelUsers;
  const connections: WebSocket[] = [];
  
  try {
    // Simulate multiple concurrent users
    for (let i = 0; i < users; i++) {
      const ws = new WebSocket(`${TEST_CONFIG.wsUrl}/ws?token=${(global as any).testAuthToken}`);
      connections.push(ws);
    }
    
    // Wait for all connections to establish
    await Promise.all(
      connections.map(ws => new Promise((resolve) => {
        ws.on('open', resolve);
        ws.on('error', resolve);
        setTimeout(resolve, 5000);
      }))
    );
    
    const connectedCount = connections.filter(ws => ws.readyState === WebSocket.OPEN).length;
    const duration = Date.now() - start;
    
    recordTest(
      'Concurrent User Connections',
      connectedCount === users,
      duration,
      connectedCount !== users ? `Only ${connectedCount}/${users} connected` : undefined,
      {
        targetUsers: users,
        connectedUsers: connectedCount,
        connectionRate: `${(connectedCount / users * 100).toFixed(1)}%`
      }
    );
    
    // Clean up connections
    connections.forEach(ws => ws.close());
    
  } catch (error: any) {
    recordTest('Concurrent User Connections', false, Date.now() - start, error.message);
  }
}

// Generate test report
function generateReport() {
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY REPORT');
  console.log('='.repeat(50));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${successRate}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  - ${t.name}: ${t.error || 'Unknown error'}`);
      });
  }
  
  const totalDuration = testResults.reduce((sum, t) => sum + t.duration, 0);
  console.log(`\nTotal Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: parseFloat(successRate),
    duration: totalDuration,
    results: testResults
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(50));
  console.log(`API URL: ${TEST_CONFIG.apiUrl}`);
  console.log(`WebSocket URL: ${TEST_CONFIG.wsUrl}`);
  console.log(`Timeout: ${TEST_CONFIG.testTimeout}ms`);
  console.log('='.repeat(50));
  
  try {
    await testDatabase();
    await testWebSocket();
    await testGameMechanics();
    await testPerformance();
    await testLoad();
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
  
  const report = generateReport();
  
  // Save report to file
  const fs = await import('fs/promises');
  const reportPath = './test-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(report.failedTests > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, generateReport };