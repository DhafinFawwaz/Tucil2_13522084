const timeTakenLabel = document.getElementById('time-taken')
export default function setTimeTaken(ms) {
  timeTakenLabel.textContent = `Time taken: ${ms} ms`
}