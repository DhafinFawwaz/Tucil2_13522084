
const none = 'none';

/**
 * @param {HTMLElement} sidebarClose
 * @param {HTMLElement} rightSidebar
 */
export default function SidebarClose(sidebarClose, rightSidebar) {
  rightSidebar.style.display = none;
  sidebarClose.style.display = none;
}