import { Point } from "pixi.js"

/**
 * 
 * @param {number} id id of the point
 * @param {Function} onChange callback when the value of the point is changed
 * @returns 
 */
export function PointInput(id, onChange) {
  const template = document.createElement('template')
  template.innerHTML = `
<div class="flex gap-2 mx-4">
  <div class="w-4 text-center text-sm rounded-lg self-center mr-1">P${id}</div>
  
  <input type="number" class="bg-slate-800 duration-100 px-2 py-1 text-slate-50 rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-indigo-500 ring-inset grow w-16">

  <input type="number" class="bg-slate-800 duration-100 px-2 py-1 text-slate-50 rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-indigo-500 ring-inset grow w-16">

  <button class="w-8 bg-slate-800 text-slate-50 hover:bg-slate-700 border border-transparent hover:border-slate-500 duration-100 rounded-lg font-bold">-</button>
</div>
`
  const button = template.content.querySelector('button')
  button.addEventListener('click', () => {
    button.parentElement.remove()
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

  return template.content
}
