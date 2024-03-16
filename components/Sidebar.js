
const flex = 'flex';

/**
 * @param {Event} e
 * @param {HTMLElement} sidebar
 */
export function SidebarOpen(sidebarClose, sidebar) {
  sidebarClose.style.display = flex;
  sidebar.style.transform = 'translateX(0%)';
}


const none = 'none';

/**
 * @param {HTMLElement} sidebarClose
 * @param {HTMLElement} sidebar
 */
export function RightSidebarClose(sidebarClose, sidebar) {
  sidebarClose.style.display = none;
  sidebar.style.transform = 'translateX(100%)';
}

/**
 * @param {HTMLElement} sidebarClose
 * @param {HTMLElement} sidebar
 */
export function LeftSidebarClose(sidebarClose, sidebar) {
  sidebarClose.style.display = none;
  sidebar.style.transform = 'translateX(-100%)';
}