/**
 * Create a counter widget that shows entity and its quantity.
 *
 * @param {string} entity - The entity name to be displayed.
 * @param {number} quantity - The quantity of the entity to be displayed.
 * @returns {object} The created span element.
 */
function createCounterWidget(entity, quantity) {
  const spanEl = document.createElement("span");
  spanEl.textContent = `${entity} (${quantity.toString()})`;
  return spanEl;
}

/**
 * Toggles the visibility of the navigation menu.
 */
function toggleNavigationMenuVisibility() {
  const iconEl = document.querySelector("div.nav-icon"),
    navEl = document.querySelector("nav.menu-tray");
  iconEl.addEventListener("click", function () {
    navEl.hidden = navEl.hidden !== true;
  });
}

/**
 * Convert a map of values into a UL element.
 *
 * @param {object} et - The entity table.
 * @param {string} displayProp - The object property to be displayed in the list.
 * @returns {object} The created UL element.
 */
function createListFromMap(et, displayProp) {
  const listEl = document.createElement("ul");
  fillListFromMap(listEl, et, displayProp);
  return listEl;
}

/**
 * Fill a list element with items from an entity table.
 *
 * @param {object} listEl - A list element.
 * @param {object} et - An entity table.
 * @param {string} displayProp - The object property to be displayed in the list.
 */
function fillListFromMap(listEl, et, displayProp) {
  const keys = Object.keys(et);
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of keys) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = et[key][displayProp];
    listEl.appendChild(listItemEl);
  }
}

/**
 * Create a list from an array.
 *
 * @param {array} array - The array of elements.
 * @returns {object} The created UL element.
 */
function createListFromArray(array) {
  const listEl = document.createElement("ul");
  for (const el of array) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = el;
    listEl.appendChild(listItemEl);
  }
  return listEl;
}

/**
 * Create a DOM option element
 *
 * @param {string} val
 * @param {string} txt
 * @param {string} classValues [optional]
 *
 * @return {object}
 */
function createOption(val, txt, classValues) {
  const el = document.createElement("option");
  el.value = val;
  el.text = txt || val;
  if (classValues) el.className = classValues;
  return el;
}


function fillSelectWithOptions(selectEl, objects, valueAttr, displayAttr) {
  // Clear existing options
  selectEl.innerHTML = "";

  // Create and append the default option
  let defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "---";
  selectEl.appendChild(defaultOption);

  // Create and append new options
  for (let obj of objects) {
    let option = document.createElement('option');
    option.value = obj[valueAttr];
    option.textContent = obj[displayAttr];
    selectEl.appendChild(option);
  }
}

/**
 * Show a progress bar element.
 *
 * @param {string} elementId - The ID of the progress bar element.
 */
function showProgressBar(elementId) {
  const progressEl = document.querySelector(`progress#${elementId}`);
  progressEl.hidden = false;
}

/**
 * Hide a progress bar element.
 *
 * @param {string} elementId - The ID of the progress bar element.
 */
function hideProgressBar(elementId) {
  const progressEl = document.querySelector(`progress#${elementId}`);
  progressEl.hidden = true;
}

/**
 * Trigger an action by making a GET request to a URL when a button is clicked.
 *
 * @param {string} url - The URL to make a GET request to.
 * @param {string} progressId - The ID of the progress bar element.
 * @param {string} [buttonId=triggerButton] - The ID of the button to add the click event listener to.
 */

/*function triggerAction(url, progressId, buttonId = "triggerButton") {
  const button = document.getElementById(buttonId);

  button.addEventListener("click", async function () {
    showProgressBar(progressId);
    await fetch(url, {
      method: "GET",
    });
    hideProgressBar(progressId);
  });
}*/

/**
 * Create option elements with issue parents from data.
 *
 * @param {array} data - The array of data.
 * @returns {object} The created document fragment.
 */
function createOptionsWithIssuesParents(data) {
  const fragment = new DocumentFragment();
  for (const l1 of data) {
    const groupEL = document.createElement("optGroup");
    groupEL.setAttribute("label", l1["preferred_name"].trim());
    for (const l2 of l1.children) {
      const optEL = document.createElement("option");
      optEL.setAttribute("value", l2["qid"]);
      optEL.innerHTML = l2["preferred_name"];
      groupEL.appendChild(optEL);
    }
    fragment.appendChild(groupEL);
  }
  return fragment;
}

/**
 * Convert a JS Date object to Date string in format YYYY-MM-DD.
 *
 * @param {object} dateObj - A Date object.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
function date2IsoDateString(dateObj) {
  let y = dateObj.getFullYear(),
    m = "" + (dateObj.getMonth() + 1),
    d = "" + dateObj.getDate();
  if (m.length < 2) m = "0" + m;
  if (d.length < 2) d = "0" + d;
  return [y, m, d].join("-");
}

/**
 * Fetch data from an API endpoint and show a progress bar while the data is being fetched.
 *
 * @param {string} apiEndpoint - The API endpoint to fetch data from.
 * @param {string} progressBarId - The ID of the progress bar element.
 * @returns {object} The fetched data.
 * @throws Will throw an error if the fetch operation fails.
 */
