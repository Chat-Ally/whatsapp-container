import type { UUID } from "crypto";

export interface DifyChatCompletion {
    event: "message";
    message_id: string;
    conversation_id: string;
    mode: "chat";
    answer: string;
    metadata: Metadata;
    created_at: number;
}

export interface Metadata {
    usage: Usage;
    retriever_resources: RetrieverResource[];
}

export interface Usage {
    prompt_tokens: number;
    prompt_unit_price: string;
    prompt_price_unit: string;
    prompt_price: string;
    completion_tokens: number;
    completion_unit_price: string;
    completion_price_unit: string;
    completion_price: string;
    total_tokens: number;
    total_price: string;
    currency: string;
    latency: number;
}

export interface RetrieverResource {
    position: number;
    dataset_id: string;
    dataset_name: string;
    document_id: string;
    document_name: string;
    segment_id: string;
    score: number;
    content: string;
}

export interface SendMessageResponse {
    answer: string,
    conversation_id: string
}

export interface CustomerBusinessNumbers {
    customerPhoneNumber: string,
    businessPhoneNumber: string
}