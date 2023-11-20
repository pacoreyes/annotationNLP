import {fetchData, getWikidataLabelByQID, hideProgressBar, pushData, showProgressBar} from "./lib/utils.mjs";


// Initialize UI elements in Editor section
const h1El = document.querySelector("main > h1");
const editorDiv = document.getElementById("editor");

// Initialize UI elements in sidebar
const h2El = document.querySelector("aside > h2");
const issueEl = document.getElementById("issue");
const urlEl = document.getElementById("url");
const wikidataUl = document.getElementById("wikidata");

// Initialize Boundary buttons
const boundaryButtonEls = document.querySelectorAll("aside > table > tbody button");

// Initialize Action buttons
const acceptButtonEl = document.getElementById("acceptDatapoint");
const rejectButtonEl = document.getElementById("rejectDatapoint");
const ignoreButtonEl = document.getElementById("ignoreDatapoint");
const undoButtonEl = document.getElementById("undoDatapoint");
const allActionButtons = [acceptButtonEl, rejectButtonEl, ignoreButtonEl, undoButtonEl];

// Initialize passage range
let passageRangeData;

// Initialize sentenceEls
let sentenceEls;

let passageRootSentIdx; // Also passage issue index

// Initialize issue data
let issueMatchedName;
let issueQid;
let issueSpanStart; // Start of issue span in its sentence (root sentence)
let issueSpanEnd; // End of issue span in its sentence (root sentence)

/** API operations **/
async function retrievePassageById(passage_id) {
  return await fetchData(`/api/dataset2?passage_id=${passage_id}`, "progress1");
}

async function retrieveRandomPassage() {
  const passage_data = await fetchData("/api/dataset2?random=true", "progress1");
  // Update url in the browser with passage ID
  const url = `/dataset2/edit?passage_id=${passage_data["id"]}`;
  window.history.pushState({}, "", url);
  return passage_data;
}

async function updatePassage(passage_id, slots) {
  await pushData(`/api/dataset2/${passage_id}`, "progress1", slots, "PUT");
}

/** Main UI rendering function **/
async function renderTextBase(passage_data) {
  showProgressBar("progress1");

  /** Step 1: Empty UI elements **/

  // Editor section
  h1El.innerText = "";
  editorDiv.innerHTML = "";

  // Sidebar section
  h2El.innerText = "";
  issueEl.innerText = "";
  urlEl.innerText = "";
  wikidataUl.innerHTML = "";

  /** Step 2: Prepare data **/

  // Load text split into sentences
  const text = passage_data["original_text_split"];

  // Initialize passage start sentence (index)
  let passageStartSentIdx = passage_data["sentences"][0]["sent_index"];

  // Find and prepare issue data
  const rootSentence = passage_data["sentences"].find(sentence => sentence["root"] === true);
  // Get issue data from root sentence
  const {issue_name, issue_qid, issue_span_start, issue_span_end, sent_index} = rootSentence;
  issueMatchedName = issue_name;
  issueQid = issue_qid;
  issueSpanStart = issue_span_start;
  issueSpanEnd = issue_span_end;
  passageRootSentIdx = sent_index;

  // Get wikidata labels for issues
  const entities = await Promise.all(issueQid.map(async qid => {
    const label = await getWikidataLabelByQID(qid);
    return {
      qid: qid,
      label: label
    };
  }));

  /** Step 3: Fill UI elements with data in sidebar **/

  // Fill passage ID
  h2El.innerText = `Passage ID: ${passage_data["id"]}`;

  // Fill link to source text
  const linkEl = document.createElement("a");
  linkEl.href = passage_data["url"];
  linkEl.innerText = "Link to the text source...";
  linkEl.target = "_blank";
  urlEl.append(linkEl);

  // Fill found political issues data
  issueEl.innerText = issueMatchedName;

  // Fill wikidata info of political issues
  for (const entity of entities) {
    const liEl = document.createElement("li");
    const aEl = document.createElement("a");
    aEl.href = `https://www.wikidata.org/wiki/${entity["qid"]}`;
    aEl.target = "_blank";
    aEl.innerText = `${entity["label"]} (${entity["qid"]})`;
    liEl.append(aEl);
    wikidataUl.append(liEl);
  }

  /** Step 4: Initialize base text data in Editor **/

  // Fill title of the text
  h1El.innerText = passage_data["original_text_title"];

  // Fill editor with text
  for (const [idx, sentence] of text.entries()) {
    const sentenceEl = document.createElement("p");
    if (passageStartSentIdx === idx) {
      sentenceEl.id = "anchor_target";
    }
    //sentenceEl.innerText = `(${idx}) ${sentence}`;
    sentenceEl.innerText = sentence;
    editorDiv.append(sentenceEl);
  }
  hideProgressBar("progress1");
}


