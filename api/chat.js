export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: "API Key missing in Vercel" });
    }

    // আমরা দুটি সম্ভাব্য এন্ডপয়েন্টই ট্রাই করব যাতে কোনোভাবেই ফেল না করে
    const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    ];

    for (let url of endpoints) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "contents": [{ "parts": [{ "text": prompt }] }]
                })
            });

            const data = await response.json();

            // যদি গুগল থেকে সফল উত্তর আসে
            if (data.candidates && data.candidates[0]) {
                return res.status(200).json(data);
            }
            
            // যদি এই এন্ডপয়েন্টে মডেল না পাওয়া যায়, তবে পরেরটা ট্রাই করবে
            console.log("Trying next endpoint...");
        } catch (error) {
            continue;
        }
    }

    return res.status(500).json({ error: "গুগল এআই কোনো মডেল খুঁজে পাচ্ছে না। আপনার API Key টি নতুন করে তৈরি করে দেখুন।" });
}
