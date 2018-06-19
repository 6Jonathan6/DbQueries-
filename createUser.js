const {Pool} = require('pg')
const dbData = require('./data.js')

const event = {
    nombre:'maria',
    apellido:'perez',
    sexo:'f',
    edad:26,
    telefono:'5530202464',
    prospera:'TRUE',
    email:'ejemplo@ejemplo.com',
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

let handler= async (event) =>{
    const client = await pool.connect()
    const dbResponse ={}
  
    try {
        switch(event.method){
            case 'regPaciente':
            parameters=[
                
                event.nombre,
                event.apellido,
                event.sexo,
                event.edad,
                event.telefono,
                event.prospera,
                event.email,
            ]
            response = await registrarpaciente(client,parameters).catch(e=>{throw(e)})
            dbResponse.id = response.rows[0].id
            break
            
            case 'regEmbarazada':
                if(event.sexo != 'f'){
                    throw(new Error('Men cannot get pregnant!'))
                }
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
            case 'getUsersByEmail':
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

handler(event).then(dbResponse => console.log(dbResponse))
handler(event2).then(dbResponse => console.log(dbResponse))
handler(event3).then(dbResponse => console.log(dbResponse))