function renderPassage(passageRangeData) {
  /** Initialize passage over the base text in Editor **/

  // Remove all style from all sentences in the passage range
  for (const sentenceEl of sentenceEls) {
    sentenceEl.classList.remove("outside", "beginning", "inside");
  }
  // Add style to sentences in the passage range
  for (const [idx, sentence] of passageRangeData.entries()) {

    // Get the index of the current sentence from the passage in the text
    const sentenceElIdx = sentence["sent_index"];

    // Add style to 1st sent of passage if it is first sent of text (START text EDGE)
    if (idx === 0 && sentenceElIdx === 0) {
      sentenceEls[sentenceElIdx].classList.add("beginning");
    // Add style to 1st sent of passage if it is not the first sent of text
    } else if (idx === 0 && sentenceElIdx > 1) {
      sentenceEls[sentenceElIdx].classList.add("outside");
    // Add style to 2nd sent of passage if it is not the first sent of text
    } else if (idx === 1 && sentenceElIdx > 1) {
      sentenceEls[sentenceElIdx].classList.add("beginning");
    // Add style to last sent of passage if it is the last sent of text (END text EDGE)
    } else if (idx === passageRangeData.length - 1 && sentenceElIdx === sentenceEls.length - 1) {
      sentenceEls[sentenceElIdx].classList.add("inside");
    // Add style to last sent of passage if it is not the last sent of text
    } else if (idx === passageRangeData.length - 1 && sentenceElIdx < sentenceEls.length - 1) {
      sentenceEls[sentenceElIdx].classList.add("outside");
    // Add style to all other sentences inside the passage range
    } else {
      sentenceEls[sentenceElIdx].classList.add("inside");
    }

    // Add special style to sentence where the issue is found
    if (sentenceElIdx === passageRootSentIdx) {
      // passageRootSentIdx is the index of the sentence where the issue is found
      const sentenceWithIssueEl = addIssueHighlight(sentenceEls[passageRootSentIdx]);
      sentenceEls[passageRootSentIdx].replaceWith(sentenceWithIssueEl);
    }
  }

  // Add style to the sentences where the issue is found
  function addIssueHighlight(sentenceEl) {
    const sentence = sentenceEl.textContent;
    // Split the sentence into three parts: before, word to be wrapped, and after
    const before = sentence.substring(0, issueSpanStart);
    const word = sentence.substring(issueSpanStart, issueSpanEnd);
    const after = sentence.substring(issueSpanEnd);
    const newSentenceEl = document.createElement("p");
    newSentenceEl.innerHTML = `${before}<span class="issue">${word}</span>${after}`;
    for (let className of sentenceEl.classList) {
      newSentenceEl.classList.add(className);
    }
    return newSentenceEl;
  }
}

// Convert passage range data to more simple data for UI
function reformatPassageRangeData(passageRangeData) {
  // Convert passage range data to UI passage range data
  const reformattedPassageRangeData = passageRangeData.map(sentence => {
    return {
      "sent_index": sentence["sent_index"],
      "sentence": sentence["sentence"],
    };
  });
  // Find root sentence and mark it
  const rootSent = reformattedPassageRangeData.find(sent => sent["sent_index"] === passageRootSentIdx);
  rootSent["root"] = true;
  return reformattedPassageRangeData;
}

// Update passage range data based on the actions of the boundary buttons
function updatePassageRange(action) {
  switch (action) {
    case "+ Up":
      // Add a sentence before the first sentence of the passage
      const prevSentence = sentenceEls[passageRangeData[0]["sent_index"] - 1];
      if (prevSentence) {
        passageRangeData.unshift({
          "sent_index": passageRangeData[0]["sent_index"] - 1,
          "sentence": prevSentence.textContent
        });
        renderPassage(passageRangeData);
      }
      break;
    case "– Up":
      // Remove the first sentence of the passage
      passageRangeData.shift();
      renderPassage(passageRangeData);
      break;
    case "+ Down":
      // Add a sentence after the last sentence of the passage
      const nextSentence = sentenceEls[passageRangeData[passageRangeData.length - 1]["sent_index"] + 1];
      if (nextSentence) {
        passageRangeData.push({
          "sent_index": passageRangeData[passageRangeData.length - 1]["sent_index"] + 1,
          "sentence": nextSentence.textContent
        });
        renderPassage(passageRangeData);
      }
      break;
    case "– Down":
      // Remove the last sentence of the passage
      passageRangeData.pop();
      renderPassage(passageRangeData);
      break;
  }
}

