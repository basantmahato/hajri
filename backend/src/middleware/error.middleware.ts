import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

export const errorHandler = (logger: Logger) => {
  return (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error(err);

    if (err.name === 'ZodError' || (err as any).issues) {
      const issues = (err as any).issues || [];
      const errorMsg = issues.map((i: any) => `${i.path.join('.') || 'body'}: ${i.message}`).join(', ') || 'Validation error';
      res.status(400).json({
        error: errorMsg,
        details: err.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  };
};
