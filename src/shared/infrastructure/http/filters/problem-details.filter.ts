import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

import { DomainError } from "@shared/domain/domain-error.base";

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, title, detail } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const problem: ProblemDetails = {
      type: "about:blank",
      title,
      status,
      detail,
      instance: request.url,
    };

    response.status(status).contentType("application/problem+json").json(problem);
  }

  private resolve(exception: unknown): { status: number; title: string; detail: string } {
    if (exception instanceof DomainError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        title: exception.name,
        detail: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const detail =
        typeof response === "string"
          ? response
          : ((response as { message?: string | string[] }).message ?? exception.message);

      return {
        status,
        title: exception.constructor.name,
        detail: Array.isArray(detail) ? detail.join(", ") : detail,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      title: "InternalServerError",
      detail: "An unexpected error occurred",
    };
  }
}
