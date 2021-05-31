const express = require("express"); 
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require('path');
const cookieParser = require('cookie-parser');



dotenv.config({path: './.env'}) //ficheiro que guarda os dados sensiveis

const app = express();

const db = mysql.createConnection({ //ip do servidor
    host: process.env.DATABASE_HOST,   
    user: process.env.DATABASE_USER,   
    password: process.env.DATABASE_PASSWORD,   
    database: process.env.DATABASE
});


const publicDirectory = path.join(__dirname,'./public') //css ou javascript folder
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended:false}));
//Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs'); //template
 
db.connect((error)=> { //Verifica se a BD está conetada
    if(error){
        console.log(error)
    }else{
        console.log("MYSQL Connected...")
    }
})


//Definir as rotas
app.use('/', require('./rotas/paginas'));
app.use('/auth', require('./rotas/auth'));

app.listen(5000, () => {
    console.log("Server Sarted on Port 5000");
})