// page.tsx
"use client"

import React, { useState } from "react";
import styles from '../styles/Weather.module.css';

/* 天気データの型定義 */
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

/* 翻訳APIのレスポンスの型定義 */
interface TranslateResponse {
  translatedCity: string;
  error?: string;
}

/* 天気APIのレスポンスの型定義 */
interface WeatherAPIResponse extends WeatherData {
  error?: string;
}


/* メインコンポーネント */
export default function WeatherApp() {
  const [inputCity, setInputCity] = useState<string>("");
  const [translatedCity, setTranslatedCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /* 検索ボタンを押した時の処理 */
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // 翻訳APIを呼び出し
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputCity: inputCity }),
      });

      const translateData: TranslateResponse = await translateRes.json();

      if (!translateRes.ok || translateData.error || !translateData.translatedCity) {
        setError(translateData.error || "翻訳に失敗しました。");
        return;
      }
      setTranslatedCity(translateData.translatedCity);

      // 天気データの取得
      const weatherRes = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translatedCity: translateData.translatedCity }),
      });

      const weatherData: WeatherAPIResponse = await weatherRes.json();

      if (!weatherRes.ok || weatherData.error) {
        setError(weatherData.error || "天気データの取得に失敗しました。");
        return;
      }
      setWeather(weatherData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ネットワークエラーです。後で試してください。";
      setError(errorMessage.includes("都市名") ? errorMessage : "ネットワークエラーです。後で試してください。");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.weatherHome}>
      <h1>Weather App</h1>

      <input
        type="text"
        className={styles.input}
        value={inputCity}
        onChange={(e) => setInputCity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            handleSearch();
          }
        }}
        placeholder="都市名を入力してください"
      />

      <button className={styles.button} onClick={handleSearch}>
        検索
      </button>

      {loading && <p>お天気を取得中...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {weather && (
        <div className={styles.result}>
          <h2>{weather.name} の天気</h2>
          <p>気温： {weather.main.temp} ℃</p>
          <p>湿度： {weather.main.humidity} %</p>
          <p>風速： {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>

  );
}
