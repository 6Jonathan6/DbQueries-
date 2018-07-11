CREATE TABLE paises(
	en_nombre varchar(50),
	es_nombre varchar(50),
	iso_nom varchar(50),
	iso_2 varchar(50),
	iso_3 varchar(50),
	phone_code int,
	PRIMARY KEY(phone_code)
);

CREATE TABLE zip_code(
	zp int
);

CREATE TABLE doctores(
	doctor_id serial UNIQUE,
	doctor_cognito_username varchar(50) UNIQUE,
	doctor_nombre varchar(30) NOT NULL,
	doctor_apellido_paterno varchar(30) NOT NULL,
	doctor_apellido_materno varchar(30) NOT NULL,
	doctor_universidad varchar(50),
	doctor_telefono varchar(12),
	doctor_email varchar(60),
	doctor_calle varchar(50),
	doctor_numero int,
	doctor_cp int,
	doctor_pais int references paises(phone_code),
	PRIMARY KEY(doctor_id,doctor_cognito_username)	
);

CREATE TABLE pacientes(
        paciente_id serial UNIQUE,
        paciente_cognito_username varchar(50) UNIQUE,
        paciente_nombre varchar(30) NOT NULL,
        paciente_apellido_paterno varchar(30) NOT NULL,
        paciente_apellido_materno varchar(30) NOT NULL,
        paciente_sexo varchar(1) NOT NULL,
        paciente_edad int NOT NULL,
        paciente_email varchar(60) NOT NULL,
        paciente_telefono varchar(10) NOT NULL,
        PRIMARY KEY(paciente_id,paciente_cognito_username)
);

CREATE TABLE citas(
        cita_id serial,
        cita_tiempo tsrange NOT NULL,
        cita_status varchar(20) DEFAULT 'agendada',
        cita_calificacion int,
        paciente_id int references pacientes(paciente_id) NOT NULL,
        paciente_cognito_username varchar(50),
		doctor_id int references doctores(doctor_id),
		doctor_cognito_username varchar(50),
		PRIMARY KEY(cita_id),
		FOREIGN KEY(paciente_id,paciente_cognito_username) references pacientes (paciente_id,paciente_cognito_username),
		FOREIGN KEY(doctor_id,doctor_cognito_username) REFERENCES doctores (doctor_id, doctor_cognito_username) 
);                                                                                                                                 

