import { Point } from "pixi.js"

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
  let prevX = defaultX;
  inputs[0].onchange = e => {
    if(isValid(e) === 0) {
      const newVal = parseFloat(prevX);
      e.target.value = newVal;
      return;
    }
    prevX = parseFloat(e.target.value);

    const newPos = new Point(parseFloat(e.target.value), -parseFloat(inputs[1].value)) // Flip y
    if(onChange) onChange(newPos)
  };
  let prevY = defaultY;
  inputs[1].onchange = e => {
    if(isValid(e) === 0) {
      const newVal = parseFloat(prevY);
      e.target.value = newVal;
      return;
    }
    prevY = parseFloat(e.target.value);

    const newPos = new Point(parseFloat(inputs[0].value), -prevY) // Flip y
    if(onChange) onChange(newPos)
  };

  /**
   * @param {Event} e 
   * @returns 0 if not valid, 1 if valid, 2 if typing a float number
   */
  function isValid(e) {
    /** @type {string} */
    const value = e.target.value
    if(isNaN(value)) return 0;
    else return 1;


    // last index is ., return false. it means the user is typing a float number

    if(occurrences(value, '.') > 1) {
      e.target.value = replaceStringExceptFirstFound(value, '.', '')
    }

    if(value[value.length - 1] === '.') return 2;
    // if latest value is not a number, return false
    if(isNaN(value[value.length - 1]) && value[value.length - 1] !== '.') return 0;
    
    if(!isNaN(value) && value !== '') return 1
    return 0;
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
