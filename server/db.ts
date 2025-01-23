import { Database, open } from "sqlite"
import sqlite from "sqlite3"

let db: null | Database = null;

async function connectDb() {
    db = await open({ filename: "sqlite.db", driver: sqlite.Database })
}

connectDb()

export default db
