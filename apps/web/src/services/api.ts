import { publicEnvironment } from "@/config/public-environment";

import { ApiClient } from "./api-client";

export const api = new ApiClient(publicEnvironment.NEXT_PUBLIC_API_URL);
