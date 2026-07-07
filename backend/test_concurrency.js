// backend/test_concurrency.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING CONCURRENCY & INTEGRATION TESTING PIPELINE ===\n');

  const uniqueSuffix = Date.now();
  const user1Email = `user1_${uniqueSuffix}@test.com`;
  const user2Email = `user2_${uniqueSuffix}@test.com`;
  const adminEmail = `admin_${uniqueSuffix}@test.com`;

  let user1Token, user2Token, adminToken;
  let user1Id, user2Id;
  let eventId;
  let seatToLock;

  try {
    console.log('1. Registering test accounts...');
    
    const regUser1 = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User 1',
      email: user1Email,
      password: 'password123',
      role: 'user'
    });
    console.log(`   Registered User 1: ${user1Email}`);
    user1Token = regUser1.data.token;
    user1Id = regUser1.data._id;

    const regUser2 = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User 2',
      email: user2Email,
      password: 'password123',
      role: 'user'
    });
    console.log(`   Registered User 2: ${user2Email}`);
    user2Token = regUser2.data.token;
    user2Id = regUser2.data._id;

    const regAdmin = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    });
    console.log(`   Registered Admin: ${adminEmail}`);
    adminToken = regAdmin.data.token;

    console.log('   All accounts registered successfully.\n');

    console.log('2. Testing Wallet Deposits & Idempotency...');
    const idempotencyKey = `key_${uniqueSuffix}_deposit`;
    const depositAmount = 100000; 

    console.log(`   Attempting to deposit ${depositAmount} paise into User 1 wallet...`);
    const depositRes1 = await axios.post(
      `${BASE_URL}/wallet/add`,
      { amount: depositAmount, idempotencyKey },
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    console.log(`   Deposit 1 Response Status: ${depositRes1.status}`);
    console.log(`   User 1 New Wallet Balance: ${depositRes1.data.walletBalance} paise`);

    console.log('   Attempting duplicate replay deposit with identical idempotency key...');
    try {
      await axios.post(
        `${BASE_URL}/wallet/add`,
        { amount: depositAmount, idempotencyKey },
        { headers: { Authorization: `Bearer ${user1Token}` } }
      );
      console.error('   ❌ FAILED: Duplicate transaction succeeded but should have failed.');
    } catch (err) {
      console.log(`   Duplicate Deposit Response Status: ${err.response?.status}`);
      console.log(`   Duplicate Deposit Response Message: "${err.response?.data?.message}"`);
      if (err.response?.status === 409) {
        console.log('   ✅ SUCCESS: Replay attack successfully caught and rejected by server (409 Conflict).');
      } else {
        console.log(`   ⚠️ WARNING: Expected 409 but received status ${err.response?.status}`);
      }
    }

    await axios.post(
      `${BASE_URL}/wallet/add`,
      { amount: depositAmount, idempotencyKey: `user2_key_${uniqueSuffix}` },
      { headers: { Authorization: `Bearer ${user2Token}` } }
    );
    console.log('   User 2 Wallet topped up with 100,000 paise.\n');

    console.log('3. Admin initializing new event with seats mapping...');
    const eventRes = await axios.post(
      `${BASE_URL}/events`,
      {
        title: `Mega Live Concert ${uniqueSuffix}`,
        description: 'An exclusive concert event for concurrency verification.',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), 
        totalSeats: 15
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    eventId = eventRes.data.event._id;
    console.log(`   Created Event: "${eventRes.data.event.title}" (ID: ${eventId})`);

    const seatsRes = await axios.get(`${BASE_URL}/events/${eventId}/seats`);
    console.log(`   Seats successfully mapped. Total seats generated: ${seatsRes.data.length}`);
    seatToLock = seatsRes.data[0].seatNumber; 
    console.log(`   Targeting Seat: "${seatToLock}" for concurrency stress test.\n`);

    console.log(`4. Simulating race condition: Locking seat "${seatToLock}" concurrently at the same millisecond...`);
    
    const request1 = axios.post(
      `${BASE_URL}/bookings/reserve`,
      { eventId, seats: [seatToLock] },
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );

    const request2 = axios.post(
      `${BASE_URL}/bookings/reserve`,
      { eventId, seats: [seatToLock] },
      { headers: { Authorization: `Bearer ${user2Token}` } }
    );

    const results = await Promise.allSettled([request1, request2]);

    let successCount = 0;
    let failureCount = 0;
    let winner = null;
    let rejectedMsg = '';

    results.forEach((res, index) => {
      const user = index === 0 ? 'User 1' : 'User 2';
      if (res.status === 'fulfilled') {
        successCount++;
        winner = user;
        console.log(`   ✅ Request from ${user} SUCCEEDED. Lock acquired!`);
      } else {
        failureCount++;
        rejectedMsg = res.reason.response?.data?.message || res.reason.message;
        console.log(`   ❌ Request from ${user} REJECTED. Status: ${res.reason.response?.status}, Message: "${rejectedMsg}"`);
      }
    });

    console.log('\n--- Concurrency Test Results Summary ---');
    console.log(`   Successful Locks: ${successCount}`);
    console.log(`   Rejected Locks: ${failureCount}`);
    if (successCount === 1 && failureCount === 1) {
      console.log(`   🏆 WINNER: ${winner}`);
      console.log('   ✅ CONCURRENCY CHECK PASSED: Double-booking successfully prevented. Only one lock was granted.');
    } else {
      console.error('   ❌ CONCURRENCY CHECK FAILED: Lock results did not equal exactly 1 success and 1 failure.');
    }
    console.log('----------------------------------------\n');

  } catch (error) {
    console.error('❌ Integration pipeline encountered unexpected error:');
    if (error.response) {
      console.error(`   API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

runTests();
