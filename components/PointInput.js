export function PointInput(id) {
  const template = document.createElement('template')
  template.innerHTML = `
<div class="flex gap-2 mx-4">
  <div class="w-4 text-center rounded-lg self-center mr-1">P${id}</div>
  
  <input type="text" class="bg-slate-800 duration-100 px-2 py-1 text-slate-50 rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-indigo-500 grow w-16">

  <input type="text" class="bg-slate-800 duration-100 px-2 py-1 text-slate-50 rounded-lg shadow-sm outline-none ring ring-transparent focus:ring-indigo-500 grow w-16">

  <button class="w-8 bg-slate-800 text-slate-50 hover:bg-slate-700 border border-transparent hover:border-slate-500 duration-100 rounded-lg font-bold">-</button>
</div>
`
  const button = template.content.querySelector('button')
  button.addEventListener('click', () => {
    button.parentElement.remove()
  })

  return template.content
}