import { promises as fs } from "fs";
import path from "path";
import useDb from "../db";

export default defineEventHandler(async (event) => {
  const dbPath = "sqlite.db"; // Path to your SQLite database
  const backupDir = path.join("backup", `${Date.now()}.db`);

  // Create a backup of the database
  try {
    await fs.mkdir("backup", { recursive: true }); // Ensure the backup directory exists
    await fs.copyFile(dbPath, backupDir); // Copy the database file to the backup directory
    console.log(`Backup created at ${backupDir}`);
  } catch (error) {
    console.error("Failed to create backup:", error);
    throw new Error("Backup failed. Aborting operation.");
  }

  const body = await readBody<{
    messages: {
      message_id: string;
      message_text: string;
    }[];
    message_responses: {
      message_id: string;
      response_id: string;
      response_text: string;
    }[];
  }>(event);

  const db = await useDb();

  // Clear the tables
  await db.exec(`DELETE FROM messages`);
  await db.exec(`DELETE FROM message_responses`);

  // Insert new data into messages
  for (const message of body.messages) {
    await db.exec(
      `INSERT INTO messages VALUES ('${message.message_id}', '${message.message_text}')`
    );
  }

  // Insert new data into message_responses
  for (const message_response of body.message_responses) {
    await db.exec(
      `INSERT INTO message_responses VALUES ('${message_response.message_id}', '${message_response.response_id}', '${message_response.response_text}')`
    );
  }
});
