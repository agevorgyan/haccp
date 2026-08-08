import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface StandardErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
  requestId: string;
}

/**
 * Global NestJS Exception Filter
 * Catches all HTTP and unhandled system exceptions, formatting responses into the standardized structure:
 * { "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": {} }, "requestId": "..." }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req-${Math.random().toString(36).substring(2, 11)}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal server error occurred.';
    let details: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      code = exception.name || `HTTP_${status}`;

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        if (Array.isArray(resObj.message)) {
          message = resObj.message.join('; ');
          details = { validationErrors: resObj.message };
        } else {
          message = resObj.message || exception.message;
          details = resObj.error || resObj.details || {};
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'UNKNOWN_ERROR';
    }

    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status ${status} - ${code}: ${message}`,
      (exception as Error)?.stack,
    );

    const errorBody: StandardErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      requestId,
    };

    response.status(status).json(errorBody);
  }
}
