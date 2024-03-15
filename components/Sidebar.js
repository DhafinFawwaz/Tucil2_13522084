
const flex = 'flex';

/**
 * @param {Event} e
 * @param {HTMLElement} sidebar
 */
export function SidebarOpen(sidebarClose, sidebar) {
  sidebar.style.display = flex;
  sidebarClose.style.display = flex;
}


const none = 'none';

/**
 * @param {HTMLElement} sidebarClose
 * @param {HTMLElement} sidebar
 */
export function SidebarClose(sidebarClose, sidebar) {
  sidebar.style.display = none;
  sidebarClose.style.display = none;
}