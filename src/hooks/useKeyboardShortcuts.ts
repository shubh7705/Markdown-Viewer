import { useEffect } from 'react';

interface ShortcutHandlers {
  onOpenFile: () => void;
  onToggleTheme: () => void;
  onToggleToc: () => void;
  onToggleHelp: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  onOpenFile,
  onToggleTheme,
  onToggleToc,
  onToggleHelp,
  onEscape,
}: ShortcutHandlers): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea, or contentEditable element
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.tagName === 'SELECT')
      ) {
        if (event.key === 'Escape' && onEscape) {
          onEscape();
        }
        return;
      }

      // Ignore if modifier keys (Ctrl/Cmd, Alt) are pressed to prevent overriding OS/browser shortcuts
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key;

      if (key === 'o' || key === 'O') {
        event.preventDefault();
        onOpenFile();
      } else if (key === 't' || key === 'T') {
        event.preventDefault();
        onToggleTheme();
      } else if (key === '[') {
        event.preventDefault();
        onToggleToc();
      } else if (key === '?' || key === '/') {
        event.preventDefault();
        onToggleHelp();
      } else if (key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenFile, onToggleTheme, onToggleToc, onToggleHelp, onEscape]);
}
