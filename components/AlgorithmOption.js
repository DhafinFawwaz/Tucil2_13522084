
/**
 * @param {HTMLButtonElement[]} buttonList list of buttons to be displayed
 * @param {number} algorithmId 0: divide and conquer, 1: brute force
 */
export function AlgorithmOption(buttonList, algorithmId) {
 buttonList.forEach((button, index) => {
    if (index === algorithmId) {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  });
}