import { NextRequest, NextResponse } from "next/server";
import { AskRequest, AskResponse, ErrorResponse } from "@/types/api.types";
import {
  getAllMessages,
  getMessagesByUserName,
  searchMessages,
} from "@/services/messages.service";
import { Message } from "@/types/api.types";

const QUESTION_PATTERNS = {
  whenTrip:
    /when\s+(?:is|does)\s+([a-zA-Z\s]+?)\s+(?:planning|going|traveling|visiting|flying|trip).*?(?:to|in)\s+([a-zA-Z\s]+)/i,

  howMany: /how\s+many\s+([a-zA-Z\s]+?)\s+(?:does|do)\s+([a-zA-Z\s]+?)\s+have/i,

  whatFavorite:
    /what\s+(?:are|is)\s+([a-zA-Z\s]+?)(?:'s|s)\s+favorite\s+([a-zA-Z\s]+)/i,

  whatPrefer: /what\s+(?:does|do)\s+([a-zA-Z\s]+?)\s+prefer/i,

  doesHave: /does\s+([a-zA-Z\s]+?)\s+have\s+([a-zA-Z\s]+)/i,
};

function parseQuestion(question: string): {
  type: string;
  userName?: string;
  context?: string;
  searchTerm?: string;
} {
  let match = question.match(QUESTION_PATTERNS.whenTrip);
  if (match) {
    return {
      type: "when_trip",
      userName: match[1].trim(),
      context: match[2].trim(), // location
    };
  }

  match = question.match(QUESTION_PATTERNS.howMany);
  if (match) {
    return {
      type: "how_many",
      searchTerm: match[1].trim(), // thing (e.g., "cars")
      userName: match[2].trim(),
    };
  }

  match = question.match(QUESTION_PATTERNS.whatFavorite);
  if (match) {
    return {
      type: "what_favorite",
      userName: match[1].trim(),
      searchTerm: match[2].trim(), // thing (e.g., "restaurants")
    };
  }

  match = question.match(QUESTION_PATTERNS.whatPrefer);
  if (match) {
    return {
      type: "what_prefer",
      userName: match[1].trim(),
    };
  }

  match = question.match(QUESTION_PATTERNS.doesHave);
  if (match) {
    return {
      type: "does_have",
      userName: match[1].trim(),
      searchTerm: match[2].trim(),
    };
  }

  return { type: "unknown" };
}

function answerQuestion(
  parsedQuestion: ReturnType<typeof parseQuestion>,
  messages: Message[]
): string {
  const { type, userName, context, searchTerm } = parsedQuestion;

  // Get messages for the specific user
  let userMessages: Message[] = [];
  if (userName) {
    userMessages = getMessagesByUserName(userName);

    if (userMessages.length === 0) {
      return `I couldn't find any information about ${userName}.`;
    }
  }

  switch (type) {
    case "when_trip": {
      const tripMessages = userMessages.filter(
        (msg) =>
          msg.message.toLowerCase().includes(context!.toLowerCase()) &&
          (msg.message.toLowerCase().includes("trip") ||
            msg.message.toLowerCase().includes("travel") ||
            msg.message.toLowerCase().includes("visit") ||
            msg.message.toLowerCase().includes("fly") ||
            msg.message.toLowerCase().includes("book"))
      );

      if (tripMessages.length === 0) {
        return `I couldn't find any trip plans to ${context} for ${userName}.`;
      }

      const firstTrip = tripMessages[0];
      const message = firstTrip.message;

      const temporalPattern =
        /(this|next|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|weekend|[\w\s]+day)/i;
      const dateMatch = message.match(temporalPattern);

      if (dateMatch) {
        return `${userName} is planning a trip to ${context} ${dateMatch[0]}.`;
      }

      return `${userName} has mentioned plans to visit ${context}. Details: "${message}"`;
    }

    case "how_many": {
      // Count mentions of the item
      const relevantMessages = userMessages.filter((msg) =>
        msg.message.toLowerCase().includes(searchTerm!.toLowerCase())
      );

      if (relevantMessages.length === 0) {
        return `I couldn't find any information about ${searchTerm} for ${userName}.`;
      }

      // Try to extract numbers from messages
      const numberPattern =
        /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/gi;
      const numbers: number[] = [];

      relevantMessages.forEach((msg) => {
        const matches = msg.message.match(numberPattern);
        if (matches) {
          matches.forEach((match) => {
            const num = parseInt(match, 10);
            if (!isNaN(num)) {
              numbers.push(num);
            } else {
              // Convert word to number
              const wordMap: Record<string, number> = {
                one: 1,
                two: 2,
                three: 3,
                four: 4,
                five: 5,
                six: 6,
                seven: 7,
                eight: 8,
                nine: 9,
                ten: 10,
              };
              const wordNum = wordMap[match.toLowerCase()];
              if (wordNum) numbers.push(wordNum);
            }
          });
        }
      });

      if (numbers.length > 0) {
        // Return the most common or largest number
        const count = Math.max(...numbers);
        return `${userName} has ${count} ${searchTerm}.`;
      }

      return `I found mentions of ${searchTerm} for ${userName}, but couldn't determine an exact count. Here's what I found: 
  "${relevantMessages[0].message}"`;
    }

    case "what_favorite": {
      // Search for favorite/preference mentions
      const favoriteMessages = userMessages.filter((msg) => {
        const msgLower = msg.message.toLowerCase();
        return (
          msgLower.includes(searchTerm!.toLowerCase()) &&
          (msgLower.includes("favorite") ||
            msgLower.includes("prefer") ||
            msgLower.includes("love") ||
            msgLower.includes("like"))
        );
      });

      if (favoriteMessages.length === 0) {
        return `I couldn't find any information about ${userName}'s favorite ${searchTerm}.`;
      }

      // Extract the specific favorites from messages
      const details = favoriteMessages.map((msg) => msg.message).join(" ");

      // Try to extract restaurant/place names (capitalized words)
      const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
      const names = details.match(namePattern);

      if (names && names.length > 0) {
        const uniqueNames = [...new Set(names)].filter(
          (name) =>
            name !== userName?.split(" ")[0] && name !== userName?.split(" ")[1]
        );
        if (uniqueNames.length > 0) {
          return `${userName}'s favorite ${searchTerm} include: ${uniqueNames
            .slice(0, 3)
            .join(", ")}.`;
        }
      }

      return `${userName} has mentioned preferences for ${searchTerm}. Here's what I found: "${favoriteMessages[0].message}"`;
    }

    case "what_prefer": {
      // Search for preference messages
      const preferMessages = userMessages.filter(
        (msg) =>
          msg.message.toLowerCase().includes("prefer") ||
          msg.message.toLowerCase().includes("preference")
      );

      if (preferMessages.length === 0) {
        return `I couldn't find any preference information for ${userName}.`;
      }

      const preferences = preferMessages.slice(0, 3).map((msg) => msg.message);
      return `${userName}'s preferences include: ${preferences.join("; ")}`;
    }

    case "does_have":
    case "unknown":
    default: {
      return "I'm not sure how to answer that question. Please try rephrasing it, such as: 'When is [Name] planning their trip to [Location]?' or 'How many [things] does [Name] have?'";
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AskRequest = await request.json();

    if (!body.question || typeof body.question !== "string") {
      const errorResponse: ErrorResponse = {
        error: "Invalid request",
        details: "Question field is required and must be a string",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const question = body.question.trim();

    if (question.length === 0) {
      const errorResponse: ErrorResponse = {
        error: "Invalid request",
        details: "Question cannot be empty",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const messages = await getAllMessages();

    const parsedQuestion = parseQuestion(question);

    const answer = answerQuestion(parsedQuestion, messages);

    const response: AskResponse = { answer };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error processing question:", error);

    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Question Answering API",
    usage:
      'Send POST request with JSON body: { "question": "your question here" }',
    examples: [
      "When is Layla planning her trip to London?",
      "How many cars does Vikram Desai have?",
      "What are Amira's favorite restaurants?",
    ],
  });
}
