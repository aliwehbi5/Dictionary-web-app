const toggle = document.querySelector(".toggle");
const fontChanger = document.querySelector("span.family");
const fontSpan = fontChanger.querySelector("span");
const fontsList = document.querySelector(".font-family ul");
const fonts = fontsList.querySelectorAll("li");
const input = document.querySelector(".search-input");
const searchIcon = document.querySelector(".fa-search");

toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark-mode");
  if (document.documentElement.className == "dark-mode") {
    let mode = localStorage.setItem("mode", document.documentElement.className);
  } else {
    mode = localStorage.setItem("mode", "");
  }
});

fontChanger.addEventListener("click", () => {
  fontsList.classList.toggle("shown");
  fontChanger.classList.toggle("clicked");
});

fonts.forEach((font) => {
  font.addEventListener("click", () => {
    fontSpan.textContent = font.textContent;
    fonts.forEach((font) => {
      font.classList.remove("chosen");
    });
    document.body.className = "";
    document.body.classList.add(font.className);
    localStorage.setItem(
      "font",
      JSON.stringify({
        textContent: font.textContent,
        className: font.className,
      })
    );
    font.classList.add("chosen");
  });
});

if (localStorage.getItem("font")) {
  let storedFont = JSON.parse(localStorage.getItem("font"));
  fontSpan.textContent = storedFont.textContent;
  document.querySelector(`.${storedFont.className}`).classList.add("chosen");
  document.body.classList.add(storedFont.className);
}

if (localStorage.getItem("mode")) {
  document.documentElement.classList.add(localStorage.getItem("mode"));
}

searchIcon.addEventListener("click", () => {
  search(input.value);
});

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();
    search(input.value);
  }
});

function search(word) {
  input.value = "";
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.length > 0) {
        document.querySelector("section").remove();
        let wordMeaning = document.createElement("section");
        wordMeaning.className = "word-meaning";
        let head = document.createElement("div");
        head.className = "head";
        let row = document.createElement("div");
        row.className = "row";
        let wordH1 = document.createElement("h1");
        wordH1.className = "word";
        let spell = document.createElement("span");
        spell.className = "spell";
        let play = document.createElement("div");
        play.className = "play";
        let playSpan = document.createElement("span");
        row.appendChild(wordH1);
        row.appendChild(spell);
        head.appendChild(row);
        play.appendChild(playSpan);
        head.appendChild(play);
        wordMeaning.appendChild(head);
        const entry = data[0];
        const word = entry.word;
        wordH1.textContent = word;
        const phonetics = entry.phonetics;
        if (phonetics && phonetics.length > 0) {
          for (let i = 0; i < phonetics.length; i++) {
            if (phonetics[i].text !== undefined) {
              const phoneticText = phonetics[i].text;
              spell.textContent = phoneticText;
            }
          }
        }
        const meanings = entry.meanings;
        if (meanings && meanings.length > 0) {
          meanings.forEach((meaning) => {
            const partOfSpeech = meaning.partOfSpeech;
            let mainDiv = document.createElement("div");
            mainDiv.className = partOfSpeech;
            let headChild = document.createElement("div");
            headChild.className = "head";
            let h1 = document.createElement("h1");
            h1.textContent = partOfSpeech;
            let lineSpan = document.createElement("span");
            lineSpan.className = "line";
            let p = document.createElement("p");
            p.className = "gray";
            p.textContent = "Meaning";
            let definitionsUl = document.createElement("ul");
            definitionsUl.className = "definition";
            const definitions = meaning.definitions;
            if (definitions && definitions.length > 0) {
              for (let i = 0; i < definitions.length; i++) {
                let li = document.createElement("li");
                const definitionText = definitions[i].definition;
                const example = definitions[i].example;
                if (example !== undefined) {
                  li.innerHTML = `${definitionText} <p class="gray">${example}</p> `;
                } else {
                  li.innerHTML = `${definitionText}`;
                }
                definitionsUl.appendChild(li);
              }
              wordMeaning.appendChild(mainDiv);
              headChild.appendChild(h1);
              headChild.appendChild(lineSpan);
              mainDiv.appendChild(headChild);
              mainDiv.appendChild(p);
              mainDiv.appendChild(definitionsUl);
              wordMeaning.appendChild(mainDiv);
            }
            document.querySelector("main").appendChild(wordMeaning);
            if (phonetics && phonetics.length > 0) {
              let audio;
              for (let i = 0; i < phonetics.length; i++) {
                if (phonetics[i].audio) {
                  audio = new Audio(data[0].phonetics[i].audio);
                }
              }
              play.addEventListener("click", () => {
                if (audio !== undefined) {
                  audio.play();
                }
              });
            }
            const antonym = meaning.antonyms;
            const synonym = meaning.synonyms;
            if (antonym && antonym.length > 0) {
              let antonymDiv = document.createElement("div");
              antonymDiv.className = "antonym";
              let p = document.createElement("p");
              p.className = "gray";
              p.textContent = "Antonyms";
              antonymDiv.appendChild(p);
              for (let i = 0; i < antonym.length; i++) {
                let link = document.createElement("span");
                link.className = "link";
                if (i !== antonym.length - 1) {
                  link.textContent = `${antonym[i]},`;
                } else {
                  link.textContent = antonym[i];
                }
                antonymDiv.appendChild(link);
              }
              document
                .querySelector(`.${partOfSpeech}`)
                .appendChild(antonymDiv);
            }
            if (synonym && synonym.length > 0) {
              let synonymDiv = document.createElement("div");
              synonymDiv.className = "synonym";
              let p = document.createElement("p");
              p.className = "gray";
              p.textContent = "Synonyms";
              synonymDiv.appendChild(p);
              for (let i = 0; i < synonym.length; i++) {
                let link = document.createElement("span");
                link.className = "link";
                if (i !== antonym.length - 1) {
                  link.textContent = `${synonym[i]},`;
                } else {
                  link.textContent = synonym[i];
                }
                synonymDiv.appendChild(link);
              }
              document
                .querySelector(`.${partOfSpeech}`)
                .appendChild(synonymDiv);
            }
          });
        }
        const links = document.querySelectorAll(".link");
        links.forEach((link) => {
          link.addEventListener("click", () => {
            search(link.textContent.replace(",", ""));
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      errorSection();
    });
}

function errorSection() {
  document.querySelector("section").remove();
  let errorSection = document.createElement("section");
  errorSection.className = "error";
  let i = document.createElement("i");
  i.classList.add("fa-solid");
  i.classList.add("fa-face-sad-tear");
  let h1 = document.createElement("h1");
  h1.textContent = "No Definitions Found";
  let p = document.createElement("p");
  p.textContent =
    "Sorry pal, we couldn't find definitions for the word you were looking for.You can try the search again at later time or head to the web instead.";
  errorSection.appendChild(i);
  errorSection.appendChild(h1);
  errorSection.appendChild(p);
  document.querySelector("main").appendChild(errorSection);
}
