// app/api/weather/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { translatedCity }: { translatedCity: string } = await req.json()

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 })
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(translatedCity)}&appid=${apiKey}&units=metric&lang=ja`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(translatedCity)}&appid=${apiKey}&units=metric&lang=ja`

    const currentWeatherResponse = await fetch(currentWeatherUrl)
    const forecastResponse = await fetch(forecastUrl)

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      const errorText = await currentWeatherResponse.text()
      console.error("OpenWeather APIエラー:", errorText)
      return NextResponse.json({ error: '都市が見つかりません。' }, { status: 400 })
    }

    const currentWeatherData = await currentWeatherResponse.json()
    const forecastData = await forecastResponse.json()

    const forecastList = forecastData.list
      .filter((item: any) => item.dt_txt.includes('12:00:00'))
      .map((item: any) => {
        const dateObj = new Date(item.dt_txt)
        const day = dateObj.getDate()
        const weekdayIndex = dateObj.getDay()
        const weekday = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' })

        return {
          date: `${day}日`,
          weekday: `(${weekday})`,
          weekdayIndex: weekdayIndex,
          weather: item.weather,
          main: item.main
        }
      })

      return NextResponse.json({
        currentWeatherData: {
          name: currentWeatherData.name,
          date: "現在", // ここはフロント側で「現在の天気」として表示
          weather: currentWeatherData.weather,
          main: currentWeatherData.main,
          wind: currentWeatherData.wind,
          rain: currentWeatherData.rain,
        },
        forecastData: forecastList.map((item: any) => ({
          date: item.date,
          weekday: item.weekday,
          weekdayIndex: item.weekdayIndex,
          weather: item.weather,
          main: item.main,
        }))
      })
      

  } catch (error) {
    console.error("天気取得エラー:", error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
