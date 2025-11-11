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
  params: MessageQueryParams = {},
  retries: number = 3
): Promise<MessagesResponse> {
  const { skip = 0, limit = 50 } = params;
  const url = `${config.api.baseUrl}/messages/`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get<MessagesResponse>(url, {
        params: { skip, limit },
        timeout: config.api.timeout,
        headers: {
          Accept: "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const isTimeout = axiosError.code === "ECONNABORTED";
        const status = axiosError.response?.status;

        // Retry on timeout
        if (isTimeout && attempt < retries) {
          console.log(`Request timeout, retrying (${attempt}/${retries})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        // Log error for debugging
        console.error(`API Error: ${axiosError.message} (Status: ${status})`);

        throw new Error(
          `Failed to fetch messages: ${axiosError.message} (Status: ${
            status || "timeout"
          })`
        );
      }

      throw new Error("An unexpected error occurred while fetching messages");
    }
  }

  throw new Error("Failed after all retry attempts");
}

export async function fetchAllMessages(): Promise<Message[]> {
  if (cache.isFetchingData()) {
    throw new Error("Already fetching messages");
  }

  cache.setFetching(true);

  try {
    const allMessages: Message[] = [];
    let skip = 0;
    const limit = 50;
    let hasMore = true;

    console.log("Fetching messages from external API...");

    while (hasMore) {
      try {
        const batch = await fetchMessages({ skip, limit });

        if (batch.items && batch.items.length > 0) {
          allMessages.push(...batch.items);

          if (batch.items.length < limit) {
            hasMore = false;
          } else {
            skip += limit;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          // If first request failed, that's a real problem
          if (allMessages.length === 0 && skip === 0) {
            console.error("Failed to fetch initial batch from API");
            throw new Error(
              `Cannot fetch messages from API. Status: ${status || "unknown"}`
            );
          }

          // Any 4xx error during pagination = stop and use what we have
          if (status && status >= 400 && status < 500) {
            console.log(
              `API pagination limit reached. Cached ${allMessages.length} messages.`
            );
            hasMore = false;
          } else if (status && status >= 500) {
            // 5xx server error
            if (allMessages.length > 0) {
              console.log(
                `Server error, using ${allMessages.length} cached messages.`
              );
              hasMore = false;
            } else {
              throw error;
            }
          } else {
            // Network error or timeout
            if (allMessages.length > 0) {
              console.log(
                `Network error, using ${allMessages.length} cached messages.`
              );
              hasMore = false;
            } else {
              throw error;
            }
          }
        } else {
          // Non-axios error
          if (allMessages.length > 0) {
            console.log(
              `Error occurred, using ${allMessages.length} cached messages.`
            );
            hasMore = false;
          } else {
            throw error;
          }
        }
      }
    }

    console.log(`Successfully cached ${allMessages.length} messages.`);

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
