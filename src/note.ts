const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midiNoteToName(noteNumber: number): string {
  const noteName = NOTE_NAMES[noteNumber % NOTE_NAMES.length];
  const octave = Math.floor(noteNumber / NOTE_NAMES.length) - 1;

  return `${noteName}${octave}`;
}
