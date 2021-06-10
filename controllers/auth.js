const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcryptjs'); //hashing password
const func = require('./funcoes')


exports.register = (req, res) => {
    console.log(req.body);

    const {name, email, password, passwordConfirm } = req.body; //destructuring 

    func.db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results)=>{ //verificar se não existe um email igual
        if(error){ //mostrar o erro
            console.log(error);
        }
        if(results.length > 0){ //se existir um email igual
            return res.render('register', {
                message: 'That email is already in use.'
            })
        }else if( password !== passwordConfirm){ //se as pass não derem match
            return res.render('register', {
                message: 'The passwords do not match.'
            });
        }
        let hashedPassword = await bcrypt.hash(password, 8); //hashing password with 8 rounds
        console.log(hashedPassword);
        //Inserir User
        func.db.query('INSERT INTO users SET ?', {name:name, email:email, password:hashedPassword}, (error, results) =>{ 
            if(error){
                console.log(error);
            }else{
                console.log(results);
                return res.render('register', {
                    message: 'User Registered'
                });
            }
        })
    });
}


exports.login = async (req, res) => {

    try{
        const {email, password } = req.body; //destructuring 

        if(!email || !password){
            return res.status(400).render('login', {
                message: 'Não deixe campos em branco'
            })
        }
        
        func.db.query('SELECT * FROM users WHERE email = ?', [email], async(error,results)=>{
            //console.log(results);
            if(!results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login',{ //forbidden code
                    message: 'O email ou a password estão errados'
                })

            }else{
                const id = results[0].id;
                //criar um token para o login (cookies)
                const token = jwt.sign({id:id}, process.env.JWT_SECRET, { //guardar no env
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                //console.log("TokenADDED: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ), 
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions); //set up the cookie
                res.status(200).redirect("/dashboard");
            }
        });

    }catch(error){
        console.log(error);
    }
}

exports.dashboard = (req, res) => {
    return res.render('dashboard');   
    
}

exports.data = (req, res) => {

    func.db.query('SELECT equipamento.eq_id, equipamento.sap, equipamento.denominacao, equipamento.classe, equipamento.sub_Classe,estadovidahelper.descricao , equipamento.n_Serie,armazem.local  FROM equipamento INNER JOIN estadovidahelper ON equipamento.estado_Vida=estadovidahelper.bool_id INNER JOIN armazem ON equipamento.id_local=armazem.id_local', (error, results)=>{
       
        if(error){
            console.log(error);
        }
        
        //console.log(results);
        const data = JSON.parse(JSON.stringify(results));
        //console.log(data);
        return res.json(data);
        

    });
    
}

exports.adicionarEquipamento = async (req, res) => {
    const {sap, rfid_id} = req.body; //destructuring

    console.log("SAP: "+ sap + "\nRFID: "+rfid_id);
    //verificar sap na listagem
    var resultadoSAP = await func.sapSearch(sap);
    if(resultadoSAP == false){
        res.status(400).render('adicionarEquipamento',{ 
            error: 'SAP não encontrado na Base de dados'
        })
        return 0;
    }
    //verificar se existe um equipamento inserido com o mesmo sap
    var resultadoEquipamento = await func.equipamentoSearchSAP(sap);
    console.log(resultadoEquipamento);
    if(resultadoEquipamento == true){
        res.status(400).render('adicionarEquipamento',{ 
            error: 'Equipamento já inserido'
        })
        return 0;
    }
    //verificar se o rfid já está em uso
    var resultadoRfid = await func.equipamentoSearch(rfid_id);
    console.log(resultadoRfid);
    if(resultadoRfid == true){
        res.status(400).render('adicionarEquipamento',{ 
            error: 'RFID em uso'
        })
        return 0;
    }
    console.log("fazer a inserção");
    await func.inserirEquipamento(rfid_id,sap,resultadoSAP[0].denominacao,resultadoSAP[0].classe,resultadoSAP[0].sub_classe,1,resultadoSAP[0].n_serie,1);
    //inserir novo equipamento FALTAAA
    var data = func.getDate();
    func.inserirLogInsercao(rfid_id,sap,data);
    //console.log("inserção feita");
    res.status(200).render('adicionarEquipamento',{ 
        success: 'Dados Inseridos com Sucesso'
    })
    
}

//inserir um log
exports.postdata = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var i;
    const {rfid_id, eq_id,id_Sensor,id_local} = req.body; //destructuring 

    //procurar na base de dados se existem equipamentos
    for (i = 0; i < eq_id.length; i++) {
        var resultadoEquipamento = await func.equipamentoSearch(eq_id[i]);
        if(resultadoEquipamento == false){
            res.end('ERRO');
            console.log('Erro');
            return 0;
        }
    }
    //procurar na base de dados se existe o técnico
    var resultadoTecnico = await func.tecnicoSearch(rfid_id);
    
    //Se houver algum erro a função retorna
    if(resultadoTecnico == false){
        res.end('ERRO');
        console.log('Erro');
        return 0;
    }
    var nColaborador = JSON.parse(JSON.stringify(resultadoTecnico[0].n_Colaborador));

    //verifica qual o estado de vida
    for (i = 0; i < eq_id.length; i++) {
        var resultadoEstado = await func.estadoVida(eq_id[i]);       
        var estadoVida = JSON.parse(JSON.stringify(resultadoEstado[0].estado_Vida));
        
        estadoVida = 1 - estadoVida;   
        //se o estado de vida for 1 (esta a entrar no armazem) temos que colocar uma localização nova
        if(estadoVida == 1){
            func.updateLocalEquipamento(id_local,eq_id[i]);
        }
        //update do estado de vida do equipamento
        func.updateEVEquipamento(estadoVida,eq_id[i]);
        //data de hoje
        var data = func.getDate();
        func.inserirLog(eq_id[i],estadoVida,nColaborador,id_local,data,id_Sensor);
    }

    res.send('Success');
    console.log(rfid_id, eq_id, id_Sensor);
}