function renderConsoleLog(passage_data) {
  console.clear();
  // get the sent_index of the root sentence
  const rootSentIdx = passage_data["sentences"].find(sentence => sentence["root"] === true)["sent_index"];

  // Render the text on console
  for (const [idx, sentence] of passage_data["sentences"].entries()) {
    if (sentence["outside"] && idx === 0) {
      console.log(`%c${sentence["sent_index"]}: ${sentence["sentence"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Coreference: ${sentence["has_coreference"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Semantic chain: ${sentence["has_semantic_chain"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Transition markers: ${sentence["has_transition_markers"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Parallelism: ${sentence["has_parallelism"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c* Logical continuity: ${sentence["has_logical_continuity"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c* Tense/Aspect continuity: ${sentence["has_tense_or_aspect_change"]}`, 'color: yellow; font-weight: bold;');
      console.log("%cOUTSIDE -----------------------", 'color: yellow; font-weight: bold;');
    } else if (sentence["outside"] && idx === passage_data["sentences"].length - 1) {
      console.log("%cOUTSIDE -----------------------", 'color: yellow; font-weight: bold;');
      console.log(`%c• Coreference: ${sentence["has_coreference"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Semantic chain: ${sentence["has_semantic_chain"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Transition markers: ${sentence["has_transition_markers"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c• Parallelism: ${sentence["has_parallelism"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c* Logical continuity: ${sentence["has_logical_continuity"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c* Tense/Aspect continuity: ${sentence["has_tense_or_aspect_change"]}`, 'color: yellow; font-weight: bold;');
      console.log(`%c${sentence["sent_index"]}: ${sentence["sentence"]}`, 'color: yellow; font-weight: bold;');
    } else if (sentence["root"]) {
      console.log(`%c${sentence["sent_index"]}: ${sentence["sentence"]}`, 'color: orange; font-weight: bold;');
    } else {
      if (sentence["sent_index"] < rootSentIdx) {  // before root
        console.log(`${sentence["sent_index"]}: ${sentence["sentence"]}`)
        console.log(`%c• Coreference: ${sentence["has_coreference"]}`, 'color: white; font-weight: bold;');
        console.log(`%c• Semantic chain: ${sentence["has_semantic_chain"]}`, 'color: white; font-weight: bold;');
        console.log(`%c• Transition markers: ${sentence["has_transition_markers"]}`, 'color: white; font-weight: bold;');
        console.log(`%c• Parallelism: ${sentence["has_parallelism"]}`, 'color: white; font-weight: bold;');
        console.log(`%c* Logical continuity: ${sentence["has_logical_continuity"]}`, 'color: white; font-weight: bold;');
        console.log(`%c* Tense/Aspect continuity: ${sentence["has_tense_or_aspect_change"]}`, 'color: white; font-weight: bold;');
      } else if (sentence["sent_index"] > rootSentIdx) {  // after root
        console.log(`%c• Coreference: ${sentence["has_coreference"]}`, 'color: white; font-weight: bold;');
        console.log(`%c• Semantic chain: ${sentence["has_semantic_chain"]}`, 'color: white; font-weight: bold;');
        console.log(`%c• Transition markers: ${sentence["has_transition_markers"]}`, 'color: white; font-weight: bold;');
        console.log(`%c• Parallelism: ${sentence["has_parallelism"]}`, 'color: white; font-weight: bold;');
        console.log(`%c* Logical continuity: ${sentence["has_logical_continuity"]}`, 'color: white; font-weight: bold;');
        console.log(`%c* Tense/Aspect continuity: ${sentence["has_tense_or_aspect_change"]}`, 'color: white; font-weight: bold;');
        console.log(`${sentence["sent_index"]}: ${sentence["sentence"]}`);
      }
    }
  }
  if (passage_data["dataset2_datapoint"]) {
    console.log("%cDATAPOINT INFO -----------------------", 'color: cyan; font-weight: bold;');
    console.log(`%c Annotator: ${passage_data["annotator"]}`, 'color: white; font-weight: bold;')
    if (passage_data["is_accepted_dataset2_datapoint"]) {
      console.log(`%c Accepted datapoint`, 'color: white; font-weight: bold;')
    } else {
      console.log(`%c Rejected datapoint`,'color: white; font-weight: bold;')
    }
    let sentencesList = passage_data["dataset2_datapoint"].map(p => p["sentence"]);
    sentencesList = JSON.stringify(sentencesList);
    console.log(`%c ${sentencesList}`, 'color: white; font-weight: bold;');
  } else if (passage_data["is_accepted_dataset2_datapoint"] === false) {
    console.log("%c DATAPOINT INFO -----------------------", 'color: cyan; font-weight: bold;');
    console.log(`%c Annotator: ${passage_data["annotator"]}`, 'color: white; font-weight: bold;')
    console.log(`%c Rejected datapoint`, 'color: white; font-weight: bold;')
  }
}


