import type { RequestHandler } from "express";
import { z } from "zod";

import { ValidationError } from "../core/errors/validation-error.js";

type RequestSchemas = Readonly<{
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}>;

export const validateRequest =
  (schemas: RequestSchemas): RequestHandler =>
  async (request, _response, next) => {
    const parse = async (
      schema: z.ZodType | undefined,
      value: unknown,
    ): Promise<unknown> => {
      if (schema === undefined) return undefined;
      const result = await schema.safeParseAsync(value);
      if (!result.success) {
        throw new ValidationError(z.treeifyError(result.error));
      }
      return result.data;
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
