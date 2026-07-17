import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// All banking routes require auth
router.use(requireAuth);

// ── Dashboard ─────────────────────────────────────────────
router.get("/dashboard", async (req: AuthRequest, res) => {
  const [user] = await db
    .select({ fullName: usersTable.fullName })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  res.json({
    balance: 25450.75,
    savingsBalance: 12240.0,
    totalIncome: 15200.0,
    totalExpenses: 3100.0,
    healthScore: 91,
    savingsGoalPercent: 68,
    daysToSalary: 9,
    cardNumber: "4532 **** **** 8821",
    monthlyChange: 18.4,
  });
});

// ── Transactions ──────────────────────────────────────────
const ALL_TRANSACTIONS = [
  { id: "1",  title: "Salary Deposit",    subtitle: "Company Transfer",    amount: 12000, type: "credit", category: "salary",        date: "Jul 1, 2026",  icon: "briefcase"      },
  { id: "2",  title: "Noon Shopping",     subtitle: "Online Purchase",     amount: 430,   type: "debit",  category: "shopping",      date: "Jul 3, 2026",  icon: "shopping-bag"   },
  { id: "3",  title: "STC Bill",          subtitle: "Internet & Mobile",   amount: 180,   type: "debit",  category: "bills",         date: "Jul 4, 2026",  icon: "wifi"           },
  { id: "4",  title: "Starbucks",         subtitle: "Riyadh Park Mall",    amount: 45,    type: "debit",  category: "food",          date: "Jul 5, 2026",  icon: "coffee"         },
  { id: "5",  title: "Careem",            subtitle: "Ride Service",        amount: 28,    type: "debit",  category: "transport",     date: "Jul 6, 2026",  icon: "car"            },
  { id: "6",  title: "SACO",              subtitle: "Home & Garden",       amount: 860,   type: "debit",  category: "shopping",      date: "Jul 7, 2026",  icon: "shopping-cart"  },
  { id: "7",  title: "Carrefour",         subtitle: "Grocery Shopping",    amount: 235,   type: "debit",  category: "food",          date: "Jul 8, 2026",  icon: "shopping-bag"   },
  { id: "8",  title: "Freelance Income",  subtitle: "Design Project",      amount: 3200,  type: "credit", category: "salary",        date: "Jul 9, 2026",  icon: "dollar-sign"    },
  { id: "9",  title: "Netflix",           subtitle: "Monthly Subscription",amount: 45,    type: "debit",  category: "entertainment", date: "Jul 10, 2026", icon: "play"           },
  { id: "10", title: "Al Baik",           subtitle: "Fast Food",           amount: 68,    type: "debit",  category: "food",          date: "Jul 11, 2026", icon: "utensils"       },
  { id: "11", title: "DEWA Bill",         subtitle: "Electricity",         amount: 320,   type: "debit",  category: "bills",         date: "Jul 12, 2026", icon: "zap"            },
  { id: "12", title: "Amazon",            subtitle: "Online Shopping",     amount: 512,   type: "debit",  category: "shopping",      date: "Jul 13, 2026", icon: "package"        },
];

router.get("/transactions", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;
  const typeFilter = req.query.type as string | undefined;

  let txs = ALL_TRANSACTIONS;
  if (typeFilter === "credit" || typeFilter === "debit") {
    txs = txs.filter((t) => t.type === typeFilter);
  }

  res.json(txs.slice(offset, offset + limit));
});

router.get("/transactions/:id", (req, res) => {
  const tx = ALL_TRANSACTIONS.find((t) => t.id === req.params.id);
  if (!tx) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(tx);
});

// ── Cards ─────────────────────────────────────────────────
const cards: Record<string, any> = {
  "card-1": {
    id: "card-1",
    number: "4532 **** **** 8821",
    holderName: "Ahmed Al-Rashidi",
    expiryDate: "12/28",
    isFrozen: false,
    type: "visa",
    balance: 25450.75,
  },
};

router.get("/cards", async (req: AuthRequest, res) => {
  const [user] = await db
    .select({ fullName: usersTable.fullName })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  const personalised = {
    ...cards["card-1"],
    holderName: user?.fullName ?? cards["card-1"].holderName,
  };
  res.json([personalised]);
});

router.patch("/cards/:id/freeze", (req, res) => {
  const card = cards[req.params.id];
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  const { frozen } = req.body as { frozen: boolean };
  card.isFrozen = frozen;
  res.json(card);
});

// ── Insights ──────────────────────────────────────────────
router.get("/insights", (_req, res) => {
  res.json([
    {
      id: "1",
      type: "saving",
      title: "Saving Opportunity",
      message: "You have 500 SAR idle for 6 months. Move to savings for 3.2% annual return.",
      actionLabel: "Move to Savings",
    },
    {
      id: "2",
      type: "prediction",
      title: "Month-End Forecast",
      message: "Based on your pattern, you'll have ~3,200 SAR at month end.",
      actionLabel: "See Details",
    },
    {
      id: "3",
      type: "subscription",
      title: "Unused Subscription",
      message: "Shahid subscription (45 SAR/mo) unused for 3 months.",
      actionLabel: "Cancel",
    },
    {
      id: "4",
      type: "fraud",
      title: "Fraud Alert",
      message: "Suspicious withdrawal of 50,000 SAR from an unknown device detected.",
      actionLabel: "Review Now",
    },
  ]);
});

// ── Spending breakdown ────────────────────────────────────
router.get("/spending", (_req, res) => {
  res.json([
    { name: "Food & Dining",   amount: 1200, color: "#f59e0b", icon: "utensils"      },
    { name: "Shopping",        amount: 800,  color: "#8b5cf6", icon: "shopping-bag"  },
    { name: "Bills",           amount: 500,  color: "#3b82f6", icon: "zap"           },
    { name: "Transport",       amount: 350,  color: "#10b981", icon: "car"           },
    { name: "Entertainment",   amount: 250,  color: "#ec4899", icon: "play"          },
  ]);
});

export default router;
