import db from "../db";

export default defineEventHandler(async (event) => {
    let body = await readBody<{
        message_id: string,
    }>(event);

    let message = await db?.get(`SELECT * FROM messages WHERE message_id = '${body.message_id}'`)
    let responses = await db?.all(`SELECT * FROM message_responses WHERE message_id = '${body.message_id}'`)

    return {message, responses}
})
