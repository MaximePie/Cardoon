import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction, Router } from "express";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    const error = new Error("Authorization header missing");
    next("Authorization header missing");
  }

  const token = authHeader?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return next("Token missing");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ message: "JWT secret not configured" });
    next("JWT secret not configured");
  }

  try {
    if (!jwtSecret) {
      throw new Error("JWT secret is undefined");
    }
    const decodedToken = jwt.verify(token, jwtSecret);
    (req as AuthenticatedRequest).user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    next("Invalid token");
  }
};
const router = Router();

export default authMiddleware;
