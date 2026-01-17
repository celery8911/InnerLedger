import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json({ error: 'Input required' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
      timeout: 20000,
      maxRetries: 2,
    });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '你是一个温和的正念陪伴者。请简短地复述用户注意到的内容，表达理解，不做评判。字数控制在50字以内。语气要平静、包容。',
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      max_tokens: 60,
    });

    return NextResponse.json({
      aiResponse: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to process';
    const status = message.toLowerCase().includes('timed out') ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
