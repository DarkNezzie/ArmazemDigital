const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const { dashboard, adicionarEquipamento } = require('../controllers/auth');
const { data, postdata,logInsercao,logOperacoes } = require('../controllers/auth');
const router = express.Router();
dotenv.config({path: './.env'})

verifyJWT = (req, res, next) => {
    const accessToken = req.cookies.jwt //grab the token
    if (!accessToken){
        return res.status(403).redirect("/");
    }
    try{
        //use the jwt.verify method to verify the access token
        //throws an error if the token has expired or has a invalid signature
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET)
        next()
    }
    catch(e){
        //if an error occured return request unauthorized error
        return res.status(401).redirect("/");
    }
}

router.get("/", (req, res) => {
    
    res.render("index")
});

router.get("/register", (req, res) => {
    res.render("register")
});
router.get("/login", (req, res) => {
    res.render("login")
});

//router.get("/dashboard",verifyJWT, dashboard, (req, res) => {
router.get("/dashboard",verifyJWT, (req, res) => {
    res.render("dashboard");
});

router.get("/data",data, verifyJWT,(req, res) => {
    res.render("data");
});

router.get("/logInsercao",logInsercao,verifyJWT, (req, res) => {
    res.render("logInsercao");
});

router.get("/logOperacoes",logOperacoes, verifyJWT,(req, res) => {
    res.render("logOperacoes");
});

router.get("/adicionarEquipamento",verifyJWT, (req, res) => {
    res.render("adicionarEquipamento");
});

router.get("/movimentos",verifyJWT, (req, res) => {
    res.render("movimentos");
});

router.post("/postdata", postdata,verifyJWT, (req, res) => {
    res.render(postdata);
});

module.exports = router;