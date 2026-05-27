import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <main class="app">
    <p class="label">VexFlow MIDI Realtime Prototype</p>
    <h1>MIDI 入力表示</h1>
    <button class="connect-button" type="button">MIDI に接続</button>
    <p class="status">アプリケーションの準備ができました。</p>
  </main>
`;
