function getDeviationMinute() {
  
  const body = document.querySelector('body');
  const time = document.createElement('DIV');
  const loading = document.querySelector('.lds-hourglass');
  
  time.className = 'deviation';
  
  fetch('/info')
    .then(res => res.json())
    .then(data => time.innerHTML = data.key)
    .then(() => loading.style.display = 'none')
    .then(() => body.appendChild(time));
}

document.addEventListener('DOMContentLoaded', () => {
  getDeviationMinute();
});