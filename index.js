import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import { pool } from './src/config/postgres.config.js'
import { client } from './src/config/redis.config.js'
import { connectRedis } from './src/config/redis.config.js'
import { connectPostgres } from './src/config/postgres.config.js'
import { initSocket } from './src/socket/socket.js'
import analyticsRoutes from './src/routes/analytics.routes.js'

dotenv.config();

const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())

const server = http.createServer(app);

app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'analytics-service',
        timestamp: new Date().toISOString()
    })
})


app.use('/api/analytics', analyticsRoutes)

const startServer = async () => {
    try{
        await connectRedis();
        console.log('Connected to Redis server...');
        await connectPostgres();
        console.log('Connected to Postgres server...');
        await fetchTotalViewAndDownloadCount();
        initSocket(server);
        console.log('Connected to WebSocket server...');
        server.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`);
        })
    }catch(e){
        console.error('Failed to start the server '+ e)
    }
}

const fetchTotalViewAndDownloadCount = async () => {
    const viewsToday = await pool.query(
        `SELECT COUNT(*) FROM page_views 
         WHERE visited_at::date = CURRENT_DATE`
    )
    const downloadsToday = await pool.query(
        `SELECT COUNT(*) FROM resume_downloads 
         WHERE downloaded_at::date = CURRENT_DATE`
    )
    await client.set('views:today', viewsToday.rows[0].count);
    await client.set('downloads:today', downloadsToday.rows[0].count);
}

startServer();