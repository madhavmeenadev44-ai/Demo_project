import { Transaction, PaymentMethod, TransactionStatus } from "@/features/transactions/types";

// Seeded pseudorandom number generator for deterministic reproducibility
function createPrng(seed: number) {
  let state = seed;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const CUSTOMER_NAMES = [
  "Rahul Sharma",
  "Priya Patel",
  "Amit Verma",
  "Sneha Iyer",
  "Vikram Singh",
  "Ananya Roy",
  "Rohan Gupta",
  "Meera Nair",
  "Arjun Reddy",
  "Pooja Mehta",
  "Kavita Rao",
  "Aditya Joshi",
  "Neha Kapoor",
  "Karan Malhotra",
  "Ritu Desai",
  "Manish Pandey",
  "Swati Bhatt",
  "Naveen Kumar",
  "Sunita Menon",
  "Varun Dhawan",
  "Divya Agarwal",
  "Gaurav Tiwari",
  "Shweta Saxena",
  "Rajesh Kothari",
  "Tanvi Sen",
];

// Common transaction amounts in paise
const AMOUNTS_IN_PAISE = [
  9900,      // ₹99.00
  14900,     // ₹149.00
  29900,     // ₹299.00
  49900,     // ₹499.00
  75000,     // ₹750.00
  99900,     // ₹999.00
  125000,    // ₹1,250.00
  199900,    // ₹1,999.00
  250000,    // ₹2,500.00
  349900,    // ₹3,499.00
  500000,    // ₹5,000.00
  750000,    // ₹7,500.00
  1200000,   // ₹12,000.00
  2500000,   // ₹25,000.00
  5000000,   // ₹50,000.00
  12500000,  // ₹1,25,000.00
];

function generateMockTransactions(count = 200): Transaction[] {
  const prng = createPrng(42);
  const transactions: Transaction[] = [];

  // Base date: 2026-10-13T12:00:00.000Z
  const baseTime = new Date("2026-10-13T12:00:00.000Z").getTime();

  for (let i = 0; i < count; i++) {
    // Unique ID: TXN100001 ... TXN100200
    const id = `TXN${100001 + i}`;

    // Decrement time by 1 to 4 hours per transaction so order is newest first
    // deterministic spacing
    const hoursOffset = i * 2.8 + (prng() * 1.5);
    const dateObj = new Date(baseTime - hoursOffset * 3600 * 1000);
    const date = dateObj.toISOString();

    const customer = CUSTOMER_NAMES[Math.floor(prng() * CUSTOMER_NAMES.length)];
    const amount = AMOUNTS_IN_PAISE[Math.floor(prng() * AMOUNTS_IN_PAISE.length)];

    // Weighted payment methods: 60% UPI, 30% CARD, 10% WALLET
    const methodRand = prng();
    let method: PaymentMethod;
    if (methodRand < 0.60) {
      method = "UPI";
    } else if (methodRand < 0.90) {
      method = "CARD";
    } else {
      method = "WALLET";
    }

    // Weighted statuses: 75% SUCCESS, 15% FAILED, 10% PENDING
    const statusRand = prng();
    let status: TransactionStatus;
    if (statusRand < 0.75) {
      status = "SUCCESS";
    } else if (statusRand < 0.90) {
      status = "FAILED";
    } else {
      status = "PENDING";
    }

    transactions.push({
      id,
      date,
      customer,
      amount,
      method,
      status,
    });
  }

  // Ensure sorted strictly newest first
  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return transactions;
}

// Stable deterministic in-memory dataset of 200 records
export const MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions(200);

