import {fetchData} from "./lib/utils.mjs";

function setupUI() {
  /** ----------------------------------------
   * Handle Team selector
   --------------------------------------- **/
  const teamSelector = document.getElementById("team");
  const annotatorSelector = document.getElementById("annotator");
  // check if localStorage has team
  if (localStorage.getItem("team")) {
    // set value of team in teamSelector to team
    teamSelector.value = localStorage.getItem("team");
  }
  teamSelector.addEventListener("change", (event) => {
    if (teamSelector.value) {
      // save team in localStorage
      localStorage.setItem("team", document.getElementById("team").value);
      console.log(`Saved team: ${teamSelector.value}`);
    }
  });
  // check if localStorage has annotator
  if (localStorage.getItem("annotator")) {
    // set value of team in teamSelector to team
    annotatorSelector.value = localStorage.getItem("annotator");
  }
  annotatorSelector.addEventListener("change", (event) => {
    if (annotatorSelector.value) {
      // save team in localStorage
      localStorage.setItem("annotator", document.getElementById("annotator").value);
      console.log(`Saved annotator: ${annotatorSelector.value}`);
    }
  });

  /** ----------------------------------------
   * Handle Annotator selector
   --------------------------------------- **/
  // check if localStorage has annotator
  if (localStorage.getItem("annotator")) {
    // set value of team in teamSelector to team
    annotatorSelector.value = localStorage.getItem("annotator");
  }
  annotatorSelector.addEventListener("change", (event) => {
    if (annotatorSelector.value) {
      // save team in localStorage
      localStorage.setItem("annotator", document.getElementById("annotator").value);
      console.log(`Saved annotator: ${annotatorSelector.value}`);
    }
  });

  /** ----------------------------------------
   * Handle Annotator launcher
   --------------------------------------- **/
  const btnDset1 = document.getElementById("dataset1");
  const btnDset2 = document.getElementById("dataset2");
  [btnDset1, btnDset2].forEach((btns) => {
    btns.addEventListener("click", (event) => {
      //const teamSelector = document.getElementById("team");
      // check if value of option selected in teamSelector is not empty
      if (teamSelector.value && event.target.id === "dataset1") {
        // open Editor page
        window.open(`/${event.target.id}`, "_self");
      } else if (annotatorSelector.value && event.target.id === "dataset2") {
        // open Editor page
        window.open(`/${event.target.id}/edit`, "_self");
      } else {
        alert("Please select a team");
      }
    });
  });

  /** ----------------------------------------
   * Handle dataset Download buttons
   --------------------------------------- **/
  const btnDownload1 = document.getElementById("downloadDataset1");
  const btnDownload2 = document.getElementById("downloadDataset2");
  [btnDownload1, btnDownload2].forEach((btns) => {
    btns.addEventListener("click", async function (event) {
      let datasetName, progressBar, url;
      if (event.target.id === "downloadDataset1" && teamSelector.value) {
        datasetName = "dataset1";
        progressBar = "progress1";
        url = `/api/${datasetName}/download/${teamSelector.value}`;
      } else if (event.target.id === "downloadDataset2" && annotatorSelector.value) {
        datasetName = "dataset2";
        progressBar = "progress2";
        url = `/api/${datasetName}/download/${annotatorSelector.value}`;
      } else {
        alert("Please select an Annotator");
      }
      //const url = `/api/${datasetName}/download/${teamSelector.value}`;
      let dataset = await fetchData(url, progressBar);

      // Convert each object to a string and join them with newline characters
      dataset = dataset.map(item => JSON.stringify(item)).join('\n');
      // Create a Blob from the string
      const blob = new Blob([dataset], {type: "application/x-ndjson"});
      // Create a link element
      const link = document.createElement('a');
      // Set the download attribute with a filename
      link.download = `${datasetName}_raw.jsonl`;
      // Create a URL for the Blob and set it as the href attribute
      link.href = window.URL.createObjectURL(blob);
      // Append the link to the body
      document.body.appendChild(link);
      // Programmatically click the link to trigger the download
      link.click();
      // Remove the link from the document
      document.body.removeChild(link);
    });
  });
}

export {setupUI};
