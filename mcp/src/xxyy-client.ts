export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
  success: boolean;
}

const ErrorCode = {
  API_KEY_INVALID: 8060,
  API_KEY_DISABLED: 8061,
  RATE_LIMITED: 8062,
  IP_FORBIDDEN: 8063,
  SERVER_ERROR: 300,
} as const;

const REQUEST_TIMEOUT_MS = 30_000;

export class XxyyApiError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = "XxyyApiError";
  }
}

function formatHttpError(status: number, statusText: string): string {
  if (status === 401 || status === 403) {
    return `Authentication failed (HTTP ${status}). Check your XXYY_API_KEY.`;
  }
  if (status === 408 || status === 504) {
    return `Request timed out (HTTP ${status}). The XXYY server may be slow — try again later.`;
  }
  if (status >= 500) {
    return `XXYY server error (HTTP ${status}). Try again later.`;
  }
  return `HTTP ${status}: ${statusText}`;
}

function isValidApiResponse(json: unknown): json is ApiResponse {
  return (
    typeof json === "object" &&
    json !== null &&
    "code" in json &&
    typeof (json as ApiResponse).code === "number" &&
    "msg" in json &&
    "success" in json
  );
}

export class XxyyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://www.xxyy.io") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    params?: Record<string, string>,
    body?: unknown,
    retries = 2,
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += `?${qs}`;
    }

    const init: RequestInit = {
      method,
      headers: this.headers(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    if (!res.ok) {
      if (res.status === 403) {
        try {
          const body: unknown = await res.json();
          if (
            typeof body === "object" &&
            body !== null &&
            "code" in body &&
            typeof (body as { code: unknown }).code === "number"
          ) {
            const code = (body as { code: number }).code;
            if (code === ErrorCode.IP_FORBIDDEN) {
              throw new XxyyApiError(
                res.status,
                "IP not in whitelist (HTTP 403). Your current IP is not allowed by API Key's whitelist. " +
                  "Use get_ip to check your outbound IP, then update whitelist at https://www.xxyy.io/apikey",
              );
            }
          }
        } catch (e) {
          if (e instanceof XxyyApiError) throw e;
          // Failed to parse body — fall through to generic message
        }
        throw new XxyyApiError(
          res.status,
          "Authentication failed (HTTP 403). Check your XXYY_API_KEY. " +
            "If the key is correct, your IP may not be in the whitelist — use get_ip to check your outbound IP, then update whitelist at https://www.xxyy.io/apikey",
        );
      }
      throw new XxyyApiError(
        res.status,
        formatHttpError(res.status, res.statusText),
      );
    }

    const raw: unknown = await res.json();

    if (!isValidApiResponse(raw)) {
      throw new XxyyApiError(
        0,
        "Unexpected API response format. The XXYY API may have changed.",
      );
    }

    const json = raw as ApiResponse<T>;

    // Handle error codes
    if (
      json.code === ErrorCode.API_KEY_INVALID ||
      json.code === ErrorCode.API_KEY_DISABLED
    ) {
      throw new XxyyApiError(json.code, `API Key error: ${json.msg}`);
    }

    if (json.code === ErrorCode.RATE_LIMITED) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 2000));
        return this.request(method, path, params, body, retries - 1);
      }
      throw new XxyyApiError(
        ErrorCode.RATE_LIMITED,
        "Rate limited. Please try again later.",
      );
    }

    if (json.code === ErrorCode.SERVER_ERROR) {
      throw new XxyyApiError(
        ErrorCode.SERVER_ERROR,
        `Server error: ${json.msg}`,
      );
    }

    return json;
  }

  async get<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request("GET", path, params);
  }

  async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request("POST", path, params, body);
  }

  /**
   * POST without rate-limit retry. Use for irreversible operations (swap).
   */
  async postNoRetry<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request("POST", path, params, body, 0);
  }
}

let clientInstance: XxyyClient | null = null;

export function getClient(): XxyyClient {
  if (!clientInstance) {
    const apiKey = process.env.XXYY_API_KEY;
    if (!apiKey) {
      throw new Error(
        "XXYY_API_KEY environment variable is required. " +
          "Get your API key at https://xxyy.io",
      );
    }
    const baseUrl = process.env.XXYY_API_BASE_URL || "https://www.xxyy.io";
    clientInstance = new XxyyClient(apiKey, baseUrl);
  }
  return clientInstance;
}
