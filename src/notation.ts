import { Factory } from "vexflow";

export function renderFixedNotation(container: HTMLElement): void {
  container.replaceChildren();

  const factory = new Factory({
    renderer: {
      elementId: container.id,
      width: 500,
      height: 180,
    },
  });

  const score = factory.EasyScore();
  const system = factory.System();

  system
    .addStave({
      voices: [score.voice(score.notes("C4/q"))],
    })
    .addClef("treble")
    .addTimeSignature("4/4");

  factory.draw();
}
