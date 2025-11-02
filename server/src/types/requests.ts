import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
  validatedBody?: unknown;
  validatedParams?: unknown;
  uploadedFile?: Request["uploadedFile"];
}
