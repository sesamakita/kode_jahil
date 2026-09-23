import { getVotesData, getRespondentsData } from '../lib/redis.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { pin } = req.query || {};
    const ADMIN_PIN = process.env.ADMIN_PIN || 'gessit2026';

    if (pin !== ADMIN_PIN) {
        return res.status(401).json({
            success: false,
            error: 'PIN Panitia salah atau tidak valid.'
        });
    }

    try {
        const [votesStats, respondents] = await Promise.all([
            getVotesData(),
            getRespondentsData()
        ]);

        return res.status(200).json({
            success: true,
            total: votesStats.total,
            counts: votesStats.counts,
            respondents
        });
    } catch (err) {
        console.error("Error in admin handler:", err);
        return res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan pada server saat memuat data admin.'
        });
    }
}
