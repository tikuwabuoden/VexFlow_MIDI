import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML =/* html */ `
  <main class="app">
    <p class="label">VexFlow MIDI Realtime Prototype</p>
    <h1>MIDI 入力表示</h1>
    <button class="connect-button" type="button">MIDI に接続</button>
    <p class="status" data-state="idle">アプリケーションの準備ができました。</p>
    <section class="device-panel" aria-label="MIDI 入力デバイス">
      <h2>入力デバイス</h2>
      <p class="device-list">未確認</p>
    </section>
    <section class="message-panel" aria-label="MIDI メッセージ">
      <h2>最新 MIDI メッセージ</h2>
      <p class="message-data">未受信</p>
      <p class="message-detail">未解析</p>
    </section>
    <section class="test-panel" aria-label="テスト入力">
      <h2>テスト入力</h2>
      <button class="test-input-button" type="button">C4 を入力</button>
      <p class="test-input-result">未入力</p>
    </section>
  </main>
`;

const connectButton = document.querySelector<HTMLButtonElement>(".connect-button");
const status = document.querySelector<HTMLParagraphElement>(".status");
const deviceList = document.querySelector<HTMLParagraphElement>(".device-list");
const messageData = document.querySelector<HTMLParagraphElement>(".message-data");
const messageDetail = document.querySelector<HTMLParagraphElement>(".message-detail");
const testInputButton = document.querySelector<HTMLButtonElement>(".test-input-button");
const testInputResult = document.querySelector<HTMLParagraphElement>(".test-input-result");

if (!connectButton || !status || !deviceList || !messageData || !messageDetail || !testInputButton || !testInputResult) {
  throw new Error("MIDI connection controls were not found.");
}

const statusElement = status;
const deviceListElement = deviceList;
const messageDataElement = messageData;
const messageDetailElement = messageDetail;
const testInputResultElement = testInputResult;

connectButton.addEventListener("click", async () => {
  if (!("requestMIDIAccess" in navigator)) {
    showStatus("このブラウザは Web MIDI API に対応していません。", "error");
    return;
  }

  connectButton.disabled = true;
  showStatus("MIDI の利用許可を確認しています。", "idle");

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    showStatus("MIDI を利用できます。", "success");
    showInputDevices(midiAccess);
    listenToInputMessages(midiAccess);
  } catch {
    showStatus("MIDI の利用が許可されませんでした。", "error");
    showDeviceList("未確認");
  } finally {
    connectButton.disabled = false;
  }
});

testInputButton.addEventListener("click", () => {
  testInputResultElement.textContent = "C4 / MIDI 60 / velocity 100";
});

function showStatus(message: string, state: "idle" | "success" | "error"): void {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

function showInputDevices(midiAccess: MIDIAccess): void {
  const inputNames: string[] = [];
  midiAccess.inputs.forEach((input) => {
    inputNames.push(input.name ?? "名称不明のデバイス");
  });

  showDeviceList(inputNames.length > 0 ? inputNames.join(", ") : "入力デバイスは検出されませんでした。");
}

function showDeviceList(message: string): void {
  deviceListElement.textContent = message;
}

function listenToInputMessages(midiAccess: MIDIAccess): void {
  midiAccess.inputs.forEach((input) => {
    input.onmidimessage = showRawMidiMessage;
  });
}

function showRawMidiMessage(event: MIDIMessageEvent): void {
  if (!event.data) {
    messageDataElement.textContent = "データなし";
    messageDetailElement.textContent = "未解析";
    return;
  }

  const data = Array.from(event.data);
  messageDataElement.textContent = data.join(", ");
  messageDetailElement.textContent = parseNoteMessage(data);
}

function parseNoteMessage(data: number[]): string {
  if (data.length < 3) {
    return "解析対象外";
  }

  const command = data[0] & 0xf0;
  const noteNumber = data[1];
  const velocity = data[2];

  if (command === 0x90 && velocity > 0) {
    return `note on / MIDI ${noteNumber} / velocity ${velocity}`;
  }

  if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    return `note off / MIDI ${noteNumber} / velocity ${velocity}`;
  }

  return "note on/off 以外";
}
