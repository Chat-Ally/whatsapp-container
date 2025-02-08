export function makeConversationId(messageFrom: string, messageTo: string) {
    return getSimpleNumber(removePrefix(messageFrom)) + "@" + getSimpleNumber(removePrefix(messageTo))
}

function getSimpleNumber(phone: string) {
    return removeSufix(phone)
}

function removeSufix(phone: string) {
    return phone.replace("@c.us", "")
}

function removePrefix(phone: string) {
    return phone.slice(3)
}