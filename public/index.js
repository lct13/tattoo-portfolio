/**
 * Name: Linh-Chi Tran
 * Date: 5/19/2021
 * Section: CSE154 AE
 * This is the js file to fetch data from the server and show my tattoo projects
 * as well as individual pieces on my portfolio website.
 * It implement bubbles that the user can interact with, in order to see the tattoo works
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * fetch the names for all projects to add their thumbnails to the page
   */
  function init() {
    fetch("/all")
      .then(statusCheck)
      .then(res => res.text())
      .then(loadThumbnails)
      .catch(handleError);
  }

  /**
   * create a container with a thumbnail image for each project found in data,
   * and show its works when the thumbnsil is hovered over
   * @param {string} data - names of projects, separated by a whitspace
   */
  function loadThumbnails(data) {
    data.split(" ").forEach(project => {
      let container = gen("section");
      let thumbnail = gen("img");
      let works = gen("div");
      works.id = project;
      thumbnail.src = "img/thumbnails/" + project + ".png";
      container.appendChild(thumbnail);
      container.appendChild(works);
      container.classList.add("flash");
      qs("#main").appendChild(container);
      works.addEventListener("mouseenter", fetchProject);
      works.addEventListener("mouseleave", () => {
        works.innerHTML = "";
      });
    });
    qs("#edit button").addEventListener("click", () => {
      qs("#edit form").classList.remove("hide");
      qs("form button").addEventListener("click", function(e) {
        e.preventDefault();
        switchToEdit();
      })
    });
  }

  function switchToEdit() {
    let params = new FormData();
    params.append("password", qs("#edit input").value);
    fetch("/edit", { method : "POST", body : params })
      .then(statusCheck)
      .then(res => res.json())
      .then(editView)
      .catch(handleError);  
  }

function editView(data) {
  console.log(data);
  Object.keys(data).forEach(project => {
    let container = gen("section");
    let msg = gen("p");
    msg.textContent = "select a tattoo and click on the flash to add coordinates for:"
    container.appendChild(msg);
    container.classList.add("edit-project");
    qs("#" + project).insertAdjacentElement("afterend", container);
    data[project].forEach(tattoo => {
      let btn = gen("button");
      btn.textContent = tattoo;
      let submit = gen("button");
      submit.textContent = "submit";
      submit.disabled = true;
      container.appendChild(btn);
      container.appendChild(submit);
      btn.addEventListener("click", () => {
        getCoordinates(btn, project);
      });
    })
  })
}

function getCoordinates(btn, project) {
  btn.classList.add("selected");
  let tattoo = btn.textContent;
  let submit = btn.nextElementSibling;
  let clicked = false;
  let x;
  let y;
  let r;
  qs("#" + project).addEventListener("click", (e)=>{
    if (clicked) {
      qsa('.bubble')[qsa('.bubble').length - 1].remove();
    }
    clicked = true;
    let rect = e.target.getBoundingClientRect();
    x = Math.round(e.clientX - rect.left); //x position within the element.
    y = Math.round(e.clientY - rect.top);  //y position within the element.
    r = 16 / qs(".flash").offsetWidth;
    makeBubble(project, tattoo, x + "px", y + "px");
    submit.disabled = false;
  });
  submit.addEventListener("click", () => {
    submit.disabled = true;
    btn.remove();
    submit.remove();
    submitCoordinates(project, tattoo, r * x, r * y);
  });
}

function submitCoordinates(project, tattoo, x, y) {
  let params = new FormData();
  console.log(x + " " + y);
  params.append("project", project);
  params.append("tattoo", tattoo);
  params.append("xy", [x, y]);
  fetch("/addtattoo", { method : "POST", body : params })
    .then(statusCheck)
    .catch(handleError);  
}

  /**
   * fetch the image file names for the project it's called on
   */
  function fetchProject() {
    let name = this.id;
    fetch("/project/" + name)
      .then(statusCheck)
      .then(res => res.json())
      .then(data => loadProject(data, name))
      .catch(handleError);
  }

  /**
   * Adds the images and their corresponding interactive bubbles to the project container
   * and waits for mouse hover to show each i"mage
   * @param {object} data - json object with data about tattoo works
   * @param {string} project - project name
   */
  function loadProject(data, project) {
    const tattoos = data.works;
    const imgFactor = 100 / 16;
    Object.keys(tattoos).forEach(key => {
      let x = tattoos[key][0] * imgFactor + "%";
      let y = tattoos[key][1] * imgFactor + "%";
      makeBubble(project, key, x, y);
    });
  }

  function makeBubble(project, key, x, y) {
    let tatImg = gen("img");
    tatImg.src = "img/tattoos/" + project + "/" + key + ".jpeg";
    tatImg.alt = key;
    tatImg.className = "hide";
    qs("#" + project).appendChild(tatImg);

    let bubble = gen("span");
    bubble.className = "bubble";
    bubble.style.left = x;
    bubble.style.top = y;
    qs("#" + project).appendChild(bubble);

    bubble.addEventListener("mouseover", fadeIn);
    bubble.addEventListener("mouseleave", function() {
      this.previousSibling.classList.remove("show");
      this.previousSibling.style.opacity = 0;
    });
  }

  /**
   * Animate a fading emergence of the given object
   * @param {object} img - DOM object to be animated
   */
  function fadeIn() {
    let img = this.previousSibling;
    img.classList.add("show");
    let lightning = 5;
    let opacity = 0;

    let timerID = setInterval(function() {
      if (opacity > 1) {
        clearInterval(timerID);
        img.style.boxShadow = "0 0 5px mediumslateblue";
      } else {
        opacity += 0.1;
        img.style.opacity = opacity;

        lightning += 3;
        img.style.boxShadow = "0 0 " + lightning + "px mediumslateblue";
      }
    }, 20);
  }

  /**
   * let the user know there is an error fetching from the server
   * @param {object} err - error object
   */
  function handleError(err) {
    qs("#main").innerHTML = "";
    qs("#main").textContent = "Something went wrong on our end. Please reload after a bit.";
    throw err;
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * source: CSE154 UW
   */

  /**
   * throws error if the json object is not successful, otherwise returns it
   * @param {object} res - fetched json object
   * @returns {object} - the same json object
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();