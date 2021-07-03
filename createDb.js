const sqlite3 = require('sqlite3');
const fs = require('fs').promises;

async function jsonProjects() {
  try {
    return JSON.parse(await fs.readFile('projects.json', 'utf8'));
  } catch (error) {
    console.error(error);
  }
}

let db = new sqlite3.Database("projects.db", (err) => { 
  if (err) { 
    console.log('Error when creating the database', err) 
  } else { 
    console.log('Database created!') 
  } 
});

let table = await db.run(
  "CREATE TABLE tattoos(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, x REAL, y REAL, project TEXT)"
);

Object.keys(await jsonProjects()).forEach(proj => {
  Object.keys(proj.works).forEach(work => {

  })
});
