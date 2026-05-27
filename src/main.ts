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
    <p class="status" data-state="idle">アプリケーションの準備ができました。</p>
  </main>
`;

const connectButton = document.querySelector<HTMLButtonElement>(".connect-button");
const status = document.querySelector<HTMLParagraphElement>(".status");

if (!connectButton || !status) {
  throw new Error("MIDI connection controls were not found.");
}

const statusElement = status;

connectButton.addEventListener("click", async () => {
  if (!("requestMIDIAccess" in navigator)) {
    showStatus("このブラウザは Web MIDI API に対応していません。", "error");
    return;
  }

  connectButton.disabled = true;
  showStatus("MIDI の利用許可を確認しています。", "idle");

  try {
    await navigator.requestMIDIAccess();
    showStatus("MIDI を利用できます。", "success");
  } catch {
    showStatus("MIDI の利用が許可されませんでした。", "error");
  } finally {
    connectButton.disabled = false;
  }
});

function showStatus(message: string, state: "idle" | "success" | "error"): void {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}
