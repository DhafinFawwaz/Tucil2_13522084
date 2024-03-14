
const block = 'block';

/**
 * @param {Event} e
 * @param {HTMLElement} rightSidebar
 */
export default function SidebarOpen(sidebarClose, rightSidebar) {
  rightSidebar.style.display = block;
  sidebarClose.style.display = block;
}