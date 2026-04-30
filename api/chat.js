export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: "Vercel settings-এ API Key পাওয়া যায়নি।" });
    }

    // গুগলের একদম লেটেস্ট এবং স্টেবল ইউআরএল
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": prompt }]
                }]
            })
        });

        const data = await response.json();

        // যদি গুগল কোনো এরর পাঠায়, তবে সেই এররটিই ফেরত পাঠাবে
        if (data.error) {
            return res.status(200).json({ error: data.error.message });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "সার্ভার কানেকশন ফেইল হয়েছে।" });
    }
}
