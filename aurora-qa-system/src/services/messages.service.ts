import axios, { AxiosError } from "axios";
import { config } from "@/lib/config";
import {
  Message,
  MessageQueryParams,
  MessagesResponse,
} from "@/types/api.types";

class MessagesCache {
  private messages: Message[] = [];
  private lastFetched: Date | null = null;
  private isFetching: boolean = false;

  getAll(): Message[] {
    return this.messages;
  }

  isPopulated(): boolean {
    return this.messages.length > 0;
  }

  getAge(): number | null {
    if (!this.lastFetched) return null;
    return Date.now() - this.lastFetched.getTime();
  }

  setMessages(messages: Message[]): void {
    this.messages = messages;
    this.lastFetched = new Date();
  }

  clear(): void {
    this.messages = [];
    this.lastFetched = null;
  }

  isFetchingData(): boolean {
    return this.isFetching;
  }

  setFetching(state: boolean): void {
    this.isFetching = state;
  }
}

const cache = new MessagesCache();

async function fetchMessages(
  params: MessageQueryParams = {}
): Promise<MessagesResponse> {
  const { skip = 0, limit = 100 } = params;

  const url = `${config.api.baseUrl}/messages/`;

  // Debug logging
  console.log("Fetching from URL:", url);
  console.log("With params:", { skip, limit });
  console.log("Full URL would be:", `${url}?skip=${skip}&limit=${limit}`);

  try {
    const response = await axios.get<MessagesResponse>(url, {
      params: { skip, limit },
      timeout: config.api.timeout,
      headers: {
        Accept: "application/json",
      },
    });

    console.log(
      "Success! Got response with",
      response.data.items?.length,
      "items"
    );
    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("API Error Details:");
      console.error("- Status:", axiosError.response?.status);
      console.error("- Status Text:", axiosError.response?.statusText);
      console.error("- Response Data:", axiosError.response?.data);
      console.error("- Request URL:", axiosError.config?.url);
      console.error("- Request Params:", axiosError.config?.params);

      throw new Error(
        `Failed to fetch messages: ${axiosError.message} (Status: ${axiosError.response?.status})`
      );
    }
    throw new Error("An unexpected error occurred while fetching messages");
  }
}

export async function fetchAllMessages(): Promise<Message[]> {
  // Prevent concurrent fetches
  if (cache.isFetchingData()) {
    throw new Error("Already fetching messages");
  }

  cache.setFetching(true);

  try {
    const allMessages: Message[] = [];
    let skip = 0;
    const limit = 100; // Fetch in batches of 100

    // First request to get total count
    const firstBatch = await fetchMessages({ skip, limit });
    allMessages.push(...firstBatch.items);

    const totalMessages = firstBatch.total;
    skip += limit;

    // Fetch remaining messages
    while (skip < totalMessages) {
      const batch = await fetchMessages({ skip, limit });
      allMessages.push(...batch.items);
      skip += limit;
    }

    cache.setMessages(allMessages);
    return allMessages;
  } finally {
    cache.setFetching(false);
  }
}

export async function getAllMessages(): Promise<Message[]> {
  if (cache.isPopulated()) {
    return cache.getAll();
  }

  return await fetchAllMessages();
}

export function getMessagesByUserId(userId: string): Message[] {
  return cache.getAll().filter((msg) => msg.user_id === userId);
}

export function getMessagesByUserName(userName: string): Message[] {
  const normalizedName = userName.toLowerCase().trim();
  return cache
    .getAll()
    .filter((msg) => msg.user_name.toLowerCase().includes(normalizedName));
}

export function searchMessages(query: string): Message[] {
  const normalizedQuery = query.toLowerCase().trim();
  return cache
    .getAll()
    .filter((msg) => msg.message.toLowerCase().includes(normalizedQuery));
}

export function getCacheStats() {
  return {
    messageCount: cache.getAll().length,
    isPopulated: cache.isPopulated(),
    lastFetched: cache.getAge() ? new Date(Date.now() - cache.getAge()!) : null,
    ageMs: cache.getAge(),
  };
}

export function clearCache(): void {
  cache.clear();
}
