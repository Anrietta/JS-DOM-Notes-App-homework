'use strict';

const body = document.body;
const noteForm = document.querySelector('.note-form')
const [noteTitle, noteContent] = noteForm.querySelectorAll('.input-item');
const addNoteBtn = noteForm.querySelector('.add-note-btn');
const clearNoteBtn = noteForm.querySelector('.clear-note-btn');

const searchForm = document.querySelector('.search-form');
const searchInput = searchForm.querySelector('.search-item');
const searchBtn = searchForm.querySelector('.search-btn');
const resetFilterBtn = searchForm.querySelector('.reset-filter-btn');

const notesList = document.querySelector('.notes-list');

// тут візьму живу колекцію, щоб в різних місцях мати актуальні дані і перевірити чи 
//список пустий чи ні (для warnMessage)
const notes = document.getElementsByClassName('list-item');

// при завантаженні сторінки перевіряю якщо список нонаток пустий вивожу warnMessage
// тепер де його ще перевірити щоб він видалив повідомлення коли додали нотатку?
// ПІД ЧАС ДОДАВАННЯ!!!!
// Ще треба перевірити коли видаляється останній елемент!!
checkNotesAvailabilityWarnMessage('Empty list. No items to display', notesList, createWarnMessage);


// додам обробник щоб активував кнопку add лише тоді коли поля title та content заповнені, 
// інакше хай лишається disabled
noteForm.addEventListener('input', function () {
    if (noteTitle && noteTitle.value.trim() && noteContent && noteContent.value.trim()) {
        addNoteBtn.removeAttribute('disabled');
    }

    // блокую додавання нової нотатки якщо в searchInput є більше ніж 0 символів 
    if (searchInput.value.length !== 0) {
        addNoteBtn.setAttribute('disabled', '');
    }
})

// вішаю обробник на addBtn без додаткової перевірки на помилки бо обробник на noteForm 
// не має допустити ніяких інших значень крім трушних. 
// Якщо addBtn активний то все має бути в порядку. Сподіваюсь)))
addNoteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    
    const listNoteEl = createNoteEl(noteTitle.value.trim(), noteContent.value.trim());
    noteTitle.value = '';
    noteContent.value = '';
    noteTitle.focus();

    notesList.append(listNoteEl);

    // після додавання нотатки знов блокую кнопку інакше дозволяє надодавати пустих нотаток
    addNoteBtn.setAttribute('disabled','');
    // після додавання нової нотатки перевіряю ще раз щоб видалити warnMessage якщо він був
    // бо список вже не буде пустий
    checkNotesAvailabilityWarnMessage('Empty list. No items to display', notesList, createWarnMessage);
})

function createNoteEl(title, content) {
    const notesItemEl = document.createElement('li');
    notesItemEl.classList.add('list-item');

    const noteDeleteBtnEl = document.createElement('button');
    noteDeleteBtnEl.textContent = 'X';
    noteDeleteBtnEl.classList.add('delete-btn');
    noteDeleteBtnEl.addEventListener('click', noteDeleteBtnHandler)

    const noteTitleEl = document.createElement('h2');
    noteTitleEl.textContent = title;
    noteTitleEl.classList.add('note-title');

    const noteContentEl = document.createElement('p');
    noteContentEl.textContent = content;
    noteContentEl.classList.add('note-content');

    notesItemEl.append(noteDeleteBtnEl, noteTitleEl, noteContentEl);

    return notesItemEl;
}

// навішу обробник на reset лише для того щоб повернути фокус першому інпуту
// після скидання, сам reset лишається стандартний на кнопці форми
clearNoteBtn.addEventListener('click', function () {
    noteTitle.focus();
})

function noteDeleteBtnHandler(e) {
    e.target.closest('.list-item').remove();

    // після видалення останньої нотатки перевіряю чи список не пустий щоб додати warnMessage
    if (notes.length === 0) {
        checkNotesAvailabilityWarnMessage('Empty list. No items to display', notesList, createWarnMessage);
    }

    noteTitle.focus();
}

function checkNotesAvailabilityWarnMessage (warnText, parent, executor) {
    const warnMessage = parent.querySelector('.warn-message');

    // debugger;
    if (!notes || notes.length === 0) {
        // якщо список пустий і повідомлення нема в списку то додаю warnMessage
        if (!warnMessage) {
            executor(warnText, parent);
        } 
    } else {
        // якщо список повний і є повідомлення то видаляю warnMessage
        if (warnMessage) {
            warnMessage.remove();
        }
    }
}

function createWarnMessage(warnText, parent) {
    const messagePar = document.createElement('p');
    messagePar.classList.add('warn-message');
    messagePar.textContent = warnText;
    parent.append(messagePar);
}

searchBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (!searchInput.value.trim()) return;

    // debugger;
    if (!notes || notes.length === 0) {
        checkNotesAvailabilityWarnPopup('Empty list. No items to search');
        return;
    };

    // в обробнику на інпут стоїть блокування кнопки add якщо 
    // searchInput не пустий, щоб не давати можливість додавати нову нотатку під час пошуку

    // якщо ми дійшли сюди значить інпут для пошуку не пустий і список нотаток не пустий
    // можна здійснювати пошук

    // перестворюю список щоб актуалізувати його на момент кліку на кнопку
    const notesArr = Array.from(notes);
    
    // спершу скину результати попереднього пошуку якщо ще не натискався reset, бо інакше мій список 
    // залишиться пустим, навіть якщо співпадіння є, воно не покажеться бо має атр hidden
    notesArr.forEach(note => note.removeAttribute('hidden'));

    const matchNodes = notesArr.filter(note => {return note.textContent.toLowerCase().includes(searchInput.value.trim().toLowerCase())});

    // якщо співпадіння по пошуку немає то кинути popup і вийти, без цього при відсутності співпадінь всім нотаткам
    // додається атр hidden і вони зникають :)
    if (matchNodes.length === 0) {
        checkNotesAvailabilityWarnPopup('No match found');
        return;
    };
    // note textContent дає склеєний результат всього текстового контенту дочірніх елементів note
    // так напевно НЕ добре робити в цілому, але для цьої задачі покищо згодиться. Напевно))
    notesArr.forEach(note => {
        if (!note.textContent.toLowerCase().includes(searchInput.value.trim().toLowerCase())) {
            note.setAttribute('hidden','');
        } 
    })

})

resetFilterBtn.addEventListener('click', function () {

    // перестворюю список щоб актуалізувати його на момент кліку на кнопку 
    const notesArr = Array.from(notes);

    notesArr.forEach(note => {
        if (note.hasAttribute('hidden')) {
            note.removeAttribute('hidden');
        } 
    })
    searchInput.value = '';
    noteTitle.focus();
})

function checkNotesAvailabilityWarnPopup(warnText) {

    createWarnPopup(warnText);
    searchBtn.setAttribute('disabled', '');
    const popupContainer = document.querySelector('.popup-container');
    setTimeout(() => {
        popupContainer.remove()
        searchBtn.removeAttribute('disabled');
    }, 2000)

}

// створити попап з повідомленням при натисканні кнопки search коли список пустий 
function createWarnPopup(warnText) {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');

    const popupPar = document.createElement('p');
    popupPar.classList.add('popup-text')
    popupPar.textContent = warnText;

    popupContainer.append(popupPar);
    body.append(popupContainer);

    searchInput.value = '';
    noteTitle.focus();

}