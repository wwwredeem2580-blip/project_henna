import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';

// -----------------------
// K6 Options
// -----------------------
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp-up
    { duration: '3m', target: 50 },   // Sustained load
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],    // Max 2% errors
    http_req_duration: ['p(95)<2000'], // 95% requests < 2s
  },
};

// -----------------------
// Load Test Users from CSV
// -----------------------
const users = new SharedArray('users', function () {
  return open('./dummy_users.csv')
    .split('\n')
    .slice(1) // skip header
    .map(line => {
      const [email, password] = line.split(',');
      return { email, password };
    });
});

const BASE_URL = 'https://zenvy.com.bd';

// -----------------------
// Main Test Function
// -----------------------
export default function () {

  // -----------------------
  // 1️⃣ Pick Random Test User & Login
  // -----------------------
  const user = users[Math.floor(Math.random() * users.length)];

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login success': r => r.status === 200 });

  const token = loginRes.json('token');
  if (!token) return;

  const authHeaders = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

  sleep(Math.random() * 2 + 1); // human-like think time

  // -----------------------
  // 2️⃣ Fetch Public Events
  // -----------------------
  const eventsRes = http.get(`${BASE_URL}/api/event/public`, authHeaders);
  check(eventsRes, { 'events fetched': r => r.status === 200 });

  const events = eventsRes.json();
  if (!events || events.length === 0) return;

  // Pick random event
  const event = events[Math.floor(Math.random() * events.length)];

  sleep(Math.random() * 2 + 1);

  // -----------------------
  // 3️⃣ Fetch Tickets for Event
  // -----------------------
  const ticketsRes = http.get(`${BASE_URL}/api/event/${event.id}/tickets`, authHeaders);
  check(ticketsRes, { 'tickets fetched': r => r.status === 200 });

  const tickets = ticketsRes.json();
  if (!tickets || tickets.length === 0) return;

  // Pick random ticket variant
  const ticket = tickets[Math.floor(Math.random() * tickets.length)];

  sleep(Math.random() * 1 + 1);

  // -----------------------
  // 4️⃣ Create Order
  // -----------------------
  const orderPayload = {
    eventId: event.id,
    ticketId: ticket.id,
    quantity: 1 // can randomize if needed
  };

  const orderRes = http.post(`${BASE_URL}/api/order`, JSON.stringify(orderPayload), authHeaders);
  check(orderRes, { 'order created': r => r.status === 200 });

  const order = orderRes.json();
  if (!order || !order.id) return;

  sleep(Math.random() * 2 + 1);

  // -----------------------
  // 5️⃣ Simulate Payment (Dummy/Free Ticket)
  // -----------------------
  const paymentRes = http.get(`${BASE_URL}/api/order/${order.id}/bkash/callback`, authHeaders);
  check(paymentRes, { 'payment simulated': r => r.status === 200 });

  sleep(Math.random() * 2 + 1);

  // -----------------------
  // 6️⃣ Verify Wallet / Order appears
  // -----------------------
  const walletRes = http.get(`${BASE_URL}/api/wallet`, authHeaders);
  check(walletRes, { 'wallet updated': r => r.status === 200 });

  sleep(Math.random() * 2 + 1);
}
