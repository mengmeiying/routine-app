import { useEffect, useState } from 'react';

const EDITOR_HASH = '#editor';

// The editor is a history entry, so the Android back gesture returns to the
// routine screen instead of closing the installed app.
export function useEditorOpen() {
  const [open, setOpen] = useState(() => window.location.hash === EDITOR_HASH);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === EDITOR_HASH);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const openEditor = () => {
    window.history.pushState({ editor: true }, '', EDITOR_HASH);
    setOpen(true);
  };

  const closeEditor = () => {
    if (window.history.state?.editor) {
      // popstate then closes the editor.
      window.history.back();
      return;
    }
    // Opened directly at #editor, so there is no entry of ours to go back to.
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    );
    setOpen(false);
  };

  return { open, openEditor, closeEditor };
}
