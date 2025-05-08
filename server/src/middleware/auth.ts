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
): Response | void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT secret not configured" });
  }

  try {
    if (!jwtSecret) {
      throw new Error("JWT secret is undefined");
    }
    const decodedToken = jwt.verify(token, jwtSecret);
    (req as AuthenticatedRequest).user = decodedToken;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
const router = Router();

export default authMiddleware;
