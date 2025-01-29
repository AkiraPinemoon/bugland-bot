import useDb from "../db";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    conversationId: string;
  }>(event);

  const db = await useDb();

  let interactions = await db.all(
    `SELECT * FROM conversations WHERE conversation_id = '${body.conversationId}'`
  );

  return interactions;
});
