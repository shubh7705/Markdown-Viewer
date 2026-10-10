import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={16} aria-hidden="true" />
            <span className="modal-title" id="shortcuts-modal-title">Keyboard Shortcuts</span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="shortcuts-grid">
            <span className="shortcut-desc">Open file picker</span>
            <kbd className="kbd-badge">O</kbd>

            <span className="shortcut-desc">Toggle light / dark theme</span>
            <kbd className="kbd-badge">T</kbd>

            <span className="shortcut-desc">Toggle Table of Contents</span>
            <kbd className="kbd-badge">[</kbd>

            <span className="shortcut-desc">Show keyboard shortcuts</span>
            <kbd className="kbd-badge">?</kbd>

            <span className="shortcut-desc">Close drawer or dialog</span>
            <kbd className="kbd-badge">Esc</kbd>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-pill"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
