export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', method: req.method });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    
    const message = body?.message;
    console.log('Message received:', message?.substring(0, 50));
    if (!message) return res.status(400).json({ error: 'No message', body });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    console.log('Key exists:', !!GEMINI_KEY);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: {
          parts: [{ text: `אתה עוזר וירטואלי מקצועי של משה גלם מ"שרות לחלון". ענה בעברית מקצועית וקצרה. תן אבחון טכני משוער. בסיום המלץ ליצור קשר עם משה בטלפון 052-3159988.` }]
        }
      })
    });

    const data = await response.json();
    console.log('Gemini status:', response.status);
    
    if (!response.ok) {
      console.log('Gemini error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Gemini error', debug: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'No text', debug: data });
    
    return res.status(200).json({ text });
  } catch (err) {
    console.log('Catch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
