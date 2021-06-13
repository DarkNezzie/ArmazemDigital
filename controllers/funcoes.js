const mysql = require("mysql");
//função de procura por id_tecnico
const db = mysql.createConnection({ //ip do servidor
    host: process.env.DATABASE_HOST,   
    user: process.env.DATABASE_USER,   
    password: process.env.DATABASE_PASSWORD,   
    database: process.env.DATABASE
});

function tecnicoSearch(rfid_id){
    return new Promise((resolve, reject) => {
        db.query('SELECT n_Colaborador FROM Tecnicos WHERE rfid_id = ?', rfid_id, function(err, result) {
            if (err) {
                console.log(err);

                return reject(err);
            }
            //console.log(result);
            var verifica = ifExists(result);
            //console.log(verifica);
            if(verifica == false){
                return resolve(false);
            }
                resolve(result)
        })
    })
}

function equipamentoMultiple(rfid_eq ,sap_eq,nSerie,denominacao,estadodevida){
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Equipamento WHERE (? IS NULL OR eq_id = ?) AND (? IS NULL  OR sap = ?) AND (? IS NULL OR denominacao = ?) AND (? IS NULL OR estado_Vida = ?) AND (? IS NULL OR n_Serie = ?)', [rfid_eq,rfid_eq,sap_eq,sap_eq,denominacao,denominacao,estadodevida,estadodevida,nSerie,nSerie], function(err, result) {
            if (err) {
                console.log(err);

                return reject(err);
            }
            //console.log(result);
            //verifica se o resultado é vazio
            //var verifica = ifExists(result);

            //if(verifica == false){
                
                //return resolve(false);
            //}
            resolve(result)
        })
    })
}

function equipamentoSearch(eq_id){
    return new Promise((resolve, reject) => {
        db.query('SELECT eq_id FROM Equipamento WHERE eq_id = ?', eq_id, function(err, result) {
            if (err) {
                console.log(err);

                return reject(err);
            }
            
            //verifica se o resultado é vazio
            var verifica = ifExists(result);

            if(verifica == false){
                
                return resolve(false);
            }
            resolve(verifica)
        })
    })
}

function equipamentoSearchSAP(sap){
    return new Promise((resolve, reject) => {
        db.query('SELECT sap FROM Equipamento WHERE sap = ?', sap, function(err, result) {
            if (err) {
                console.log(err);

                return reject(err);
            }
            
            //verifica se o resultado é vazio
            var verifica = ifExists(result);

            if(verifica == false){
                
                return resolve(false);
            }
            resolve(verifica)
        })
    })
}

function inserirLog(eq_id,estadoVida,resultadoTecnico,id_local,data,id_Sensor){
    db.query('INSERT INTO LogOperacoes (eq_id, estado_Vida, n_Colaborador, id_local, date, id_Sensor) VALUES (?,?,?,?,?,?)',[eq_id,estadoVida,resultadoTecnico,id_local,data,id_Sensor], (error, results)=>{
       
        if(error){
            console.log(error);
        }        

    }); 
    console.log('Log Inserido');
}

function inserirLogInsercao(eq_id,sap,data){
    db.query('INSERT INTO LogInsercao (eq_id, sap, date) VALUES (?,?,?)',[eq_id,sap,data,], (error, results)=>{
       
        if(error){
            console.log(error);
        }        

    }); 
    console.log('Log Inserido');
}


function estadoVida(eq_id){
    return new Promise((resolve, reject) => {
        db.query('SELECT estado_Vida FROM Equipamento WHERE eq_id = ?', eq_id, function(err, result) {
            if (err) {
                console.log(err);
                return reject(err);
            }
                
                resolve(result)
        })
    })
}

function updateEVEquipamento(value,eq_id){
    return new Promise((resolve, reject) => {
        db.query('UPDATE Equipamento SET estado_Vida = ? WHERE eq_id = ?', [value,eq_id], function(err, result) {
            if (err) {
                console.log(err);
                return reject(err);
            }
                console.log("Estado de vida do equipamento: " + eq_id + " mudado para "+ value);
                resolve(result)
        })
    })
    
}

function updateLocalEquipamento(id_local,eq_id){
    return new Promise((resolve, reject) => {
        db.query('UPDATE Equipamento SET id_local = ? WHERE eq_id = ?', [id_local,eq_id], function(err, result) {
            if (err) {
                console.log(err);
                return reject(err);
            }
                console.log("Local do equipamento: " + eq_id + " mudado para "+ id_local);
                resolve(result)
        })
    })
}

function ifExists(result){
    if (result.length === 0){ 
        //O array da procura é vazio, não existem resultados
        return false;
    }
    return true;
}

function getDate(){
    var d = new Date();    
    var day = d.getUTCDate();
    var month = d.getUTCMonth() + 1; // Since getUTCMonth() returns month from 0-11 not 1-12
    var year = d.getUTCFullYear();
    
    var dateStr = year + "-" + month + "-" + day;
    return dateStr;
}

function sapSearch(sap){
    return new Promise((resolve, reject) => {
        db.query('SELECT n_serie,material,denominacao,equipamento,classe,sub_classe FROM listagem WHERE material = ?', sap, function(err, result) {
            if (err) {
                console.log(err);

                return reject(err);
            }
            //console.log(result);
            var verifica = ifExists(result);
            //console.log(verifica);
            if(verifica == false){
                return resolve(false);
            }
                resolve(result)
        })
    })
}

function inserirEquipamento(rfid_id,sap,denominacao,classe,sub_classe,estado_Vida,n_serie,id_local){
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Equipamento (eq_id,sap,denominacao,classe,sub_classe,estado_Vida,n_serie,id_local) VALUES (?,?,?,?,?,?,?,?)', [rfid_id,sap,denominacao,classe,sub_classe,estado_Vida,n_serie,id_local], function(err, result) {
            if (err) {
                console.log(err);
                return reject(err);
            }
                
                resolve(result)
        })
    })
}








module.exports.inserirLog = inserirLog;
module.exports.equipamentoSearch = equipamentoSearch;
module.exports.estadoVida = estadoVida;
module.exports.tecnicoSearch = tecnicoSearch;
module.exports.updateEVEquipamento = updateEVEquipamento;
module.exports.updateLocalEquipamento = updateLocalEquipamento;
module.exports.getDate = getDate;
module.exports.sapSearch = sapSearch;
module.exports.inserirEquipamento = inserirEquipamento;
module.exports.equipamentoSearchSAP = equipamentoSearchSAP;
module.exports.inserirLogInsercao = inserirLogInsercao;
module.exports.equipamentoMultiple = equipamentoMultiple;
module.exports.db=db;
