import React from 'react';
import { FolderOpen, FileText, ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  onOpenFile: () => void;
  onOpenPasteModal: () => void;
  onLoadSample: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenFile,
  onOpenPasteModal,
  onLoadSample,
}) => {
  return (
    <div className="empty-state-container" id="empty-state-view">
      <div className="drop-zone" id="empty-state-dropzone">
        <FileText className="drop-zone-icon" aria-hidden="true" />
        <div className="drop-zone-text">Drop a Markdown file here to begin reading</div>
        <div className="drop-zone-subtext">Client-side only. Files never leave your browser.</div>

        <div className="drop-zone-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenFile}
            id="empty-state-open-btn"
          >
            <FolderOpen aria-hidden="true" />
            <span>Open file</span>
          </button>

          <button
            type="button"
            className="btn-pill"
            onClick={onOpenPasteModal}
            id="empty-state-paste-btn"
          >
            <ClipboardList aria-hidden="true" />
            <span>Paste text</span>
          </button>

          <button
            type="button"
            className="btn-pill"
            onClick={onLoadSample}
            id="empty-state-sample-btn"
          >
            <span>Load sample</span>
          </button>
        </div>
      </div>
    </div>
  );
};
