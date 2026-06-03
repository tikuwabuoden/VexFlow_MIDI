import { Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";

export function renderNotation(container: HTMLDivElement, noteNames: string[]): void {
  container.replaceChildren();

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(500, 180);

  const context = renderer.getContext();
  const stave = new Stave(10, 30, 460);
  stave.addClef("treble");
  stave.setContext(context).draw();

  const notes = noteNames.map(
    (noteName) =>
      new StaveNote({
        keys: [noteNameToVexFlowKey(noteName)],
        duration: "q",
      }),
  );

  const voice = new Voice({ numBeats: notes.length, beatValue: 4 });
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 360);
  voice.draw(context, stave);
}

function noteNameToVexFlowKey(noteName: string): string {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);

  if (!match) {
    return "c/4";
  }

  return `${match[1].toLowerCase()}/${match[2]}`;
}
