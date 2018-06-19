const {Pool} = require('pg')
const dbData = require('./data.js')

function registrarpaciente(client,parameters){
    const queryPaciente = 'INSERT INTO pacientes VALUES(DEFAULT,$1,$2,$3,$4,$5,$6,$7) RETURNING id'
    return client.query(queryPaciente,parameters)
}

function registrarEmbarazada(client,parameters){
    const queryEmbarazada = 'INSERT INTO embarazadas VALUES(DEFAULT,$1,$2) RETURNING id '
    return client.query(queryEmbarazada,parameters)
}

function registrarCita(client,parameters){
    const queryCita = 'INSERT INTO citas (id,fecha,hora,id_paciente) VALUES(DEFAULT,$1,$2,$3) RETURNING *'
    return client.query(queryCita,parameters)
}

function getUserId(client,parameters,method){
    /* Para hacer que postgres haga queries  sin tomar encuenta los acento en los nombre y apellidos
        tenemos que crear la extension unaccent con el siguiente query.

            CREATE EXTENSION unaccent;

        EN cada database que se quiera esto es necesario crear la extension

        initcap(column) juan => Juan
    */
    const queryEmail = 'SELECT id, initcap(nombre) AS nombre, initcap(apellido) AS apellido, email  FROM pacientes WHERE email=$1'
    const queryName = "SELECT id, initcap(nombre) AS nombre,initcap(apellido) AS apellido FROM pacientes WHERE unaccent(nombre) LIKE $1;"
    const queryNameSurname = "SELECT id, initcap(nombre) AS nombre,initcap(apellido) AS apellido FROM pacientes WHERE unaccent(nombre) LIKE $1 AND unaccent(apellido) LIKE $2;"
    const queryByid = "SELECT id, initcap(nombre) AS nombre, initcap(apellido) AS apellido FROM pacientes WHERE id= $1;"

    switch(method){
        case 'getUsersByEmail':
            return client.query(queryEmail,parameters)

        case 'getUsersByName':
            return client.query(queryName,parameters)

        case 'getUsersByName':
            return client.query(queryName,parameters)

        case 'getUsersByNameSurname':
            return client.query(queryNameSurname,parameters)

        case 'getUserById':
            return client.query(queryByid,parameters)
    }
}

function getUserInfo(client,parameters){
    const getInfoQuery = 'SELECT * FROM pacientes  WHERE id = $1;'
    return client.query(getInfoQuery,parameter)
}


//User pool

const pool = new Pool({
    user: dbData.user,
    host: dbData.host,
    database: dbData.db,
    password: dbData.password,
    port:dbData.port,
    max:1,
    idleTimeoutMillis:1
})

pool.on('error',(err,client)=>{
    //console.log('Unexpected error on idle client',err)
    throw(err)
})
pool.on('connect',()=>{
    console.log('connected')
})
pool.on('acquire',()=>{
    console.log('new client')
    console.log('IdleCLients'+ pool.idleCount)
    console.log('TotalClienst' + pool.totalCount)
    console.log('Waiting' + pool.waitingCount)})

    pool.on('remove',()=>{console.log('clientRemoved')})



    let handler= async (event) =>{
        const client = await pool.connect()
        const dbResponse ={}

    try {
        switch(event.method){
            case 'regPaciente':
            parameters=[

                event.nombre.toLowerCase(),
                event.apellido.toLowerCase(),
                event.sexo.toLowerCase(),
                event.edad,
                event.telefono,
                event.prospera,
                event.email,
            ]
            response = await registrarpaciente(client,parameters).catch(e=>{throw(e)})
            dbResponse.id = response.rows[0].id
            break

            case 'regEmbarazada':
            parameters = [
                event.fechaUMen,
                event.idPaciente
            ]
            response = await registrarEmbarazada(client,parameters).catch(e=>{throw(e)})
            dbResponse.id = response.rows[0].id
            break
            case 'regCita':
            parameters = [
                    event.fecha,
                    event.hora,
                    event.idPaciente
                ]
                response = await registrarCita(client,parameters).catch(e=>{throw(e)})
                dbResponse.cita = response.rows[0]
                break

                case 'getUserIdByEmail':
                parameters = [
                    event.email
                ]
                response = await getUserId(client,parameters,'getUsersByEmail' )
                dbResponse.users = response.rows
                break

                case 'getUserIdByName':
                parameters= [
                    event.nombre.toLowerCase() + '%'
                ]
                response = await getUserId(client,parameters,'getUsersByName')
                dbResponse.users = response.rows
                break

                case 'getUserIdByNameSurName':
                parameters = [
                    event.nombre.toLowerCase() + '%' ,
                    event.apellido.toLowerCase() + '%'
                ]
                response = await getUserId(client,parameters,'getUsersByNameSurName')
                dbResponse.users = response.rows
                break

                case 'getUserIdById':
                parameters = [
                    event.id
                ]
                response = await getUserId(client,parameters,'getUserById')
                dbResponse.users = response.rows
                break

                case 'getUserInfo':
                parameters = [
                    event.id
                ]
                response = await getUserInfo(clien,parameters)
                dbResponse = response.rows[0]
                break

            }

        }catch(err){
            console.log(err)
            dbResponse.error = err.code ? err.code : err
            console.log(dbResponse.error)

        }  finally{
            client.release()
            console.log('Succed, client release')
            return dbResponse
        }
    }
    /*
    Las async functions siempre retornan un promesa
    aunque en el caso de lambda functions regresan un json
    cuando las invocas cons el sdk de AWS
    */

const event = {
       nombre:'marías',
       apellido:'perez',
       sexo:'f',
       edad:26,
       telefono:'5530202464',
       prospera:'TRUE',
       email:'ejemplo5@ejemplo.com',
       method:'regPaciente'
}

const event2 = {
       idPaciente: 66717,
       fechaUMen: '2018-06-18',
       method:  'regEmbarazada'
}

const event3 = {
       // [pacientId,fecha,hora]
       idPaciente:66717,
       fecha:'2018-06-22',
       hora:'12:30',
       method: 'regCita'

}

const event4 = {
       email: "ejemplo@ejemplo.com",
       method:"getUserIdByEmail"
}

const event5 = {
    method :'getUserIdByName',
    nombre :'Maria',
    apellido:'Sanchez'
}

const event6 = {
    method:'getUserIdById',
    id: 66719
}


//handler(event).then(dbResponse => console.log(dbResponse))
//handler(event2).then(dbResponse => console.log(dbResponse))
//handler(event3).then(dbResponse => console.log(dbResponse))
//handler(event4).then(dbResponse => console.log(dbResponse.users))
//handler(event5).then(dbResponse => console.log(dbResponse.users))
handler(event6).then(dbResponse => console.log(dbResponse.users))


   /*
   Para conbertir juan => Juan
   function capitalize(string){

       return string[0].toUpperCase() + string.substr(1)
    }

    */