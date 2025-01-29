import useDb from "../db";

export default defineEventHandler(async (event) => {
  let db = await useDb();

  let flow = JSON.parse((await db.get(`SELECT data FROM flows`)).data);
  return flow;
});
