'use strict'

//variables
const todoInput = document.querySelector('.todo-input');
const addTodoBtn = document.querySelector('.add-todo-btn');
let todoList = document.querySelector('.todo-list')
let todoArray = document.getElementsByTagName('li')
const appBody = document.querySelector('main');
const toggleThemeBtn = document.querySelector('.toggle-theme-btn')
const btns = document.querySelectorAll('.btn button')
let isEditting = false
let editTodoId;
let darkMode = false;
let completed;
let uncompleted;

import {
  setUpDB,
  addDataToDatabase,
  getAndDisplayTodos,
  setIsDark
} from './Db.js';

//eventlisteners
addTodoBtn.addEventListener("click", submitTodo);

toggleThemeBtn.addEventListener("click", toggleTheme);

document.addEventListener("DOMContentLoaded", async () => {
  //check if db exists
  if (db) {

    /*check if db has created an objectstore called checkIsDark,if it has, then run the function called switchTheme*/
    let count = await db.checkIsDark.count((num) => num)
    if (count) {
      db.checkIsDark.get(1, (data) => {
        if (data.isDark) {
          darkMode = true
          setIsDark(db, darkMode)
          switchTheme()
        } else {
          /*if no objectStore called checkIsDark, 
          then create one*/
          darkMode = false
          setIsDark(db, darkMode)
          switchTheme()
        }
      })
    } else {
      setIsDark(db, false)
    }
  } else {
    return;
  }

})

//open indexedDB database
let db = setUpDB()
getAndDisplayTodos(db)
displayTodos()


//submitTodo to database
function submitTodo(e) {
  e.preventDefault()
  if (todoInput.value && db) {
    let todoItem = {
      todo: todoInput.value,
      completed: false,
      id: Date.now()
    }
    if (!isEditting) {
      addDataToDatabase(db.todoList, todoItem)

    } else {
      updateTodo()
      addTodoBtn.innerHTML = `<i class="fa fa-plus"></i>`
      isEditting = false;
    }

    displayTodos()
    todoInput.value = '';
    todoInput.focus()
  } else {
    return
  }
}


//display todos after setting up database and receiving data from database

async function displayTodos() {
  let arr = await getAndDisplayTodos(db)

  if (completed) {
    arr = arr.filter(item => item.completed === true)
  }

  if (uncompleted) {
    arr = arr.filter(item => item.completed === false)
  }

  if (arr.length !== 0) {
    try {
      todoList.innerHTML = ''

      return arr.forEach((item) => {

        let li = createAndAppendElements('li', 'todo', '', '', todoList)

        let todoItemDiv = createAndAppendElements('div', 'todo-item', '', '', li)

        todoItemDiv.setAttribute('id', item.id)

        if (item.completed) {
          todoItemDiv.classList.add('completed')
        }

        let p = createAndAppendElements('p', 'todo-text', item.todo, '', todoItemDiv)

        let btnDiv = createAndAppendElements('div', 'btn', '', '', todoItemDiv)

        let markButton = createAndAppendElements('button', 'mark-complete-btn', '', item.id, btnDiv)
        
        markButton.innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i>`

        markButton.onclick = markTodoAsComplete

        let editButton = createAndAppendElements('button', 'edit-todo-btn', 'E', item.id, btnDiv)

        editButton.innerHTML = `<i class="fa fa-pen-square" aria-hidden="true"></i>`

        editButton.onclick = editTodo

        let delButton = createAndAppendElements('button', 'delete-todo-btn', '', item.id, btnDiv)

        delButton.innerHTML = `<i class="fas fa-trash" aria-hidden="true"></i>`
        
        delButton.onclick = deleteTodo
      })

    } catch (err) {
      console.log(err);
    }

  } else {
    //display message if no todos
    todoList.innerHTML = ` <li> <h4> No Todos yet😱 </br>Create new Todo🙂<h4></li>`
    if (completed) {
      todoList.innerHTML = ` <li> <h4> You've not completed any Todo🥺<h4></li>`
    }
    if (uncompleted) {
      todoList.innerHTML = ` <li> <h4> You have no uncompleted todo😎<h4></li>`
    }

  }

}

//edit todos
function editTodo(e) {
  todoInput.focus()
  isEditting = true;

  addTodoBtn.innerHTML = `<i class="fa fa-check" ></i>`

  editTodoId = parseInt(e.target.dataset.id)
  db.todoList.get(editTodoId, (data) => {
    todoInput.value = data.todo
  })
}

//update todo after editing todo
function updateTodo() {
  db.todoList.update(editTodoId, { todo: todoInput.value });
}

//mark any completed todo
async function markTodoAsComplete(e) {

  let id = parseInt(e.target.dataset.id)
  let completed = await db.todoList.get(id, (data) => {
    return data.completed
  })

  let update = await db.todoList.update(id, { completed: !completed })

  db.todoList.get(id, (data) => {
    let todo = document.getElementById(`${data.id}`)
    if (data.completed) {
      todo.classList.add('completed')
    } else {
      todo.classList.remove('completed')
    }
  })
}

//delete todo 
async function deleteTodo(e) {
  let id = parseInt(e.target.dataset.id)
  let item = document.getElementById(id)
  item.classList.add('deleted')
  item.addEventListener("transitionend", async () => {
    await db.todoList.delete(id)
    displayTodos()
  })

}

//change theme fromight to dark and vice versa
function switchTheme() {

  if (darkMode) {
    appBody.classList.add('dark')
    toggleThemeBtn.innerHTML = `<i class="far fa-moon"></i>`
  } else {
    appBody.classList.remove('dark')
    toggleThemeBtn.innerHTML = `<i class="fas fa-sun"></i>`
  }
}

async function toggleTheme() {

  let value = await db.checkIsDark.get(1, (data) => {
    return data.isDark
  })

  let update = await db.checkIsDark.update(1, { isDark: !value })

  db.checkIsDark.get(1, (data) => {
    if (data.isDark) {
      darkMode = true
      switchTheme()
    } else {
      darkMode = false
      switchTheme()
    }
  })

}

//create new child element and append it in a parent element
function createAndAppendElements(element, classname, text, dataset, parent) {

  let childElement = document.createElement(element)

  childElement.className = classname

  let parentElement = parent.appendChild(childElement)

  if (text) {
    childElement.textContent = text
  }
  if (dataset) {
    childElement.setAttribute(`data-id`, dataset)
  }
  return parentElement
}


//clear database
// window.indexedDB.databases().then((r) => {
//   for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
// }).then(() => {
//   console.log('All data cleared.');
// })


/*this section of code was gotten from w3school on how to create a custom select and options tag*/

var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;


  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);

  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");

  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {

      /* When an item is clicked, update the original select box,
      and the selected item: */
      var y, i, k, s, h, sl, yl;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      sl = s.length;
      h = this.parentNode.previousSibling;
      for (i = 0; i < sl; i++) {
        if (s.options[i].innerHTML == this.innerHTML) {
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          y = this.parentNode.getElementsByClassName("same-as-selected");
          yl = y.length;
          for (k = 0; k < yl; k++) {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }

  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);

    //filter todos according to the selected option 
    switch (e.target.textContent) {
      case "All":
        completed = false;
        uncompleted = false;
        displayTodos()
        break;
      case 'Completed':
        completed = true;
        uncompleted = false;
        displayTodos()
        break;
      case 'Uncompleted':
        completed = false;
        uncompleted = true;
        displayTodos()
        break;
    }

    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }

  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}


/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);


//check for serviceWorker


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}