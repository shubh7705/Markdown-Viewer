import React from 'react';
import { UploadCloud } from 'lucide-react';

interface DropOverlayProps {
  isDragging: boolean;
}

export const DropOverlay: React.FC<DropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="drop-overlay" id="full-window-drop-overlay" aria-hidden="true">
      <div className="drop-overlay-box">
        <UploadCloud aria-hidden="true" />
        <span>Drop file to read</span>
      </div>
    </div>
  );
};
