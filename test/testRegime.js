const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:4000/api';

let users = [];         // { id, email, password, token }
let gigs = [];          // { id, ownerId }
let bids = [];          // { id, gigId, bidderId }

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper functions for API interactions

async function registerUser(name, email, password) {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    console.log(`Registered: ${email}`);
    return res.data;
  } catch (err) {
    console.error(`Register error for ${email}:`, err.response?.data || err.message);
  }
}

async function loginUser(email, password) {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    console.log(`Logged in: ${email}`);
    return res.data.token;
  } catch (err) {
    console.error(`Login error for ${email}:`, err.response?.data || err.message);
  }
}

async function createGig(token, title, description, price) {
  try {
    const res = await axios.post(
      `${API_BASE}/gigs`,
      { title, description, price },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Created gig: ${title}`);
    return res.data.gigId;
  } catch (err) {
    console.error('Create gig error:', err.response?.data || err.message);
  }
}

async function placeBid(token, gig_id, amount) {
  try {
    const res = await axios.post(
      `${API_BASE}/bids`,
      { gig_id, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Placed bid of $${amount} on gig ${gig_id}`);
    return res.data.bidId;
  } catch (err) {
    console.error('Place bid error:', err.response?.data || err.message);
  }
}

async function sendMessage(token, gigId, bidId, content) {
  try {
    const res = await axios.post(
      `${API_BASE}/messages`,
      { gigId, bidId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Sent message: "${content}"`);
    return res.data;
  } catch (err) {
    console.error('Send message error:', err.response?.data || err.message);
  }
}

async function deleteGig(token, gigId) {
  try {
    await axios.delete(`${API_BASE}/gigs/${gigId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Deleted gig ${gigId}`);
  } catch (err) {
    console.error('Delete gig error:', err.response?.data || err.message);
  }
}

async function cleanup() {
  // Delete gigs
  for (let gig of gigs) {
    const owner = users.find(u => u.id === gig.ownerId);
    if (owner) {
      await deleteGig(owner.token, gig.id);
    }
    await sleep(50);
  }
}

// Main test sequence
(async function runTests() {
  // 1. Create 10 users sequentially
  for (let i = 1; i <= 10; i++) {
    const name = `User${i}`;
    const email = `user${i}@example.com`;
    const password = 'password123';
    
    await registerUser(name, email, password);
    const token = await loginUser(email, password);
    
    users.push({ id: i.toString(), email, password, token });
    await sleep(100);
  }

  // 2. First 3 users create gigs
  for (let i = 0; i < 3; i++) {
    const user = users[i];
    const title = `Gig Title by ${user.email}`;
    const description = `Description for gig by ${user.email}`;
    const price = (100 + i * 50).toString();
    const gigId = await createGig(user.token, title, description, price);
    if (gigId) {
      gigs.push({ id: gigId, ownerId: user.id });
    }
    await sleep(100);
  }

  // 3. Next 3 users bid on each gig
  for (let gig of gigs) {
    for (let j = 3; j < 6; j++) {
      const bidder = users[j];
      const amount = (150 + j * 10).toString();
      const bidId = await placeBid(bidder.token, gig.id, amount);
      if (bidId) {
        bids.push({ id: bidId, gigId: gig.id, bidderId: bidder.id });
      }
      await sleep(100);
    }
  }

  // 4. Exchange messages for each bid between gig owner and bidder
  for (let bid of bids) {
    const gig = gigs.find(g => g.id === bid.gigId);
    if (!gig) continue;
    
    const owner = users.find(u => u.id === gig.ownerId);
    const bidder = users.find(u => u.id === bid.bidderId);
    
    if (owner && bidder) {
      await sendMessage(owner.token, gig.id, bid.id, "Owner message: Thanks for bidding!");
      await sendMessage(bidder.token, gig.id, bid.id, "Bidder message: Looking forward to working with you.");
      await sleep(100);
    }
  }

  // 5. Cleanup created gigs
  await cleanup();
  console.log('Cleanup completed.');
})();
