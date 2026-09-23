import Redis from 'ioredis';

const OPTIONS = [
    'Sabtu 26/9/2026, Jam 12.30 - 14.30',
    'Minggu 27/9/2026 Jam 12.30 - 14.30',
    'Terserah, Sabtu atau Minggu saya bisa'
];

let ioredisClient = null;

function getClient() {
    if (process.env.REDIS_URL) {
        if (!ioredisClient) {
            ioredisClient = new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: 3,
                connectTimeout: 7000,
                lazyConnect: false
            });
            ioredisClient.on('error', (err) => {
                console.warn('Redis connection warning:', err.message);
            });
        }
        return ioredisClient;
    }
    return null;
}

export async function saveVoteAndRespondent(choice, respondent) {
    const respondentStr = JSON.stringify(respondent);

    // Opsi A: Koneksi langsung lewat REDIS_URL (ioredis)
    const client = getClient();
    if (client) {
        try {
            await Promise.all([
                client.hincrby('gessit_survey_votes', choice, 1),
                client.lpush('gessit_survey_respondents', respondentStr)
            ]);
            return true;
        } catch (e) {
            console.error('ioredis write error:', e);
        }
    }

    // Opsi B: Koneksi lewat Vercel KV / Upstash REST API
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
        try {
            await fetch(kvUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(["HINCRBY", "gessit_survey_votes", choice, 1])
            });
            await fetch(kvUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(["LPUSH", "gessit_survey_respondents", respondentStr])
            });
            return true;
        } catch (e) {
            console.error('REST KV write error:', e);
        }
    }

    return false;
}

export async function getVotesData() {
    const counts = {};
    OPTIONS.forEach(opt => counts[opt] = 0);

    // Opsi A: lewat ioredis
    const client = getClient();
    if (client) {
        try {
            const raw = await client.hgetall('gessit_survey_votes');
            if (raw && typeof raw === 'object') {
                for (const [k, v] of Object.entries(raw)) {
                    if (counts[k] !== undefined) {
                        counts[k] = parseInt(v, 10) || 0;
                    }
                }
                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                return { total, counts, source: 'redis_url' };
            }
        } catch (e) {
            console.error('ioredis read error:', e);
        }
    }

    // Opsi B: lewat REST API
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
        try {
            const res = await fetch(kvUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(["HGETALL", "gessit_survey_votes"])
            });
            const data = await res.json();
            if (data && data.result) {
                if (Array.isArray(data.result)) {
                    for (let i = 0; i < data.result.length; i += 2) {
                        const k = data.result[i];
                        const v = parseInt(data.result[i + 1], 10) || 0;
                        if (counts[k] !== undefined) counts[k] = v;
                    }
                } else if (typeof data.result === 'object') {
                    for (const [k, v] of Object.entries(data.result)) {
                        if (counts[k] !== undefined) counts[k] = parseInt(v, 10) || 0;
                    }
                }
                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                return { total, counts, source: 'vercel_kv' };
            }
        } catch (e) {
            console.error('REST read error:', e);
        }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { total, counts, source: 'default' };
}

export async function getRespondentsData() {
    // Opsi A: lewat ioredis
    const client = getClient();
    if (client) {
        try {
            const rawList = await client.lrange('gessit_survey_respondents', 0, -1);
            if (Array.isArray(rawList)) {
                return rawList.map(item => {
                    try { return JSON.parse(item); } catch (e) { return { raw: item }; }
                });
            }
        } catch (e) {
            console.error('ioredis lrange error:', e);
        }
    }

    // Opsi B: lewat REST API
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
        try {
            const res = await fetch(kvUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(["LRANGE", "gessit_survey_respondents", "0", "-1"])
            });
            const data = await res.json();
            if (data && Array.isArray(data.result)) {
                return data.result.map(item => {
                    try { return typeof item === 'string' ? JSON.parse(item) : item; } catch (e) { return { raw: item }; }
                });
            }
        } catch (e) {
            console.error('REST lrange error:', e);
        }
    }

    return [];
}
