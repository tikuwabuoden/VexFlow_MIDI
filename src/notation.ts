import { Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";

export function renderFixedNotation(container: HTMLDivElement): void {
  container.replaceChildren();

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(500, 180);

  const context = renderer.getContext();
  const stave = new Stave(10, 30, 460);
  stave.addClef("treble");
  stave.setContext(context).draw();

  const notes = [
    new StaveNote({
      keys: ["c/4"],
      duration: "q",
    }),
  ];

  const voice = new Voice({ numBeats: 1, beatValue: 4 });
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 360);
  voice.draw(context, stave);
}
