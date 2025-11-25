// Session management - no external OAuth, just local session storage
import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupSessionAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.session?.user?.claims?.sub) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export function isAdmin(req: any, res: any, next: any) {
  if (req.session?.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}
