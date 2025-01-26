import useDb from "../db";

export default defineEventHandler(async (event) => {
    let db = await useDb()

    let message = await db.all(`SELECT * FROM messages`)
    let responses = await db.all(`SELECT * FROM message_responses`)

    return {message, responses}
})
