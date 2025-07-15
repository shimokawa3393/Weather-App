// app/api/weather/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { translatedCity }: { translatedCity: string } = await req.json()

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 })
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(translatedCity)}&appid=${apiKey}&units=metric&lang=ja`

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenWeather APIエラー:", errorText)
      return NextResponse.json({ error: '都市が見つかりません。' }, { status: 400 })
    }

    const weatherData = await response.json()
    return NextResponse.json(weatherData)

  } catch (error) {
    console.error("天気取得エラー:", error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
