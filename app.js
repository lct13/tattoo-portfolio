/**
 * Name: Linh-Chi Tran
 * Date: 
 * Section: CSE154 AE
 * 
 
 */

 "use strict";

 const EDIT_PASSWORD = "bananas";
 const fs = require('fs').promises;
 const express = require('express');
 const app = express();
 const sqlite3 = require('sqlite3');
 const sqlite = require('sqlite');
 const multer = require('multer');
 app.use(express.urlencoded({extended: true}));
 app.use(express.json());
 app.use(multer().none());
 
 app.get("/all", async function(req, res) {
   try {
     let str = "";
     Object.keys(await getProjects()).forEach(key => {
       str += key + " ";
     });
     res.type('text');
     res.send(str.trim());
   } catch (error) {
     console.error(error);
   }
 })
 
 app.post("/edit", async function(req, res) {
   if (req.body.password === EDIT_PASSWORD) {
    res.json(await getNewImages());
   } else {
     res.status(400);
     res.end();
   }
 })
 
 async function getNewImages() {
   try {
     let json = {};
     let folders = await fs.readdir('public/img/tattoos');
     for (let i = 0; i < folders.length; i++) {
       let folder = folders[i];
       let allImgs = await fs.readdir('public/img/tattoos/' + folder);
       let jsonImgs = Object.keys((await getProjects())[folder].works);
       for (let j = 0; j < allImgs.length; j++) {
         let img = allImgs[j];
         img = img.split('.')[0];
         if (!jsonImgs.includes(img)) {
           if (!Object.keys(json).includes(folder)) {
             json[folder] = [];
           }
           json[folder].push(img);
         }
       }
     }
     return json;
   } catch (error) {
     console.error(error);
   }
 }

 app.post("/addtattoo", function(req, res) {
   console.log(req.body.xy);
 });

 async function getProjects() {
   try {
     return JSON.parse(await fs.readFile('projects.json', 'utf8'));
   } catch (error) {
     console.error(error);
   }
 }
 
 app.get("/project/:project", async function(req, res) {
   let projects = await getProjects();
   res.json(projects[req.params.project]);
 });
 
 app.use(express.static("public"));
 const PORT = process.env.PORT || 8080;
 app.listen(PORT, () => console.log(PORT));