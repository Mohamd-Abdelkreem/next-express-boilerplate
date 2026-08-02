import type { RequestHandler } from "express";
import type { z } from "zod";

type RequestSchemas = Readonly<{
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}>;

export const validationMiddleware =
  (schemas: RequestSchemas): RequestHandler =>
  async (request, _response, next) => {
    const parse = async (
      schema: z.ZodType | undefined,
      value: unknown,
    ): Promise<unknown> => {
      if (schema === undefined) return undefined;
      return schema.parseAsync(value);
    };

    const [body, params, query] = await Promise.all([
      parse(schemas.body, request.body),
      parse(schemas.params, request.params),
      parse(schemas.query, request.query),
    ]);

    request.validated = {
      ...(schemas.body === undefined ? {} : { body }),
      ...(schemas.params === undefined ? {} : { params }),
      ...(schemas.query === undefined ? {} : { query }),
    };
    next();
  };

export const validateRequest = validationMiddleware;
