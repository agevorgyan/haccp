import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardSuccessResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Global NestJS Transform Interceptor
 * Standardizes all successful REST API responses into the enterprise structure:
 * { "success": true, "data": <payload> }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardSuccessResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Avoid double wrapping if already formatted as standard response
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          return data;
        }

        return {
          success: true,
          data: data !== undefined ? data : (null as any),
        };
      }),
    );
  }
}
