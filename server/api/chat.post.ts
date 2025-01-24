import useDb from "../db";

export default defineEventHandler(async (event) => {
    let body = await readBody<{
        message_id?: string,
    }>(event);

    let db = await useDb()

    if(!body.message_id) body.message_id = "cf814d81-a097-42ac-ba4c-dcf8fed87b9c"

    let message = await db.get(`SELECT * FROM messages WHERE message_id = '${body.message_id}'`)
    let responses = await db.all(`SELECT * FROM message_responses WHERE message_id = '${body.message_id}'`)

    return {message, responses}
})
