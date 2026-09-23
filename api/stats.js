import { getVotesData } from '../lib/redis.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const stats = await getVotesData();
        return res.status(200).json({
            success: true,
            total: stats.total,
            counts: stats.counts,
            source: stats.source
        });
    } catch (err) {
        console.error("Error getting stats:", err);
        return res.status(500).json({
            success: false,
            error: err.message,
            counts: {
                'Sabtu 26/9/2026, Jam 12.30 - 14.30': 0,
                'Minggu 27/9/2026 Jam 12.30 - 14.30': 0,
                'Terserah, Sabtu atau Minggu saya bisa': 0
            },
            total: 0
        });
    }
}
