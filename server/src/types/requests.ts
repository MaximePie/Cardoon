import { Request } from "express";

export interface AuthenticatedRequest<TBody = unknown, TParams = unknown>
  extends Request {
  user: {
    id: string;
  };
  validatedBody?: TBody;
  validatedParams?: TParams;
  uploadedFile?: Request["uploadedFile"];
}

// Specific request types for common use cases
export interface UserRegistrationRequest
  extends AuthenticatedRequest<{
    email: string;
    password: string;
    username: string;
  }> {}

export interface UserLoginRequest
  extends AuthenticatedRequest<{
    email?: string;
    username?: string;
    password: string;
    rememberMe?: boolean;
  }> {}

export interface DailyGoalRequest
  extends AuthenticatedRequest<{
    target: number;
  }> {}

export interface ItemRequest
  extends AuthenticatedRequest<{
    itemId: import("mongoose").ObjectId;
  }> {}
