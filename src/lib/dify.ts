import type { DifyChatCompletion, SendMessageResponse } from "../dto/dify-data-completion";
import type { Conversations } from "../dto/find-conversation-response";

export default class Dify {
    private url: string;
    private apiKey: string;

    constructor(url: string, apiKey: string) {
        this.url = url;
        this.apiKey = apiKey;
    }

    private headers(): { [key: string]: string } {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Returns users's conversation id.
     *
     * @async
     * @param user - User object containing user information (e.g., id).
     * @returns A promise that resolves with the user's conversation id.
     */
    async findConversation(user: string): Promise<string> {
        const req = await fetch(`${this.url}/conversations?${new URLSearchParams({ user, limit: String(1) }).toString()}`, {
            method: 'GET',
            headers: this.headers()
        });
        let conversations: Conversations = await req.json() as Conversations
        if (conversations.data.length > 0) {
            return conversations.data[0].id;
        } else {
            return '';
        }
    }

    /**
     * Sends a message to a user and retrieves the response.
     *
     * @async
     * @param message - The message to be sent.
     * @param conversationId - A join of user phone + @ + business phone, used to identify conversation in dify.
     * @returns A promise that resolves with the bot's response to the message.
     */
    async sendMessage(message: string, conversationId: string): Promise<SendMessageResponse> {
        const data = {
            'inputs': {},
            'query': message,
            'response_mode': 'blocking',
            'conversation_id': await this.findConversation(conversationId), // previous conversations mus be recovered
            'user': conversationId,
        };

        let answer = await fetch(`${this.url}/chat-messages`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(data)
        });

        let chatCompletion = await answer.json() as DifyChatCompletion
        return {
            answer: chatCompletion.answer,
            conversation_id: chatCompletion.conversation_id
        }
    }

    /**
     * Deletes a conversation.
     *
     * @async
     * @param conversationId - The ID of the conversation to be deleted.
     * @param userId - The user's ID who initiated the conversation.
     * @returns A promise that resolves with the response from the server.
     */
    async deleteConversation(conversationId: string, userId: string): Promise<any> {
        const data = { 'user': userId };

        const answer = await fetch(`${this.url}/conversations/${conversationId}`, {
            method: "DELETE",
            headers: this.headers(),
            body: JSON.stringify(data)
        });
        return answer;
    }

    /**
     * Returns the conversation history messages for a user.
     *
     * @async
     * @param userId - The ID of the user who initiated the conversation.
     * @returns A promise that resolves with an array of conversation history messages.
     */
    async getConversationHistoryMessages(userId: string): Promise<any> {
        const conversationId = await this.findConversation(userId);
        if (conversationId.length > 0) {
            const conversation = await fetch(`${this.url}/messages?user=${userId}&conversation_id=${conversationId}`, {
                headers: this.headers()
            });
            return conversation;
        }
    }
}