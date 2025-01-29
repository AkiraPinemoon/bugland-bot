import { v4 } from "uuid";
import useDb from "../db";

export default defineEventHandler(async (event) => {
    let body = await readBody<{
        messageId?: string,
        response?: string,
        conversationId?: string,
    }>(event);

    let db = await useDb()

    if(!body.messageId) body.messageId = "cf814d81-a097-42ac-ba4c-dcf8fed87b9c"

    let message = await db.get(`SELECT * FROM messages WHERE message_id = '${body.messageId}'`)
    let responses = await db.all(`SELECT * FROM message_responses WHERE message_id = '${body.messageId}'`)
    
    if(body.conversationId) await db.exec(`INSERT INTO conversations (interaction_id, conversation_id, response, message) VALUES ('${v4()}', '${body.conversationId}', '${body.response}', '${message.message_text}')`)

    return {message, responses}
})
