const {Pool} = require('pg')
const dbData = require('./data.js')

const event = {
    nombre:'juan',
    apellido:'perez',
    sexo:'m',
    edad:5,
    telefono:'5530202464',
    prospera:'TRUE',
    email:'ejemplo@ejemplo.com'
}

//User pool

const pool = new Pool({
    user: dbData.user,
    host: dbData.host,
    database: dbData.db,
    password: dbData.password,
    port:dbData.port
})

pool.on('error',(err,client)=>{
    console.log('Unexpected error on idle client',err)
    process.exit(-1)
})
pool.on('connect',()=>{
    console.log('connected')
})
const query = 'INSERT INTO pacientes VALUES(DEFAULT,$1,$2,$3,$4,$5,$6,$7) returning id'
let handler= async (event) =>{
    const parameters = []
    for(parameter in event){
        parameters.push(event[parameter])
    }
    
    const client = await pool.connect()
    try {
        const res = await client.query(query,parameters).catch(e=>{throw(e)})
        console.log(res.rows[0].id)
    }catch(err){
        console.log(err)
    }  finally{
        client.release()
    }

}

    handler(event)