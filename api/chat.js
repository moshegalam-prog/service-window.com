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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `אתה עוזר וירטואלי מקצועי של משה גלם מ"שרות לחלון". משה הוא מומחה לאלומיניום, חלונות ממ"ד ותריסי גלילה. מוסמך Somfy. ענה בעברית מקצועית וקצרה. תן אבחון טכני משוער אך אל תתחייב למחיר. בסיום המלץ ליצור קשר עם משה בטלפון 052-3159988.`,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || 'לא התקבלה תשובה';

    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
