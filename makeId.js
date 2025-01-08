function makeConversationId(messageFrom, messageTo){
    return getSimpleNumber(removePrefix(messageFrom)) + "@" + getSimpleNumber(removePrefix(messageTo))
}

function getSimpleNumber(phone){
    return removeSufix(phone)
}

function removeSufix(phone){
    return phone.replace("@c.us", "")
}

function removePrefix(phone){
    return phone.slice(3)
}

module.exports = makeConversationId