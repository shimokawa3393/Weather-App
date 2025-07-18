// app/api/weather/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ForecastData, ForecastApiItem, WeatherAPIResponse } from './types'

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

    // 今日の最高気温と最低気温を取得
    const todayKey = new Date().toISOString().split('T')[0];
    const todayItems = forecastData.list.filter((item: ForecastApiItem) => item.dt_txt.startsWith(todayKey));
    const todayTemps = todayItems.map((i: ForecastApiItem) => i.main);
    const todayMax = Math.max(...todayTemps.map((t: ForecastApiItem['main']) => t.temp_max));
    const todayMin = Math.min(...todayTemps.map((t: ForecastApiItem['main']) => t.temp_min));

    // 5日間予報データを日付でグルーピング
    const dailyMap = new Map<string, ForecastApiItem[]>()
    forecastData.list.forEach((item: ForecastApiItem) => {
      const dateKey = item.dt_txt.split(' ')[0]
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, [])
      }
      dailyMap.get(dateKey)!.push(item)
    })

    // 5日間予報データを加工
    const forecastList: ForecastData[] = Array.from(dailyMap.entries())
      .filter(([dateKey]) => dateKey !== todayKey)
      .map(([dateKey, items]) => {
        const dateObj = new Date(dateKey)

        const day = dateObj.getDate()
        const weekdayIndex = dateObj.getDay()
        const weekday = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' })

        const temps = items.map(i => i.main)
        const tempMax = Math.max(...temps.map(t => t.temp_max))
        const tempMin = Math.min(...temps.map(t => t.temp_min))

        // 12:00 の天気を優先、なければ最初のやつ
        const weatherItem = items.find(i => i.dt_txt.includes('12:00:00')) ?? items[0]

        return {
          date: `${day}日`,
          weekday: `(${weekday})`,
          weekdayIndex,
          weather: weatherItem.weather,
          main: {
            temp_max: tempMax,
            temp_min: tempMin,
            temp: weatherItem.main.temp,
          },
          pop: weatherItem.pop,
        }
      })

    return NextResponse.json({
      currentWeatherData: {
        name: currentWeatherData.name,
        weather: currentWeatherData.weather,
        main: currentWeatherData.main,
        todayMax: todayMax,
        todayMin: todayMin,
        wind: currentWeatherData.wind,
        rain: currentWeatherData.rain,
      },
      forecastData: forecastList.map((item: ForecastData) => ({
        date: item.date,
        weekday: item.weekday,
        weekdayIndex: item.weekdayIndex,
        weather: item.weather,
        main: item.main,
        pop: item.pop,
      }))
    })

  } catch (error) {
    console.error("天気取得エラー:", error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
