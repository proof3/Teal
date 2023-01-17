import {
  fileOpen,
  directoryOpen,
  fileSave,
  supported,
} from 'https://unpkg.com/browser-fs-access';

export let files;
export let files_names = ['/teals/golem.teal.json', '/teals/emberux.teal.json'];
export let has_directory = false;
export let node_count = 0;
let script = {};

function addNode(prompt, currentNode, parentNode, isNew) {
    const children = document.getElementById("teal-createop").childNodes;
    var inputs = [];

    children.forEach(child => {
      if (child.tagName == 'INPUT') {
        inputs.push({"option": child.value, "node_id" : child.id});
      }
    });

    const stringNum = currentNode.toString();
    let nodevalue = {
      "prompt" : prompt.value,
      "options" : inputs,
      "parent" : parentNode
    };

    script[stringNum] = nodevalue;

    if (!isNew) {
      if (script[currentNode]["parent"] != null) 
        console.log(currentNode, parentNode);
        createMap(parentNode, script[parentNode.toString()]["parent"], isNew);
    }
    else createMap(this, currentNode, isNew);
  }


  function createMap(currentNode, parentNode, isNew) {

    document.getElementById("teal-prompt").innerHTML = "";
    document.getElementById("teal-options").innerHTML = "";

    const gamePrompt = document.createElement("input");
    const submitButton = document.createElement("button");
    const optionDiv = document.createElement("div");
    const divChild = document.createElement("div");
    optionDiv.id = "teal-createop";
    divChild.innerHTML = "Cick to add options for prompt";
    optionDiv.appendChild(divChild);
    submitButton.innerHTML = "Submit";
    gamePrompt.type = "text";
    gamePrompt.placeholder = "Type prompt here...";

    if (!isNew) {
      //fill prompt
      gamePrompt.value = script[currentNode.toString()]["prompt"];
      script[currentNode.toString()]["options"].forEach(child => { 
        const input = document.createElement("input");
        input.value = child["option"];
        input.id = child["node_id"];
        const buttonOne = document.createElement("button");
        
        buttonOne.innerHTML = 'Add story path for option';
        optionDiv.appendChild(input);
        if (child["node_id"] in script) buttonOne.addEventListener("click", createMap.bind(null, parseInt(child["node_id"]), currentNode, false));
        optionDiv.appendChild(buttonOne);
      });
    }
    

    divChild.addEventListener("click", () => {
      node_count++;
      const input = document.createElement("input");
      const buttonOne = document.createElement("button");
      const optionNumber = node_count;

      input.id = node_count.toString();
      buttonOne.innerHTML = 'Add story path for option';
      optionDiv.appendChild(input);


      buttonOne.addEventListener("click", addNode.bind(optionNumber, gamePrompt, currentNode, parentNode, true));
      optionDiv.appendChild(buttonOne);
    });

    submitButton.addEventListener("click", () => {
      if (parentNode != null) {
        addNode(gamePrompt, currentNode, parentNode, false);
      }
      else {
        if (has_directory);
        else {
          alert("please choose a game directory");
          openGameDirectory();
        }
      }
    });

    document.getElementById("teal-options").appendChild(gamePrompt);
    document.getElementById("teal-options").appendChild(optionDiv);
    document.getElementById("teal-options").appendChild(submitButton);
  }

  function createGameFile(gameName, file_names) {
    for (var i in file_names) {
      if (file_names[i] == gameName.value + ".teal.json") {
        document.getElementById("teal-prompt").innerHTML = "The File already exists";
        document.getElementById("teal-options").innerHTML = "";
        const goBack = document.createElement("div")
        goBack.innerHTML = "Go back home";
        document.getElementById("teal-options").appendChild(goBack);
        goBack.addEventListener("click", buildMenu);
      }
    }

    node_count++;
    createMap( 1, null, true);
  }

  export function buildGame(file_names) {
    document.getElementById("teal-prompt").innerHTML = "What is your teals name";
    document.getElementById("teal-options").innerHTML = "";

    const gameName = document.createElement("input");
    const submitButton = document.createElement("button");

    submitButton.innerHTML = "Submit";
    gameName.type = "text";
    gameName.placeholder = "Type name here...";

    document.getElementById("teal-options").appendChild(gameName);
    document.getElementById("teal-options").appendChild(submitButton);

    submitButton.addEventListener("click", createGameFile.bind(null, gameName, file_names));
  }

  async function openGameDirectory() {
    if (has_directory) {
      alert('You will only be able to see TEALS of the directory you rechoose');
    }
    
    const options = {
          // Set to `true` to recursively open files in all subdirectories,
          // defaults to `false`.
          //recursive: true,
          // Suggested directory in which the file picker opens. A well-known directory, or a file or directory handle.
          //startIn: 'downloads',
          // By specifying an ID, the user agent can remember different directories for different IDs.
          id: 'teals',
          multiple: true,
          // Callback to determine whether a directory should be entered, return `true` to skip.
          skipDirectory: (entry) => entry.name[0] === '.',

        };

        files = await directoryOpen(options);
        console.log(files);
        let reader = new FileReader();

        for (let index in files) {
          const file = files[index];
          file_names.push(file.name);
          if (file.name ==  'golem.teal.json' || file.name ==  'emberux.teal.json') {
            alert("You cannot have a file called golem.teal.json or emberux.teal.json");
          }
          const newDiv = document.createElement("div");
          newDiv.innerHTML = "Play " + file.name.split(".")[0];
          reader.readAsText(file);

          reader.onload = function() {
            console.log(reader.result);
          };

          reader.onerror = function() {
            console.log(reader.error);
          };
          newDiv.addEventListener('click', startTeal.bind(JSON.parse(await files[index].get() ) ));

       }
  }