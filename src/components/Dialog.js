
const dialog = document.getElementById('dialog');
dialog.addEventListener('click', e => e.stopPropagation());
const dialogBg = document.getElementById('dialog-background');
dialogBg.addEventListener('click', CloseDialog);
const dialogClose = document.getElementById('dialog-close-button');
dialogClose.addEventListener('click', CloseDialog);
const dialogSubmit = document.getElementById('dialog-submit-button');
dialogSubmit.addEventListener('click', CloseDialog);
const dialogContent = document.getElementById('dialog-content');
const dialogTitle = document.getElementById('dialog-title');
export function CloseDialog(e) {
  e.preventDefault();
  dialogBg.classList.remove("opacity-100");
  dialogBg.classList.remove("visible");
  dialogBg.classList.add("opacity-0");
  dialogBg.classList.add("invisible");

  dialog.classList.remove("scale-100");
  dialog.classList.remove("visible");
  dialog.classList.add("scale-75");
  dialog.classList.add("opacity-0");
  dialog.classList.add("invisible");
}

/**
 * Open Dialog with a simple message
 * @param {string} title
 * @param {string} simpleMessage 
 */
export function OpenDialog(title, simpleMessage) {
  dialog.classList.remove("max-w-screen-sm");
  dialog.classList.add("w-96");

  dialogBg.classList.add("opacity-100");
  dialogBg.classList.add("visible");
  dialogBg.classList.remove("opacity-0");
  dialogBg.classList.remove("invisible");

  dialog.classList.add("scale-100");
  dialog.classList.add("visible");
  dialog.classList.remove("scale-75");
  dialog.classList.remove("opacity-0");
  dialog.classList.remove("invisible");

  dialogContent.innerHTML = simpleMessage;
  dialogTitle.textContent = title;
}