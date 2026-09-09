function resolveBaseUrl() {
  const configuredUrl = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_API_URL?.trim() : undefined;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5001/api`;
  }

  return "http://localhost:5001/api";
}

const BASE_URL = resolveBaseUrl();

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${normalizedEndpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new Error("Unable to reach the server. Please check that the backend is running.");
  }

  if (response.status === 204) {
    return {} as T;
  }

  const rawPayload = await response.text();
  let data: any = {};

  if (rawPayload) {
    try {
      data = JSON.parse(rawPayload);
    } catch (error) {
      data = { message: rawPayload };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string) {
    return request<T>(endpoint, { method: "GET" });
  },
  post<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, { method: "POST", body });
  },
  patch<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, { method: "PATCH", body });
  },
  put<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, { method: "PUT", body });
  },
  delete<T>(endpoint: string) {
    return request<T>(endpoint, { method: "DELETE" });
  },
};

export { BASE_URL };
