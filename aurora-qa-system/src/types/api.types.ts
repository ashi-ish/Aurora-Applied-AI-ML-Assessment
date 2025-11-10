export interface Message{
    id: string;
    user_id: string;
    user_name: string;
    timestamp: string; // ISO 8601 format
    message: string;
}

export interface MessagesResponse {
    total: number;
    items:Message[];
}

export interface MessageQueryParams {
    skip?: number;
    limit?: number;
}

export interface AskRequest{
    question: string;
}

export interface AskResponse{
    answer: string;
}

export interface ErrorResponse{
    error: string;
    details?: string;
}