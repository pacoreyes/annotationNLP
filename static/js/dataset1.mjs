const btnAnnotate = document.getElementById('annotate');
const datapoint = document.getElementById('datapoint');

function setupUI() {
  btnAnnotate.addEventListener('click', async function (e) {
    window.open('/dataset1/edit?id=' + datapoint.value, '_blank');
  });
}

export { setupUI };
