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

    const { pin } = req.query || {};
    const ADMIN_PIN = process.env.ADMIN_PIN || 'gessit2026';

    if (pin !== ADMIN_PIN) {
        return res.status(401).json({
            success: false,
            error: 'PIN Panitia salah atau tidak valid.'
        });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const counts = {};
    OPTIONS.forEach(opt => counts[opt] = 0);
    let respondents = [];

    if (kvUrl && kvToken) {
        try {
            // 1. Ambil data suara (HGETALL)
            const votesRes = await fetch(kvUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${kvToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(["HGETALL", "gessit_survey_votes"])
            });
            const votesData = await votesRes.json();
            if (votesData && votesData.result) {
                if (Array.isArray(votesData.result)) {
                    for (let i = 0; i < votesData.result.length; i += 2) {
                        const key = votesData.result[i];
                        const val = parseInt(votesData.result[i + 1], 10) || 0;
                        if (counts[key] !== undefined) counts[key] = val;
                    }
                } else if (typeof votesData.result === 'object') {
                    for (const [key, val] of Object.entries(votesData.result)) {
                        if (counts[key] !== undefined) counts[key] = parseInt(val, 10) || 0;
                    }
                }
            }

            // 2. Ambil daftar responden (LRANGE)
            const respRes = await fetch(kvUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${kvToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(["LRANGE", "gessit_survey_respondents", "0", "-1"])
            });
            const respData = await respRes.json();
            if (respData && Array.isArray(respData.result)) {
                respondents = respData.result.map(item => {
                    try {
                        return typeof item === 'string' ? JSON.parse(item) : item;
                    } catch (e) {
                        return { raw: item };
                    }
                });
            }
        } catch (err) {
            console.error("KV read error in admin API:", err);
        }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return res.status(200).json({
        success: true,
        total,
        counts,
        respondents
    });
}
