import dotenv from "dotenv";
import { NextFunction, Request, Response, Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("Authenticating request:", req.method, req.url);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = authHeader?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ message: "JWT secret not configured" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret);
    (req as AuthenticatedRequest).user = decodedToken;
    console.log(
      "Authentication successful for user and for request",
      decodedToken,
      req.method,
      req.url
    );
    next();
    return;
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
const router = Router();

export default authMiddleware;
