# AI Auto Tagger

**[English](#english) | [日本語](#japanese)**

---

<a name="english"></a>
## English

### Description
**AI Auto Tagger** is an Obsidian plugin that automatically generates optimal tags for your notes using AI (Google's Gemini API). It analyzes the context of your active note to keep your vault organized effortlessly.

### Features
- **Auto-tagging**: Generates tags based on note content using Gemini.
- **Configurable**: 
    - **API Key**: Use your own Google Gemini API Key.
    - **Model**: Choose your preferred model (default: `gemini-2.5-flash`).
    - **Max Tags**: Control the number of tags generated.
- **Tag Sanitization**: Automatically formats tags to comply with Obsidian's strict rules (e.g., converts "AI API" to "AI_API").
- **Reuse Existing Tags**: Optional setting to prioritize existing tags in your vault, helping to maintain consistency and avoid duplicate variations.



### Configuration
1.  Go to **Settings > AI Auto Tagger**.
2.  **API Key**: Enter your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  **Model**: Default is `gemini-2.5-flash`.
4.  **Reuse Existing Tags**: Enable this to let the AI see your existing tags. 
    - *Note*: If you have a massive number of tags, enabling this increases the context size sent to the API, which may affect costs.

### Usage
1.  Open any note.
2.  Open the Command Palette (`Cmd/Ctrl + P`).
3.  Run **"AI Auto Tagger: Generate tags for active note"**.
4.  Watch the tags appear in your frontmatter!

---

<a name="japanese"></a>
## 日本語

### 概要
**AI Auto Tagger** は、Google Gemini APIを使用してノートの内容を分析し、最適なタグを自動生成するObsidianプラグインです。

### 特徴
- **AIによる自動タグ付け**: ノートの文脈を理解してタグを提案します。
- **柔軟な設定**:
    - **APIキー**: 自分のGemini APIキーを使用可能。
    - **モデル**: `gemini-2.5-flash` など好きなモデルを指定可能。
- **タグの自動整形**: Obsidianの仕様に合わせて、スペースなどを自動的にアンダースコアに変換します（例: "AI API" → "AI_API"）。
- **既存タグの再利用**: Vault内にある既存のタグを優先して使う機能があり、タグの表記ゆれ（例: `Design` と `design`）を防げます。



### 設定
1.  **設定 > AI Auto Tagger** を開きます。
2.  **API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey) で取得したキーを入力してください。
3.  **Model**: デフォルトは `gemini-2.5-flash` です。
4.  **既存のタグを再利用する**: オンにすると、AIに既存のタグリストを参考資料として渡します。
    - *注意*: タグの数が非常に多い場合、APIに送信されるデータ量（コンテキスト）が増え、コストに影響する可能性があります。

### 使い方
1.  タグ付けしたいノートを開きます。
2.  コマンドパレット (`Cmd/Ctrl + P`) を開きます。
3.  **"AI Auto Tagger: Generate tags for active note"** を実行します。
4.  フロントマターにタグが追加されます。
