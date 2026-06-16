import express from 'express'
import geoip from 'geoip-lite'
import { client } from '../config/redis.config.js'
import { pool } from '../config/postgres.config.js'
import { emitStatsUpdate } from '../socket/socket.js'
import verifyToken from '../middleware/auth.middleware.js'

const router = express.Router();

router.post("/track", async (req, res) => {
    try{
        const {page,event} = req.body
        const ip = req.ip;
        const geoLoc = geoip.lookup(ip);
        const country = geoLoc ? geoLoc.country : 'Unknown'
        const city = geoLoc ? geoLoc.city : 'Unknown'
        const userAgent = req.headers['user-agent'] || 'Unknown'
        if(event === "page_view"){
            await client.incr('views:today');
            await pool.query(
                'INSERT INTO page_views (page, country, city, ip, user_agent) VALUES ($1, $2, $3, $4, $5)',
                [page, country, city, ip, userAgent]
            )
            const viewsToday = await client.get('views:today')
            emitStatsUpdate({ viewsToday: parseInt(viewsToday) })
        }else if (event === "resume_download"){
            await client.incr('downloads:today');
            await pool.query(
                'INSERT INTO resume_downloads(country,ip) VALUES ($1,$2)',
                [country,ip]
            )
            const downloadsToday = await client.get('downloads:today')
            emitStatsUpdate({ downloadToday: parseInt(downloadsToday) })
        }
        return res.status(200).send({message: 'Data Emitted successfully.'})
    }catch(err){
        res.status(500).json({ message: 'Internal server error' })
    }
});

router.get('/stats',verifyToken, async (req, res) => {
    try{
        const viewsToday = await client.get('views:today')
        const downloadsToday = await client.get('downloads:today')
        const viewsTotal = await pool.query(
            `SELECT COUNT(*) FROM page_views`
        )
        const downloadsTotal = await pool.query(
            `SELECT COUNT(*) FROM resume_downloads`
        )
        const topCountries = await pool.query(
            `SELECT country, COUNT(*) as count
             FROM page_views
             GROUP BY country
             ORDER BY count DESC
                 LIMIT 10`
        )
        const data = {
            viewsToday : parseInt(viewsToday),
            downloadsToday : parseInt(downloadsToday),
            viewsTotal : parseInt(viewsTotal.rows[0].count),
            downloadsTotal : parseInt(downloadsTotal.rows[0].count),
            countries : topCountries.rows
        }
        res.send(data);
    }catch(err){
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.get('/history',verifyToken, async (req, res) => {
    try{
        const data = await pool.query(
            `SELECT * from page_views order by visited_at desc LIMIT 50`
        )
        res.send(data.rows);
    }catch(err){
        res.status(500).json({ message: 'Internal server error' })
    }
})

export default router


