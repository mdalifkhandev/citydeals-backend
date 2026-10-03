import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
      const responseMessage = (exceptionResponse as any).message;
      if (Array.isArray(responseMessage)) {
        message = responseMessage.join(', ');
      } else if (typeof responseMessage === 'string') {
        message = responseMessage;
      }
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