async function fetchData(apiEndpoint, progressBarId) {
  showProgressBar(progressBarId);
  try {
    const response = await fetch(apiEndpoint);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${apiEndpoint}:`, error);
    hideProgressBar(progressBarId);
    throw error;
  } finally {
    hideProgressBar(progressBarId);
  }
}

function scrollToTop() {
  document.getElementById('scrollUpBtn').addEventListener('click', function () {
    window.scrollTo({top: 0, behavior: 'smooth'});
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// Mon, 08 Feb 2021 00:00:00 GMT > Mon Feb 08 2021
function timestamp2String(timestamp) {
  const date = new Date(timestamp);
  const options = {month: 'short', day: '2-digit', year: 'numeric'};
  return date.toLocaleDateString('en-US', options);
}

function getEnumValue(enumeration, value) {
  for (const key in enumeration) {
    if (enumeration.hasOwnProperty(key)) {
      if (enumeration[key] === value) {
        return key;
      }
    }
  }
  return null; // Value not found in the enum-like object
}

// enumeration of the different types of discourse
export const DiscourseType = {
  MONOLOGIC: 0,
  DIALOGIC: 1,
  IRRELEVANT: 2
}

// function to fill select element with options, using the discourseTypes array
function fillSelectWithDiscourseTypeEl(selectEl, values) {
  // Add default option with no value
  const defaultOptionEl = document.createElement("option");
  defaultOptionEl.setAttribute("value", "");
  defaultOptionEl.textContent = "---";
  selectEl.appendChild(defaultOptionEl);

  for (const value of values) {
    const optionEl = document.createElement("option");
    optionEl.setAttribute("value", value);
    optionEl.textContent = getEnumValue(DiscourseType, value);
    selectEl.appendChild(optionEl);
  }
}

function fillSelectEl(selectEl, objectList, keyName, keyValue) {
  // Clear out any existing options first.
  while (selectEl.firstChild) {
    selectEl.removeChild(selectEl.firstChild);
  }

  // Add a default option at the first position.
  const defaultOption = document.createElement("option");
  defaultOption.text = "Please select...";
  defaultOption.value = "";
  selectEl.add(defaultOption);

  // Iterate over the object list and create an option for each item.
  for (let item of objectList) {
    let option = document.createElement("option");
    option.text = item[keyName];
    option.value = item[keyValue];
    selectEl.add(option);
  }
}

/**
 *
 * @param containerElement // the element to which the widget will be appended
 * @param values // the values of the select widget
 * @param data // the data to be displayed in the select element
 * @param textKey // the key of the data object that will be displayed as text in the select element
 * @param valueKey // the key of the data object that will be used as value in the select element
 */
function multipleSelectionWidget(containerElement, values = [], data, textKey, valueKey) {
  const selectEl = document.createElement("select");
  const btnAdd = document.createElement("button");
  const olEl = document.createElement("ol");

  let addedOptions = values.slice();  // clone initial values to avoid mutation
  containerElement.setAttribute("data-added-options", JSON.stringify(addedOptions));

  btnAdd.textContent = "Add";

  const appendLiEl = (item) => {
    const liEl = document.createElement("li");
    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "X";
    deleteBtn.addEventListener("click", function () {
      liEl.remove();
      const index = addedOptions.indexOf(item[valueKey]);
      if (index > -1) {
        addedOptions.splice(index, 1);
        containerElement.setAttribute("data-added-options", JSON.stringify(addedOptions));
      }
    });

    liEl.append(deleteBtn);
    liEl.append(` ${item[textKey]} (${item[valueKey]})`);
    olEl.appendChild(liEl);
  }

  // initial values
  data.filter(item => addedOptions.includes(item[valueKey])).forEach(appendLiEl);

  fillSelectEl(selectEl, data, textKey, valueKey);
  containerElement.append(selectEl, btnAdd, olEl);

  btnAdd.addEventListener("click", function () {
    const selectedOption = selectEl.options[selectEl.selectedIndex];

    if (selectedOption.value && !addedOptions.includes(selectedOption.value)) {
      const selectedDataItem = data.find(item => item[valueKey] === selectedOption.value);
      addedOptions.push(selectedOption.value);
      containerElement.setAttribute("data-added-options", JSON.stringify(addedOptions));
      appendLiEl(selectedDataItem);
    }
  });
}


/**
 *
 * @param endpoint // the endpoint to which the data will be pushed
 * @param progressBarId // the id of the progress bar to be shown
 * @param data // the data to be pushed
 * @param method // the method to be used for the fetch operation
 * @returns {Promise<void>} // a promise that resolves when the fetch operation is completed
 */
async function pushData(endpoint, progressBarId, data, method) {
  showProgressBar(progressBarId);
  await fetch(endpoint, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(data),
  });
  hideProgressBar(progressBarId);
}

async function getWikidataLabelByQID(qid) {
  const apiUrl = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.entities[qid].labels.en.value;
}

export {
  createCounterWidget, toggleNavigationMenuVisibility, createListFromMap,
  createListFromArray, showProgressBar, hideProgressBar, fillListFromMap,
  createOptionsWithIssuesParents, date2IsoDateString, fetchData,
  fillSelectWithOptions, scrollToTop, formatDate, timestamp2String, getEnumValue, fillSelectWithDiscourseTypeEl,
  fillSelectEl, multipleSelectionWidget, pushData, getWikidataLabelByQID
};
