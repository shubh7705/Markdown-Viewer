import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="paste-modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" id="paste-modal-title">Paste Markdown Text</span>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <textarea
              className="paste-textarea"
              placeholder="Paste or type markdown content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              id="paste-markdown-input"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-pill"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!text.trim()}
              id="paste-markdown-submit-btn"
            >
              Render Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
