// Bangla speech-to-text fallback for browsers without working Web Speech API.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { audio, format } = await req.json();
    if (!audio || typeof audio !== 'string') {
      return new Response(JSON.stringify({ error: 'অডিও পাওয়া যায়নি' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) throw new Error('LOVABLE_API_KEY is not configured');

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You transcribe speech. Return ONLY the exact spoken words in Bangla script (or the spoken language). No commentary. If silent, return an empty string.' },
          { role: 'user', content: [
            { type: 'text', text: 'Transcribe this audio.' },
            { type: 'input_audio', input_audio: { data: audio, format: format || 'webm' } },
          ] },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('transcribe error', res.status, t);
      const msg = res.status === 429 ? 'অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।'
        : res.status === 402 ? 'AI ক্রেডিট শেষ হয়েছে।' : 'কথা বুঝতে সমস্যা হয়েছে';
      return new Response(JSON.stringify({ error: msg }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
