type JsonObject = Record<string, unknown>;

type ApiErrorPayload = Readonly<{
  success?: boolean;
  error?: { code?: unknown; message?: unknown; details?: unknown };
  requestId?: unknown;
}>;

export class ApiClientError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly requestId: string | undefined;
  readonly status: number;

  constructor(options: {
    code: string;
    message: string;
    status: number;
    cause?: unknown;
    details?: unknown;
    requestId?: string | undefined;
  }) {
    super(
      options.message,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = "ApiClientError";
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonObject | unknown[];
};

const isJsonBody = (
  body: ApiRequestOptions["body"],
): body is JsonObject | unknown[] =>
  body !== undefined &&
  typeof body === "object" &&
  !(body instanceof FormData) &&
  !(body instanceof Blob) &&
  !(body instanceof ArrayBuffer) &&
  !ArrayBuffer.isView(body) &&
  !(body instanceof URLSearchParams);

const joinUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

const parseResponseBody = (response: Response, text: string): unknown => {
  if (text.length === 0 || response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return text;

  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new ApiClientError({
      code: "INVALID_JSON_RESPONSE",
      message: "The server returned an invalid JSON response.",
      status: response.status,
      cause,
      requestId: response.headers.get("x-request-id") ?? undefined,
    });
  }
};

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { body: requestBody, ...requestOptions } = options;
    const headers = new Headers(options.headers);
    let body: BodyInit | undefined;

    if (isJsonBody(requestBody)) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(requestBody);
    } else {
      body = requestBody;
    }

    try {
      const response = await fetch(joinUrl(this.baseUrl, path), {
        ...requestOptions,
        ...(body === undefined ? {} : { body }),
        headers,
      });
      const text = await response.text();
      const payload = parseResponseBody(response, text);

      if (!response.ok) {
        const apiError = payload as ApiErrorPayload | undefined;
        throw new ApiClientError({
          code:
            typeof apiError?.error?.code === "string"
              ? apiError.error.code
              : "HTTP_ERROR",
          message:
            typeof apiError?.error?.message === "string"
              ? apiError.error.message
              : "The request could not be completed.",
          status: response.status,
          details: apiError?.error?.details,
          requestId:
            typeof apiError?.requestId === "string"
              ? apiError.requestId
              : (response.headers.get("x-request-id") ?? undefined),
        });
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiClientError({
          code: "REQUEST_ABORTED",
          message: "The request was cancelled.",
          status: 0,
          cause: error,
        });
      }
      throw new ApiClientError({
        code: "NETWORK_ERROR",
        message: "The server could not be reached.",
        status: 0,
        cause: error,
      });
    }
  }
}
