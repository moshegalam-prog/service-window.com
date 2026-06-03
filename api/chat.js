export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const { message } = await req.json();
    if (!message) return new Response(JSON.stringify({ error: 'No message' }), { status: 400 });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: message }]
        }],
        systemInstruction: {
          parts: [{ text: `אתה עוזר וירטואלי מקצועי של משה גלם מ"שרות לחלון". משה הוא מומחה לאלומיניום, חלונות ממ"ד ותריסי גלילה. מוסמך Somfy. ענה בעברית מקצועית וקצרה. תן אבחון טכני משוער אך אל תתחייב למחיר. בסיום המלץ ליצור קשר עם משה בטלפון 052-3159988.` }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'API error', debug: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'לא התקבלה תשובה';

    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
