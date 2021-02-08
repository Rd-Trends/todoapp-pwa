'use strict'

let db;
const dbName = 'PWATodoApp';
const dbVersion = 1;
const todoObjectStoreName = 'todoList'
const isDarkObjectStoreName = 'checkIsDark'

//set up indexeddb 
function setUpDB() {
  let db = new Dexie(dbName)
  db.version(dbVersion).stores({
    todoList: `id,todo,completed`,
    checkIsDark: `id,isDark`
  })

  db.open().catch((e) => console.log(e))

  console.log('db open');
  console.log(db);
  return db
}

//add data to indexedDB
async function addDataToDatabase(dbStore, item) {
  await dbStore.put(item)
}

//get all todos from indexedDB 
function getAndDisplayTodos(db, callback) {
  if (db) {
    let all = db.todoList.orderBy('id').reverse().toArray()
    return all
    console.log(all);
  } else {
    console.log('no store');
  }
}

//set the value for isDark
async function setIsDark(db, darkmode) {
  await db.checkIsDark.put({ id: 1, isDark: darkmode })
}

export {
  setUpDB,
  addDataToDatabase,
  getAndDisplayTodos,
  setIsDark
}