// app/api/translate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { inputCity }: { inputCity: string } = await req.json()

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "単語だけで返答してください。" },
        { role: "user", content: `${inputCity}を英語にしてください。` }
      ]
    })

    const translated = chat.choices?.[0]?.message?.content?.trim()

    if (!translated) {
      return NextResponse.json({ error: '翻訳に失敗しました。' }, { status: 500 })
    }

    return NextResponse.json({ translatedCity: translated })

  } catch (error) {
    console.error("OpenAI翻訳エラー:", error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
