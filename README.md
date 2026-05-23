# VexFlow MIDI Realtime Prototype

MIDI キーボードなどからリアルタイムに MIDI 入力を受け取り、その信号に応じて VexFlow で楽譜を描画する Web システムのプロトタイプです。

## 目的

このプロジェクトでは、以下を確認します。

- Web MIDI API で MIDI 入力をリアルタイムに取得できるか
- 入力された MIDI ノートを音名へ変換できるか
- VexFlow を使って入力結果を譜面として即時描画できるか
- 入力から描画までの遅延や操作感が実用的か

## 想定構成

```text
MIDI デバイス
  -> Web MIDI API
  -> MIDI note on / note off の取得
  -> ノート番号を音名へ変換
  -> VexFlow で楽譜を再描画
```

## 使用予定ライブラリ

- [VexFlow](https://www.vexflow.com/) - 楽譜描画
- Web MIDI API - ブラウザでの MIDI 入力取得

## 注意

VexFlow は MIDI 入力を直接扱うライブラリではなく、楽譜を描画するためのライブラリです。MIDI 入力の取得、音価の推定、クオンタイズ、小節管理などは別途実装します。

## 開発メモ

初期段階では、正確な自動採譜ではなく、押下された MIDI ノートをできるだけ素早く五線譜上に表示することを優先します。

詳細な実装方針は [docs/implementation-plan.md](docs/implementation-plan.md) を参照してください。

## コミットメッセージ規則

コミットメッセージは以下の形式を基本とします。

```text
type: summary
```

`summary` は日本語または英語で、変更内容を短く具体的に書きます。

例:

```text
docs: READMEに開発方針を追加
feat: MIDI入力の検出処理を追加
fix: ノート表示が更新されない問題を修正
```

主な `type` は以下を使います。

- `feat`: 機能追加
- `fix`: 不具合修正
- `docs`: ドキュメント変更
- `style`: フォーマットや見た目のみの変更
- `refactor`: 挙動を変えない整理
- `test`: テスト追加・修正
- `chore`: 開発環境や設定の変更
