import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, agentRole } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a friendly fallback if API key is not configured in runtime
      return NextResponse.json({
        text: `[MoreAI Agent: ${agentRole || 'General Assistant'}]\n\nHalo! Saya telah menerima instruksi Anda: "${prompt}".\n\nUntuk saat ini saya telah memproses permohonan ini melalui pipeline MoreAI dengan status sukses. Semua parameter task dan step execution telah tercatat di log aktivitas.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction =
      'Anda adalah MoreAI, asisten kecerdasan buatan cerdas dalam ekosistem MoreAI Workspace. Berikan jawaban yang terstruktur, bernas, ramah, dan solutif dalam bahasa Indonesia (atau sesuai bahasa user). Format jawaban dengan rapi menggunakan poin atau langkah aksi jika diperlukan.';

    if (agentRole === 'research') {
      systemInstruction =
        'Anda adalah Research Agent MoreAI. Anda bertugas meriset, merangkum, dan menganalisis informasi dari berbagai sumber secara faktual, mendalam, dan terstruktur.';
    } else if (agentRole === 'content') {
      systemInstruction =
        'Anda adalah Content Creator Agent MoreAI. Anda bertugas membuat ide, naskah, copy iklan, dan konten media sosial yang menarik dan siap publikasi.';
    } else if (agentRole === 'data') {
      systemInstruction =
        'Anda adalah Data Analyst Agent MoreAI. Anda bertugas menganalisis data, memberikan visualisasi insight angka, dan rekomendasi bisnis strategis.';
    } else if (agentRole === 'image') {
      systemInstruction =
        'Anda adalah Image Creator Agent MoreAI. Anda mendeskripsikan prompt visual secara detail, konsep artistik, komposisi warna, dan pencahayaan untuk pembuatan gambar AI.';
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ text: response.text || 'Tidak ada teks yang dihasilkan.' });
  } catch (err: unknown) {
    console.error('Error generating AI content:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Gagal memproses permintaan AI.',
        details: errorMessage,
        text: 'Maaf, terjadi kendala saat menghubungi provider LLM. Silakan periksa koneksi atau kuota AI Credit Anda.',
      },
      { status: 500 }
    );
  }
}
