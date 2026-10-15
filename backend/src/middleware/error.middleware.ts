import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'pino';

export const errorHandler = (logger: Logger) => {
  return (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error(err);

    if (err.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
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
