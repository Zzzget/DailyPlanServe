import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes';

interface NormalizedError {
  code: string;
  message: string;
}

/**
 * 统一错误响应格式：{ code, message, statusCode, path, timestamp }
 * 前端仅需读取 code 做文案映射，message 作为兜底展示文本。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { code, message } = this.normalize(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      code,
      message,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalize(exception: unknown, status: number): NormalizedError {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'code' in body) {
        const b = body as { code: string; message?: string | string[] };
        return {
          code: b.code,
          message: Array.isArray(b.message)
            ? b.message.join('; ')
            : (b.message ?? exception.message),
        };
      }
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const b = body as { message?: string | string[] };
        return {
          code:
            status === HttpStatus.BAD_REQUEST
              ? ErrorCode.VALIDATION_ERROR
              : ErrorCode.INTERNAL_ERROR,
          message: Array.isArray(b.message)
            ? b.message.join('; ')
            : (b.message ?? exception.message),
        };
      }
      return { code: ErrorCode.INTERNAL_ERROR, message: exception.message };
    }

    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: '服务器内部错误，请稍后重试',
    };
  }
}
