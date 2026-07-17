import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import {
  RegisterUserBody,
  LoginUserBody,
} from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const parse = RegisterUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request data" });
    return;
  }

  const { fullName, email, phone, password, signatureData } = parse.data;

  try {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(usersTable)
      .values({
        fullName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        hasSignature: !!signatureData,
        signatureData: signatureData ?? null,
      })
      .returning();

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        hasSignature: user.hasSignature,
        signatureData: user.signatureData,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parse = LoginUserBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request data" });
    return;
  }

  const { email, password } = parse.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        hasSignature: user.hasSignature,
        signatureData: user.signatureData,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      hasSignature: user.hasSignature,
      signatureData: user.signatureData,
      createdAt: user.createdAt.toISOString(),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
