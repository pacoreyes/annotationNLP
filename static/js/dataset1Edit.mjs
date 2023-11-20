import {
  fetchData,
  pushData
} from "./lib/utils.mjs";
import {
  removeTimeStamps
} from "./lib/textPreProcessing.mjs";


async function setupUI() {
  const h2 = document.querySelector("h2");
  const textInfoContainer = document.querySelector("#textInfo");
  const classSelect = document.getElementById("selectDiscourseType");
  const saveBtn = document.querySelector("#saveDatapoint");
  const removeTSBtn = document.querySelector("#removeTimeStamps");
  const linkEl = document.createElement("a");
  const urlParams = new URL(document.location).searchParams;
  const id = urlParams.get("id");
  const url = `/api/dataset1/edit/${id}`;
  const datapoint1 = await fetchData(url, "progress1");
  const datapointText = datapoint1["dataset1_text"];
  const content = datapointText.map(text => `<p>${text}</p>`).join("");

  // Put text data on the UI
  h2.innerText = datapoint1["title"];
  linkEl.href = datapoint1["url"];
  linkEl.innerText = datapoint1["website"];
  linkEl.target = "_blank";

  //console.log(datapoint1)
  //console.log(datapoint1["dataset1_class"])

  // select classSelect option using datapoint1["dataset1_class"]
  if (datapoint1["dataset1_class"] === 0 || datapoint1["dataset1_class"] === 1) {
    classSelect.value = datapoint1["dataset1_class"];
  }

  textInfoContainer.append(h2);
  textInfoContainer.append(linkEl);

  // tiny editor
  tinymce.init({
    selector: 'textarea#editor',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { ' +
      'font-family: "Times New Roman", Times, serif; ' +
      'font-size:24px; ' +
      'color : #DDDDDD; ' +
      'background-color: #242436 }',
    setup: function (editor) {
      editor.on('init', function () {
        editor.setContent(content);
      });
    }
  });
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Initialize classValue and slots with empty values
    let classValue, slots;
    // get text from tiny editor
    classValue = classSelect.value;
    const editor = tinymce.get("editor");
    // Get the content of the editor as an HTML string
    const htmlContent = editor.getContent();
    // Use DOMParser to convert the HTML string to a Document
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    // Extract the text from each <p> element
    const textList = Array.from(doc.querySelectorAll("p")).map(p => p.textContent);
    // Get team number from local storage
    if (!classSelect.value) {
      const userAction = confirm("ALERT: the class is empty. If you click on 'OK'', the datapoint will be excluded from your dataset or not be included in your dataset. Do you want to proceed?");
      if (!userAction) { // if user clicks on cancel
        // console.log(userAction)
        return;
      } else { // if user clicks on "OK"
        // assign empty value to class
        // classValue = "";
        slots = { // this will reset the datapoint to unannotated
          "id": id,
          "dataset1_text": textList,
          "dataset1_class": null,
          "annotator": null
        }
      }
    } else { // if class is not empty
      const teamNumber = localStorage.getItem("team");
      slots = {
        "id": id,
        "dataset1_text": textList,  // Pass the list of strings instead of the HTML content
        "dataset1_class": classValue,
        "annotator": `IE-${teamNumber}`
      }
    }
    pushData(`/api/dataset1/`, "progress1", slots, "PUT");
  });
  removeTSBtn.addEventListener("click", (e) => {
    // Get the TinyMCE editor
    const editor = tinymce.get("editor");
    // Get the content of the editor as an HTML string
    let htmlContent = editor.getContent();
    // Use a DOMParser to convert the HTML string to a Document
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlContent, "text/html");
    // Get all paragraph elements
    let pElements = doc.getElementsByTagName("p");
    // Loop through each paragraph and process its content
    for (let p of pElements) {
      p.textContent = removeTimeStamps(p.textContent);
    }
    // Serialize the Document back to an HTML string
    let serializer = new XMLSerializer();
    htmlContent = serializer.serializeToString(doc);
    // Set the editor's content to the processed content
    editor.setContent(htmlContent);
  });
}

export {setupUI};
