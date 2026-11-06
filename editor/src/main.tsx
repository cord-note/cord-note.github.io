import { StrictMode, useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ShuttleEditor, createFakeHost, type JSONContent, type ShuttleMode } from 'shuttle-editor';
import 'shuttle-editor/styles.css';
import 'katex/dist/katex.min.css';
import { SEEDS, NOTES } from './seeds';

type Scheme = 'light' | 'dark';

export interface MountOptions {
  seed: keyof typeof SEEDS;
  doc?: JSONContent;
  mode: ShuttleMode;
  scheme: Scheme;
  onJson?: (doc: JSONContent) => void;
}

export interface EditorHandle {
  setMode: (mode: ShuttleMode) => void;
  setScheme: (scheme: Scheme) => void;
}

// The site's live editor: real Shuttle, in-memory host, nothing is saved.
export function mount(el: HTMLElement, options: MountOptions): EditorHandle {
  let setMode: (mode: ShuttleMode) => void = () => {};
  let setScheme: (scheme: Scheme) => void = () => {};

  function Demo() {
    const [mode, changeMode] = useState(options.mode);
    const [scheme, changeScheme] = useState(options.scheme);
    const host = useMemo(() => createFakeHost({ notes: NOTES }), []);
    useEffect(() => {
      setMode = changeMode;
      setScheme = changeScheme;
    }, []);
    const start = options.doc ?? SEEDS[options.seed];
    useEffect(() => {
      options.onJson?.(start);
    }, []);
    return (
      <ShuttleEditor
        docKey={options.seed}
        doc={start}
        mode={mode}
        host={host}
        colorScheme={scheme}
        twitch={false}
        spellCheck={false}
        saveDebounceMs={150}
        placeholder="Type here, or / for commands"
        onChange={(_key, next) => options.onJson?.(next)}
      />
    );
  }

  createRoot(el).render(<StrictMode><Demo /></StrictMode>);
  return {
    setMode: (mode) => setMode(mode),
    setScheme: (scheme) => setScheme(scheme),
  };
}
