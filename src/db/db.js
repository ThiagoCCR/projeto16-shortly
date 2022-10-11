import pg from "pg";
import { DATABASE_URL } from "../configs/constants.js";

const { Pool } = pg;

const databaseConfig = {
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

const connection = new Pool(databaseConfig);

export default connection;