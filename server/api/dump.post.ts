import useDb from "../db";

export default defineEventHandler(async (event) => {
  let body = await readBody<{
    messages: {
        message_id: string,
        message_text: string,
    }[];
    message_responses: {
        message_id: string,
        response_id: string,
        response_text: string,
    }[];
  }>(event);

  let db = await useDb();

  await db.exec(`DELETE FROM messages`);
  await db.exec(`DELETE FROM message_responses`);

  for (const message of body.messages) {
    await db.exec(`INSERT INTO messages VALUES ('${message.message_id}', '${message.message_text}')`);
  }

  for (const message_response of body.message_responses) {
    await db.exec(`INSERT INTO message_responses VALUES ('${message_response.message_id}', '${message_response.response_id}', '${message_response.response_text}')`);
  }
});
