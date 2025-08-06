const addNoteBtn = document.getElementById("addNoteBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const shapeSelect = document.getElementById("shapeSelect");
const notesContainer = document.getElementById("notesContainer");

let notes = JSON.parse(localStorage.getItem("notes") || "[]");

const quotes = [
  "Believe in yourself!",
  "Stay focused and never give up.",
  "One step at a time.",
  "You can do it!",
  "Push your limits.",
  "Progress over perfection.",
  "Consistency is key.",
  "Dream big, start small.",
  "Make it happen!",
  "Keep going!"
];

const colors = {
  rectangle: "#fffb8f",
  circle: "#ffd166",
  cloud: "#f8f8f8",
  blob: "#b5ead7"
};

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function createNote(data = {}) {
  const note = document.createElement("div");
  note.classList.add("note", data.shape || "rectangle");
  note.style.left = data.left || `${Math.random() * 100 + 20}px`;
  note.style.top = data.top || `${Math.random() * 100 + 20}px`;
  note.style.background = data.color || colors[data.shape || "rectangle"];
  note.style.zIndex = data.zIndex || notes.length;
  note.dataset.id = data.id || Date.now();

  // Add slight rotation for natural look
  const rotation = data.rotation || Math.floor(Math.random() * 6) - 3;
  note.style.transform = `rotate(${rotation}deg)`;

  const quote = document.createElement("div");
  quote.classList.add("quote");
  quote.textContent = getRandomQuote();

  const controls = document.createElement("div");
  controls.classList.add("controlButtons");

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️ Edit";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 Save";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️ Del";

  controls.appendChild(editBtn);
  controls.appendChild(saveBtn);
  controls.appendChild(deleteBtn);

  const textarea = document.createElement("textarea");
  textarea.value = data.text || "";
  textarea.disabled = true;
  textarea.placeholder = "Write your note here...";

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = data.color || colors[data.shape || "rectangle"];
  colorPicker.classList.add("colorPicker");

  note.appendChild(quote);
  note.appendChild(controls);
  note.appendChild(textarea);
  note.appendChild(colorPicker);
  notesContainer.appendChild(note);

  // Edit note
  editBtn.onclick = () => {
    textarea.disabled = false;
    textarea.focus();
    note.style.transform = `rotate(0deg)`;
    note.style.zIndex = 1000;
  };

  saveBtn.onclick = () => {
    textarea.disabled = true;
    data.text = textarea.value;
    note.style.zIndex = notes.length;
    saveNotes();
  };

  deleteBtn.onclick = () => {
    note.style.animation = "noteAppear 0.3s ease reverse";
    setTimeout(() => {
      notesContainer.removeChild(note);
      notes = notes.filter(n => n.id != note.dataset.id);
      saveNotes();
    }, 300);
  };

  colorPicker.oninput = (e) => {
    note.style.background = e.target.value;
    data.color = e.target.value;
    saveNotes();
  };

  // Drag functionality
  note.addEventListener("mousedown", (e) => {
    if (["TEXTAREA", "BUTTON", "INPUT"].includes(e.target.tagName)) return;

    note.style.zIndex = 1000;
    note.style.transform = `rotate(0deg)`;
    note.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";

    let shiftX = e.clientX - note.getBoundingClientRect().left;
    let shiftY = e.clientY - note.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      let newLeft = pageX - shiftX;
      let newTop = pageY - shiftY;
      note.style.left = newLeft + 'px';
      note.style.top = newTop + 'px';
      data.left = note.style.left;
      data.top = note.style.top;
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      note.style.zIndex = notes.length;
      note.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      note.style.transform = `rotate(${rotation}deg)`;
      saveNotes();
    }

    document.addEventListener('mouseup', onMouseUp);
  });

  // Bring to front when clicked
  note.addEventListener("click", () => {
    note.style.zIndex = notes.length;
  });
}

addNoteBtn.onclick = () => {
  const selectedShape = shapeSelect.value;
  const newNote = {
    id: Date.now(),
    text: "",
    color: colors[selectedShape],
    left: `${Math.random() * 100 + 20}px`,
    top: `${Math.random() * 100 + 20}px`,
    shape: selectedShape,
    rotation: Math.floor(Math.random() * 6) - 3
  };
  notes.push(newNote);
  createNote(newNote);
  saveNotes();
};

clearAllBtn.onclick = () => {
  if (confirm("Are you sure you want to delete all notes?")) {
    const notesElements = document.querySelectorAll('.note');
    notesElements.forEach(note => {
      note.style.animation = "noteAppear 0.3s ease reverse";
    });
    
    setTimeout(() => {
      localStorage.clear();
      notes = [];
      notesContainer.innerHTML = "";
    }, 300);
  }
};

// Load notes
notes.forEach(note => createNote(note));

// Add some initial notes if empty
if (notes.length === 0) {
  setTimeout(() => {
    addNoteBtn.click();
    addNoteBtn.click();
  }, 300);
}