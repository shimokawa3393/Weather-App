/* 天気データの型定義 */
export interface WeatherData {
    currentWeatherData: CurrentWeatherData;
    forecastData: ForecastData[];
}

/* 翻訳APIのレスポンスの型定義 */
export interface TranslateResponse {
    translatedCity: string;
    error?: string;
}

/* 天気APIのレスポンスの型定義 */
export interface WeatherAPIResponse extends WeatherData {
    error?: string;
}

/* 現在の天気データの型定義 */
export interface CurrentWeatherData {
    name: string;
    main: {
        temp: number;
        humidity: number;
    };
    wind: {
        speed: number;
    };
    weather: Array<{
        icon: string;
        description: string;
    }>;
    rain?: {
        "1h": number;
    };
    todayMax: number;
    todayMin: number;
}

// APIレスポンスの1件の型定義
export interface ForecastApiItem {
    dt_txt: string;
    weather: Array<{
        icon: string;
        main: string;
    }>;
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
    };
    pop: number;
}

// 加工後に返す用の型定義
export interface ForecastData {
    date: string;
    weekday: string;
    weekdayIndex: number;
    weather: ForecastApiItem['weather'];
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
    };
    pop: number;
}
