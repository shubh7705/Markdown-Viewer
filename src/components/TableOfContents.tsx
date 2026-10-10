import React from 'react';
import type { TocItem } from '../lib/types';

interface TableOfContentsProps {
  toc: TocItem[];
  activeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  toc,
  activeId,
  isOpen,
  onClose,
}) => {
  if (toc.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 64; // Account for sticky topbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`);

      // Close mobile drawer upon selection
      if (window.innerWidth <= 860) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div
        className={`drawer-backdrop ${isOpen ? 'drawer-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav
        className={`toc-sidebar ${isOpen ? 'drawer-open' : 'collapsed'}`}
        aria-label="Table of contents"
        id="table-of-contents-nav"
      >
        <div className="toc-header">
          <span className="toc-title">On this page</span>
        </div>

        <ul className="toc-list" role="list">
          {toc.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={item.id}
                className={`toc-item toc-item-level-${item.level}`}
              >
                <a
                  href={`#${item.id}`}
                  className={`toc-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  title={item.text}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
