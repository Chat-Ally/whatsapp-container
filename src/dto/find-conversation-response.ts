export interface Conversation {
    id: string;
    name: string;
    inputs: object;
    status: string;
    introduction: string;
    created_at: number;
    updated_at: number;
}

export interface Conversations {
    data: Conversation[];
    limit: number; // Number of entries returned
    has_more?: boolean; // optional property (if input exceeds system limit)
}