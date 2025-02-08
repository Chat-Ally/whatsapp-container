export default function dify(url: string, apiKey: string) {
    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    async function getConversationHistoryMessages(userId: string) {
        let conversationId = await findConversation(userId)
        if (conversationId.length > 0) {
            let conversation = await fetch(
                url + '/messages?' + new URLSearchParams({ user: userId, conversation_id: conversationId }), {
                method: "GET",
                headers
            })

            conversation = await conversation.json()
            return conversation
        }
    }

    /**
     * Returns users's conversation id.
     *
     * @async
     * @param {string} user - User object containing user information (e.g., id).
     * @returns {Promise<string>} A promise that resolves with the user's conversation id.
     */
    async function findConversation(user: string) {
        let conversations = await fetch(url + '/conversations?' + new URLSearchParams({ user: user, limit: 1 }).toString(), {
            method: "GET",
            headers,
        })
        conversations = await conversations.json()
        if (conversations.data.length > 0) {
            return conversations.data[0].id
        } else {
            return ""
        }
    }

    /**
     * Sends a message to a user and retrieves the response.
     *
     * @async
     * @param {string} message - The message to be sent.
     * @param {string} conversationId - A join of user phone + @ + business phone, used to identify conversation in dify.
     * @returns {Promise<string>} A promise that resolves with the bot's response to the message.
     */

    async function sendMessage(message: string, conversationId: string) {
        let data = {
            "inputs": {},
            "query": message,
            "response_mode": "blocking",
            "conversation_id": await findConversation(conversationId), // previous conversations mus be recovered
            "user": conversationId
        }
        let answer = await fetch(url + '/chat-messages', {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        })

        answer = await answer.json()
        return answer.answer
    }

    async function deleteConversation(conversationId: string, userId: string) {
        let data = {
            "user": userId
        }
        let answer = await fetch(url + '/conversations/' + conversationId, {
            method: 'DELETE',
            headers,
            body: JSON.stringify(data)
        })

        return answer.json()
    }

    return { findConversation, sendMessage, deleteConversation, getConversationHistoryMessages }
}