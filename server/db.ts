import { Database, open } from "sqlite"
import sqlite from "sqlite3"

let db: null | Database = null;

async function useDb() {
    if(db == null) db = await open({ filename: "sqlite.db", driver: sqlite.Database })
    return db
}

export default useDb
