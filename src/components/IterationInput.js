
// Only allow integer
const iterationInput = document.getElementById('iterations');
let previousValue = iterationInput.value;
iterationInput.onchange = e => {
  const value = e.target.value;
  if (!value.match(/^\d*$/)) {
    e.target.value = previousValue;
  } else if(value === '') {
    e.target.value = 1;
    previousValue = 1;
  } else {
    previousValue = value;
  }
}

export default function getIteration() {
  return parseInt(previousValue);
}