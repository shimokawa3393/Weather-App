## Weather App

日本語で入力された都市名を英語に翻訳し、OpenWeather APIから天気情報を取得・表示するアプリケーションです。  
Next.js の App Router 構成をベースに、OpenAI API と外部APIを組み合わせた構成になっています。

### 概要

このアプリはポートフォリオ用途として以下の点を目的に開発されました。

- APIの責務分離（翻訳処理と天気取得処理）
- OpenAI APIの実用的な活用例
- App Router構成による Next.js のバックエンド統合の実践
- シンプルかつ拡張しやすいUI設計（TypeScript + CSS Modules）

### 使用技術

| 区分         | 使用技術                                |
|--------------|-----------------------------------------|
| フロント     | React / Next.js 13+（App Router） / TypeScript |
| スタイリング | CSS Modules / Tailwind CSS（導入済み） |
| バックエンド | Next.js API Routes（/api/translate, /api/weather） |
| 外部API      | OpenAI API（Chat Completion） / OpenWeather API |
| デプロイ     | Vercel                                  |

### 主な機能

- 都市名の日本語入力 → ChatGPTで英語に翻訳
- OpenWeather APIでリアルタイム天気情報を取得
- 入力エラー・通信エラーへの適切なハンドリング
- スマートフォンにも対応したレスポンシブUI

### 使い方

1. テキスト入力欄に日本語の都市名（例：「東京」）を入力
2. 「検索」ボタンを押すか Enter を押下
3. 翻訳された都市名に基づいて天気情報が表示される

