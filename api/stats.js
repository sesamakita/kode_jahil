const OPTIONS = [
    'Sabtu 26/9/2026, Jam 12.30 - 14.30',
    'Minggu 27/9/2026 Jam 12.30 - 14.30',
    'Terserah, Sabtu atau Minggu saya bisa'
];

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const stats = await getGlobalStats();
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
                [OPTIONS[0]]: 0,
                [OPTIONS[1]]: 0,
                [OPTIONS[2]]: 0
            },
            total: 0
        });
    }
}

export async function getGlobalStats() {
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const counts = {};
    OPTIONS.forEach(opt => counts[opt] = 0);

    if (kvUrl && kvToken) {
        try {
            const response = await fetch(`${kvUrl}/hgetall/gessit_survey_votes`, {
                headers: {
                    Authorization: `Bearer ${kvToken}`
                }
            });
            const data = await response.json();
            if (data && data.result) {
                // Upstash can return an object { key: "val" } or an array [key, val, key, val]
                if (Array.isArray(data.result)) {
                    for (let i = 0; i < data.result.length; i += 2) {
                        const key = data.result[i];
                        const val = parseInt(data.result[i + 1], 10) || 0;
                        if (counts[key] !== undefined) {
                            counts[key] = val;
                        }
                    }
                } else if (typeof data.result === 'object') {
                    for (const [key, val] of Object.entries(data.result)) {
                        if (counts[key] !== undefined) {
                            counts[key] = parseInt(val, 10) || 0;
                        }
                    }
                }
            }
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            return { total, counts, source: 'vercel_kv' };
        } catch (e) {
            console.warn("KV fetch error, fallbacking:", e);
        }
    }

    // Default fallback jika KV belum diaktifkan
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { total, counts, source: 'default' };
}
