import { saveVoteAndRespondent } from '../lib/redis.js';

export default async function handler(req, res) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Gunakan metode POST.' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        const { id, name, studentClass, choice, timestamp } = body || {};

        if (!name || !studentClass || !choice) {
            return res.status(400).json({ error: 'Field nama, kelas, dan pilihan jadwal wajib diisi.' });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        // Jika belum diset di Vercel Environment Variables
        if (!botToken || !chatId) {
            console.warn("TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diatur di Vercel Environment Variables.");
            return res.status(200).json({
                success: true,
                warning: 'Data survei tersimpan, namun notifikasi Telegram dilewati karena variabel lingkungan belum diset.'
            });
        }

        // Format pesan rapi dengan format HTML Telegram
        const message = 
`📢 <b>SURVEI KEGIATAN GESSIT MASUK!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Nama:</b> ${escapeHtml(name)}
🏫 <b>Kelas:</b> ${escapeHtml(studentClass)}
🗓️ <b>Pilihan Jadwal:</b>
👉 <b>${escapeHtml(choice)}</b>

🆔 <code>${escapeHtml(id || '-')}</code>
⏰ <i>${escapeHtml(timestamp || new Date().toLocaleString('id-ID'))}</i>
━━━━━━━━━━━━━━━━━━
<i>Generasi Sulteng Sadar IT</i>`;

        // Kirim request ke Telegram Bot API
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const telegramResponse = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const telegramData = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramData.ok) {
            console.error("Telegram API Error:", telegramData);
            return res.status(502).json({
                success: false,
                error: 'Gagal mengirim pesan ke Telegram.',
                details: telegramData
            });
        }

        // Simpan data responden dan suara ke Redis (REDIS_URL atau Vercel KV)
        await saveVoteAndRespondent(choice, {
            id: id || ('GES-' + Date.now().toString(36).toUpperCase()),
            name,
            studentClass,
            choice,
            timestamp: timestamp || new Date().toLocaleString('id-ID')
        });

        return res.status(200).json({
            success: true,
            message: 'Survei berhasil dicatat dan notifikasi Telegram terkirim!'
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({
            error: 'Terjadi kesalahan pada server saat memproses survei.',
            message: error.message
        });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
