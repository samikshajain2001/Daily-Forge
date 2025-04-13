const openNotePopup = document.getElementById("openNotePopup");
const closeModal = document.getElementById("closeModal");
const noteModal = document.getElementById("noteModal");
const saveNoteBtn = document.getElementById("saveNote");
const noteTitleInput = document.getElementById("noteTitle");
const noteContentInput = document.getElementById("noteContent");
const noteList = document.getElementById("noteList");
const warningLabel = document.getElementById("warning");
const openSearch = document.getElementById("openSearch");
const searchPopup = document.getElementById("searchPopup");
const searchInput = document.getElementById("searchInput");



let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editingNoteId = null;



function editFun(note){
    editingNoteId = note.id;

    noteModal.classList.remove("hidden");
    warningLabel.classList.add("hidden");

    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteTitleInput.focus();
};

function deleteFun(note, noteDiv){
    const noteId = note.id;
    noteDiv.remove();
    notes = notes.filter(n => n.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(notes));
};

function addNoteToUI(note) {
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("notes");
    noteDiv.setAttribute("data-id", note.id); 

    const contenteDiv = document.createElement("div");
    contenteDiv.classList.add("note-content");

    const titleLabel = document.createElement("label");
    titleLabel.classList.add("tittle");
    titleLabel.textContent = note.title;

    const contentLabel = document.createElement("label");
    contentLabel.classList.add("content");
    contentLabel.textContent = note.content;

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("change-button");

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash");

    deleteIcon.addEventListener("click", () => deleteFun(note, noteDiv) );

    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-pen-to-square");

    editIcon.addEventListener("click", () => editFun(note) );

    contenteDiv.appendChild(titleLabel);
    contenteDiv.appendChild(contentLabel);

    buttonDiv.appendChild(deleteIcon);
    buttonDiv.appendChild(editIcon);

    noteDiv.appendChild(contenteDiv);
    noteDiv.appendChild(buttonDiv);

    noteList.appendChild(noteDiv);

}

saveNoteBtn.addEventListener("click", () => {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if(title === ""){
        warningLabel.style.fontSize = "12px" ;
        warningLabel.style.color = "red" ;
        warningLabel.classList.remove("hidden");
        return ;
    }

    if(editingNoteId){
        notes = notes.map(n => {
            if(n.id === editingNoteId){
                return {...n, title, content};
            }
            return n;
        });
        localStorage.setItem("notes", JSON.stringify(notes));
        noteList.innerHTML = "";
        notes.forEach(note => addNoteToUI(note));
        editingNoteId = null;
    }
    else{
        const note = {
            id: Date.now(),
            title,
            content
        };
    
        notes.push(note);
        localStorage.setItem("notes", JSON.stringify(notes));
        addNoteToUI(note);
    }

    noteTitleInput.value = "";
    noteContentInput.value = "";
    noteModal.classList.add("hidden");

})

closeModal.addEventListener("click", () => {
    noteModal.classList.add("hidden");
    noteTitleInput.value = "";
    noteContentInput.value = "";
    editingNoteId = null;
});

openNotePopup.addEventListener("click", () => {
    editingNoteId = null;
    noteModal.classList.remove("hidden");
    warningLabel.classList.add("hidden");
    noteTitleInput.focus();
});

openSearch.addEventListener("click", (event) => {
    searchPopup.classList.toggle("hidden");
    searchInput.focus();
});

document.addEventListener("click", function (event) {
    const isClickInsidePopup = searchPopup.contains(event.target);
    const isClickOnIcon = openSearch.contains(event.target);
    if (!isClickInsidePopup && !isClickOnIcon) {
        searchPopup.classList.add("hidden");
    }
});

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    filterNotes(query);
});

function filterNotes(query) {
    noteList.innerHTML = "";

    const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query)
    );

    filtered.forEach(note => addNoteToUI(note));
}


window.addEventListener("load", () => {

    notes.forEach(note => {
        addNoteToUI(note);
    });

    const savedTheme = localStorage.getItem("theme") || "light-mode";
    document.body.classList.add(savedTheme);
});