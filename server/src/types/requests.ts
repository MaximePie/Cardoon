import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  uploadedFile?: any;
}
