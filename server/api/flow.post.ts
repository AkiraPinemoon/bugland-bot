import useDb from "../db";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    flow: Object;
  }>(event);

  const db = await useDb();

  await db.exec(`UPDATE flows SET data = '${JSON.stringify(body.flow)}'`);
});
