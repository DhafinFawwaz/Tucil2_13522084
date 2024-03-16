import { Point } from "pixi.js"
import { getHalfAppHeight } from "../main"

/**
 * 
 * @param {number} name id of the point
 * @param {Function} onChange callback when the value of the point is changed
 * @returns 
 */
export function PointInput(name, defaultX, defaultY, onRemove, onChange) {
  const template = document.createElement('template')
  template.innerHTML = `
<div class="flex gap-2 mx-4">
  <div id="point-name" class="w-4 text-center text-sm rounded-lg self-center mr-1">${name}</div>
  
  <input step=50 type="tel" class="bg-slate-800 duration-100 px-2 py-1 text-slate-50 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-700 ring-inset grow w-16" value=${defaultX}>

  <input step=50 type="tel" class="bg-slate-800 duration-100 px-2 py-1 text-slate-50 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 ring-1 ring-slate-700 ring-inset grow w-16" value=${defaultY}>

  <button class="w-8 bg-slate-800 text-slate-50 hover:bg-slate-700 border border-transparent hover:border-slate-500 duration-100 rounded-lg font-bold ring-1 ring-slate-700 ring-inset">-</button>
</div>
`
  const button = template.content.querySelector('button')
  button.addEventListener('click', () => {
    button.parentElement.remove()
    if(onRemove) onRemove(button.parent)
  })
  const inputs = template.content.querySelectorAll('input');
  inputs[0].addEventListener('input', e => {
    if(!isValid(e)) return;
    const newPos = new Point(parseFloat(e.target.value), parseFloat(inputs[1].value))
    if(onChange) onChange(newPos)
  });
  inputs[1].addEventListener('input', e => {
    if(!isValid(e)) return;
    const newPos = new Point(parseFloat(inputs[0].value), parseFloat(e.target.value))
    if(onChange) onChange(newPos)
  });

  /**
   * @param {Event} e 
   * @returns 
   */
  function isValid(e) {
    /** @type {string} */
    const value = e.target.value
    // last index is ., return false. it means the user is typing a float number

    if(occurrences(value, '.') > 1) {
      console.log('more than one .')
      e.target.value = replaceStringExceptFirstFound(value, '.', '')
    }

    if(value[value.length - 1] === '.') return false;
    
    
    return !isNaN(value) && value !== ''
  }
  

  return [template, inputs[0], inputs[1]]
}


/**
 * @param {string} string 
 * @param {string} subString 
 * @returns 
 */
function occurrences(string, subString) {
  if (subString.length <= 0) return (string.length + 1);

  let n = 0; 
  let pos = 0;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
        ++n;
        pos++;
    } else break;
  }
  return n;
}

/**
 * 
 * @param {string} string 
 * @param {string} subString 
 * @param {string} replace 
 * @returns 
 */
function replaceStringExceptFirstFound(string, subString, replace) {
  const index = string.indexOf(subString);
  if(index === -1) return string;

  /** @type {string} */
  const result = string.replaceAll(subString, replace);

  return result.substring(0, index) + subString + result.substring(index + 1)
}