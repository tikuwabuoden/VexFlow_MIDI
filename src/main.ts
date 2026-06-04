import "./style.css";
import { midiNoteToName } from "./note";
import { renderNotation } from "./notation";

const MAX_LOG_ITEMS = 10;
const MAX_NOTATION_NOTES = 4;
const inputLog: string[] = [];
const notationNotes = ["C4"];
const TEST_NOTES = [
  { name: "C4", midi: 60 },
  { name: "D4", midi: 62 },
  { name: "E4", midi: 64 },
  { name: "G4", midi: 67 },
];

interface ParsedNoteMessage {
  type: "note-on" | "note-off";
  noteName: string;
  message: string;
}

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
      <div class="test-input-buttons">
        ${TEST_NOTES.map((note) => `<button class="test-input-button" type="button" data-note="${note.name}" data-midi="${note.midi}">${note.name} を入力</button>`).join("")}
      </div>
      <p class="test-input-result">未入力</p>
    </section>
    <section class="notation-panel" aria-label="楽譜表示">
      <h2>楽譜表示</h2>
      <div id="notation-output" class="notation-output"></div>
    </section>
    <section class="log-panel" aria-label="入力ログ">
      <h2>入力ログ</h2>
      <ol class="input-log">
        <li>未入力</li>
      </ol>
    </section>
  </main>
`;

const connectButton = document.querySelector<HTMLButtonElement>(".connect-button");
const status = document.querySelector<HTMLParagraphElement>(".status");
const deviceList = document.querySelector<HTMLParagraphElement>(".device-list");
const messageData = document.querySelector<HTMLParagraphElement>(".message-data");
const messageDetail = document.querySelector<HTMLParagraphElement>(".message-detail");
const testInputButtons = document.querySelectorAll<HTMLButtonElement>(".test-input-button");
const testInputResult = document.querySelector<HTMLParagraphElement>(".test-input-result");
const notationOutput = document.querySelector<HTMLDivElement>("#notation-output");
const inputLogList = document.querySelector<HTMLOListElement>(".input-log");

if (
  !connectButton ||
  !status ||
  !deviceList ||
  !messageData ||
  !messageDetail ||
  testInputButtons.length === 0 ||
  !testInputResult ||
  !notationOutput ||
  !inputLogList
) {
  throw new Error("MIDI connection controls were not found.");
}

const statusElement = status;
const deviceListElement = deviceList;
const messageDataElement = messageData;
const messageDetailElement = messageDetail;
const testInputResultElement = testInputResult;
const notationOutputElement = notationOutput;
const inputLogListElement = inputLogList;

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

testInputButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const noteName = button.dataset.note ?? "C4";
    const midiNumber = button.dataset.midi ?? "60";
    const message = `note on / ${noteName} / MIDI ${midiNumber} / velocity 100`;
    testInputResultElement.textContent = message;
    addNotationNote(noteName);
    addInputLog(message);
  });
});

try {
  renderNotation(notationOutputElement, notationNotes);
} catch {
  notationOutputElement.textContent = "楽譜を描画できませんでした。";
}

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
  const parsedMessage = parseNoteMessage(data);
  messageDetailElement.textContent = parsedMessage?.message ?? "note on/off 以外";

  if (parsedMessage) {
    addInputLog(parsedMessage.message);

    if (parsedMessage.type === "note-on") {
      addNotationNote(parsedMessage.noteName);
    }
  }
}

function parseNoteMessage(data: number[]): ParsedNoteMessage | null {
  if (data.length < 3) {
    return null;
  }

  const command = data[0] & 0xf0;
  const noteNumber = data[1];
  const noteName = midiNoteToName(noteNumber);
  const velocity = data[2];

  if (command === 0x90 && velocity > 0) {
    return {
      type: "note-on",
      noteName,
      message: `note on / ${noteName} / MIDI ${noteNumber} / velocity ${velocity}`,
    };
  }

  if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    return {
      type: "note-off",
      noteName,
      message: `note off / ${noteName} / MIDI ${noteNumber} / velocity ${velocity}`,
    };
  }

  return null;
}

function addInputLog(message: string): void {
  inputLog.unshift(message);
  inputLog.splice(MAX_LOG_ITEMS);
  renderInputLog();
}

function addNotationNote(noteName: string): void {
  notationNotes.push(noteName);
  notationNotes.splice(0, Math.max(0, notationNotes.length - MAX_NOTATION_NOTES));
  try {
    renderNotation(notationOutputElement, notationNotes);
  } catch {
    notationOutputElement.textContent = "楽譜を描画できませんでした。";
  }
}

function renderInputLog(): void {
  inputLogListElement.replaceChildren(...inputLog.map(createInputLogItem));
}

function createInputLogItem(message: string): HTMLLIElement {
  const item = document.createElement("li");
  item.textContent = message;

  return item;
}
