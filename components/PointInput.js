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
  inputs[0].addEventListener('input', e => {
    const newPos = new Point(e.target.value, inputs[1].value)
    if(onChange) onChange(newPos)
  });
  inputs[1].addEventListener('input', e => {
    const newPos = new Point(inputs[0].value, e.target.value)
    if(onChange) onChange(newPos)
  });
  
  // template.content.querySelector("#name").textContent = `P${100}`

  return [template, inputs[0], inputs[1]]
}
