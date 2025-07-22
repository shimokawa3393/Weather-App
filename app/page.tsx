// page.tsx
"use client"

import React, { useState } from "react";
import styles from '../styles/Weather.module.css';
import { WeatherData, TranslateResponse, WeatherAPIResponse } from './api/weather/types';

/* メインコンポーネント */
export default function WeatherApp() {
  const [inputCity, setInputCity] = useState<string>("");
  const [translatedCity, setTranslatedCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showIllustration, setShowIllustration] = useState<boolean>(true);


  /* 検索ボタンを押した時の処理 */
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setWeather(null);
    setShowIllustration(false);

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

      <div className={styles.inputContainer}>
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
          placeholder="都市名を入力"
        />
        <button className={styles.button} onClick={handleSearch}>
          検索
        </button>
      </div>

      {/* 天気取得前のイラスト系 */}
      {showIllustration && (
        <>
          <div className={styles.iconWrapper}>
            <img src="/assets/sun.png" alt="sun" className={styles.icon} />
            <div className={styles.balloon}>都市名を入力してみよう！</div>
          </div>
          <img src="/assets/smile_cloud.png" alt="cloud" className={styles.cloud} />
        </>
      )}

      {/* 天気取得中のローディング */}
      {loading && <p>お天気を取得中...</p>}

      {/* エラー表示 */}
      {error && (
        <>
          <div className={styles.iconWrapper}>
            <img src="/assets/moon.png" alt="sun" className={styles.icon} />
            <div className={styles.balloon}>都市が見つかりませんでした...</div>
          </div>
          <img src="/assets/sad_cloud.png" alt="cloud" className={styles.cloud} />
        </>
      )}

      {/* 天気取得後の結果表示 */}
      {
        weather && (
          <div className={styles.result}>
            <div className={styles.currentWeatherContainer}>
              <h2>{weather.currentWeatherData.name}</h2>
              <div className={styles.mainInfo}>
                <div className={styles.mainIcon}>
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.currentWeatherData.weather[0].icon}@2x.png`}
                    alt="天気アイコン"
                    className={styles.mainWeatherIcon}
                  />
                  <span className={styles.weatherDescription}>{weather.currentWeatherData.weather[0].description}</span>
                </div>
                <div className={styles.mainTemp}>
                  <span className={styles.temp}>{Math.round(weather.currentWeatherData.main.temp)}℃</span>
                  <div className={styles.tempUnit}>
                    <span className={styles.tempMax}>{Math.round(weather.currentWeatherData.todayMax)}℃</span>
                    <span>/</span>
                    <span className={styles.tempMin}>{Math.round(weather.currentWeatherData.todayMin)}℃</span>
                  </div>
                </div>
              </div>
              <div className={styles.subInfo}>
                <div className={styles.subInfoItem}>
                  <span className={styles.subInfoLabel}>湿度</span>
                  <span className={styles.subInfoValue}>{weather.currentWeatherData.main.humidity}%</span>
                </div>
                <div className={styles.subInfoItem}>
                  <span className={styles.subInfoLabel}>風</span>
                  <span className={styles.subInfoValue}>{Math.round(weather.currentWeatherData.wind.speed)}m/s</span>
                </div>
                <div className={styles.subInfoItem}>
                  <span className={styles.subInfoLabel}>降水量</span>
                  <span className={styles.subInfoValue}>
                    {weather.currentWeatherData.rain ? Math.round(weather.currentWeatherData.rain["1h"]) : "0"} mm
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.forecastContainer}>
              <h3>5日間予報</h3>
              <div className={styles.forecastInfo}>
                {weather.forecastData.map((day, index) => (
                  <div key={index} className={styles.forecastItem}>
                    <span className={styles.forecastDate}>{day.date}</span>
                    <span
                      className={`${styles.forecastDate} ${day.weekdayIndex === 0
                        ? styles.sunday
                        : day.weekdayIndex === 6
                          ? styles.saturday
                          : ''
                        }`}
                    >
                      {day.weekday}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt="天気アイコン"
                      className={styles.forecastWeatherIcon}
                    />
                    <div className={styles.tempUnit}>
                      <span className={styles.tempMax}>{Math.round(day.main.temp_max)}℃</span>
                      <span>/</span>
                      <span className={styles.tempMin}>{Math.round(day.main.temp_min)}℃</span>
                    </div>
                    <span className={styles.pop}>{Math.round(day.pop * 10) * 10}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </div >

  );
}
