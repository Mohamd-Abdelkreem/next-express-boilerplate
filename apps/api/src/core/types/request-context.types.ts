export interface AuthenticatedUser {
  id: string;
  role: string;
}

export interface ValidatedRequestData {
  body?: unknown;
  params?: unknown;
  query?: unknown;
}
