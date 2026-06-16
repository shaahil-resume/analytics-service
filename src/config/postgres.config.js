import pg from 'pg'
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg

const pool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE
})

const connectPostgres = async () => {
    try {
        await pool.query('SELECT NOW()')
        console.log('PostgreSQL connected')
    } catch (err) {
        console.error('PostgreSQL connection error:', err)
        process.exit(1)
    }
}

export {pool, connectPostgres}

