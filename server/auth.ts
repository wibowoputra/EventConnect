import { Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "RGV3aUAxNzAx";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export async function login(username: string, password: string) {
  console.log('Debug - Attempting to find user:', username);
  const user = await storage.getUserByUsername(username);
  
  console.log('Debug - User lookup result:', {
    found: !!user,
    user: user ? {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      passwordLength: user.password.length
    } : null
  });
  
  if (!user) {
    throw new Error("Invalid username or password");
  }

  console.log('Debug - Starting password comparison');
  const isValidPassword = await compare(password, user.password);
  console.log('Debug - Password comparison completed:', { isValidPassword });
  
  if (!isValidPassword) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign(
    { 
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
} 