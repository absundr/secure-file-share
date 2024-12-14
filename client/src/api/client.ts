/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_API_URL } from "@/constants";
import { store } from "../store/store";

class ApiClient {
  private readonly BASE_URL: string;
  constructor() {
    this.BASE_URL = BASE_API_URL;
  }

  getAuthToken(): string | null {
    const state = store.getState();
    return state?.auth?.token || null;
  }

  async request(
    endpoint: string,
    { method = "GET", headers = {}, body = null } = {}
  ) {
    const authToken = this.getAuthToken();
    const token = authToken ? `Token ${authToken}` : null;
    headers = {
      Authorization: token,
      ...headers,
    };

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.BASE_URL}/${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Error ${response.status}: ${error.message || response.statusText}`
      );
    }
    return response.json();
  }

  get(endpoint: string, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint: string, body: any, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint: string, body: any, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  delete(endpoint: string, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

const apiClient = new ApiClient();
export default apiClient;