// Setup main UI
async function setupUI() {
  // Load data based on two conditions:
  let passage_data;
  // Check if URL has parameters
  const currentUrl = new URL(window.location.href);
  const params = new URLSearchParams(currentUrl.search);
  const passage_id = params.get("passage_id");
  // Condition 1: if URL has parameters, load data based on the passage ID
  if (passage_id) {
    passage_data = await retrievePassageById(passage_id);
  } else { // Condition 2: if URL has no parameters, load a random passage
    passage_data = await retrieveRandomPassage();
  }

  async function renderText() {
    /** Step 1: Render the text base on the UI **/
    await renderTextBase(passage_data);
    /** Step 2: Get all sentences in the editor **/
    sentenceEls = document.querySelectorAll("#editor > p");
    /** Step 3: reformat passage range data **/
    passageRangeData = await reformatPassageRangeData(passage_data["sentences"]);
    /** Step 4: Render the passage on the UI **/
    await renderPassage(passageRangeData);
    /** Step 5: Scroll UI to passage to the center of the viewport **/
    //document.getElementById("anchor_target").scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  // Render the text
  await renderText();
  renderConsoleLog(passage_data)

  // Define functionality of action buttons
  allActionButtons.forEach(buttonEl => {
    buttonEl.addEventListener("click", async function () {
      const annotatorName = localStorage.getItem("annotator");

      // Case 1: Add passage to dataset2 ("dataset2_datapoint" attribute)
      if (buttonEl.id === "acceptDatapoint") {

        // Convert NodeList to Array and filter out elements without a class
        const filteredElements = Array.from(sentenceEls).filter(p => p.className);

        // Map to objects with required attributes
        const passageData = filteredElements.map((pElement, index) => ({
          sent_index: index,
          sentence: pElement.textContent,
          role: pElement.className
        }));

        const slots = {
          "id": passage_id,
          "dataset2_datapoint": passageData,
          "is_accepted_dataset2_datapoint": true,
          "annotator": `IE-${annotatorName}`
        }
        await updatePassage(passage_data["id"], slots);
        passage_data = await retrieveRandomPassage();
        await renderText();

      // Case 2: Reject passage: label it as "is_accepted_dataset2_datapoint" = false
      } else if (buttonEl.id === "rejectDatapoint") {
        const slots = {
          "id": passage_id,
          "dataset2_datapoint": "", // Remove the attribute from the passage record
          "is_accepted_dataset2_datapoint": false,
          "annotator": `IE-${annotatorName}`
        }
        await updatePassage(passage_data["id"], slots);
        passage_data = await retrieveRandomPassage();
        await renderText();

      // Case 3: Ignore passage: do nothing, just skip to the next passage
      } else if (buttonEl.id === "ignoreDatapoint") {
        passage_data = await retrieveRandomPassage();
        await renderText();

      // Case 4: Undo, remove any label related to dataset2 from the passage
      } else if (buttonEl.id === "undoDatapoint") {
        const slots = {
          "id": passage_id,
          "dataset2_datapoint": "", // Remove the attribute from the passage record
          "is_accepted_dataset2_datapoint": "", // Remove the attribute from the passage record
          "annotator": ""
        }
        await updatePassage(passage_data["id"], slots);
        passage_data = await retrieveRandomPassage();
        await renderText();
      }
      renderConsoleLog(passage_data);
      document.getElementById("anchor_target").scrollIntoView({behavior: 'smooth', block: 'center'});
    });
  });

  // Define functionality of boundary buttons
  boundaryButtonEls.forEach(buttonEl => {
    buttonEl.addEventListener("click", function () {
      const action = buttonEl.dataset.action;
      updatePassageRange(action);
    });
  });

  // console.log(document.getElementById("anchor_target"))
  document.getElementById("anchor_target").scrollIntoView({behavior: 'smooth', block: 'center'});
}

export {setupUI};
