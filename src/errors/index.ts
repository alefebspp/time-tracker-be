import AppError from "./AppError";
import { HTTP_STATUS } from "@/constants";

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}
