# 🧱 Users & Tasks API — Clean Architecture

API RESTful desarrollada en **Node.js + TypeScript** con enfoque en **Clean Architecture**, separando responsabilidades y garantizando un código mantenible, escalable y testeable.  
La aplicación gestiona **usuarios** y **tareas**, con control de **roles (admin/user)** y autenticación mediante **JWT** para un manejo seguro de sesiones..

# Propósito del proyecto
Este proyecto fue desarrollado con el objetivo de demostrar una forma de trabajo limpia, organizada y escalable, siguiendo los principios SOLID, las prácticas de Clean Code y una clara separación de responsabilidades entre las capas y los distintos módulos de la aplicación.

Refleja mi manera de encarar el desarrollo de sistemas reales: buscando que el código sea fácil de entender, mantener y extender, priorizando la legibilidad, los tests y la escalabilidad a largo plazo

# Funcionalidades
- **Autenticación y Autorización:**
Sistema seguro de registro e inicio de sesión utilizando JWT, tanto para la autenticación como para la protección de rutas.
- **Gestión de Roles:** 
  - **Admin:** puede crear, listar, modificar y eliminar usuarios y tareas.  
  - **User:** puede gestionar únicamente su propio perfil y tareas. 
- **Implementación de Clean Architecture:**
El código está estructurado en capas bien definidas — domain, application, infrastructure y presentation — siguiendo las mejores prácticas para fomentar la testabilidad y la independencia de frameworks o librerías externas.
- **Pruebas Unitarias:**
Cada caso de uso y repositorio clave cuenta con tests unitarios, asegurando confiabilidad y robustez en el funcionamiento general del sistema.

# Por qué lo hice
Este proyecto fue creado como una muestra personal de mi manera de trabajar, mi forma de pensar el código y de estructurar una aplicación completa.
No busca solo mostrar conocimiento técnico, sino también mis ganas de seguir aprendiendo y creciendo como desarrollador, explorando diferentes arquitecturas, infraestructuras y patrones que permitan construir soluciones sólidas y escalables.

Mi foco está siempre en escribir código limpio, entendible y mantenible, aportando valor real a los equipos de desarrollo y asegurando bases sólidas para proyectos a largo plazo.

---

## 🚀 Ejecución del Proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/mbarreto1988/users-tasks
cd users-task/back
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Scrip para la base de datos (en este caso relacional SQL Server)
```sql
create database BackFront;

use BackFront;

CREATE TABLE
	user_data (
		id int identity (1, 1) not null,
		firstName varchar(80),
		lastName varchar(100),
		userName nvarchar (100),
		email nvarchar (150),
		passwordHash nvarchar (255) NOT NULL,
		userRole nvarchar (80),
		isActive int not null,
		createdAt datetime default getdate (),
		updatedAt DATETIME NULL,
		primary key (id)
	);

CREATE TABLE
	task_data (
		id INT IDENTITY (1, 1) NOT NULL,
		title NVARCHAR (MAX) NOT NULL,
		description TEXT NULL,
		status NVARCHAR (50) DEFAULT 'pending',
		priority NVARCHAR (50) DEFAULT 'medium',
		userId INT NOT NULL,
		createdAt DATETIME DEFAULT GETDATE (),
		updatedAt DATETIME NULL,
		isActive BIT DEFAULT 1,
		CONSTRAINT PK_task_data PRIMARY KEY (id),
		CONSTRAINT FK_task_user FOREIGN KEY (userId) REFERENCES user_data (id) ON DELETE CASCADE
	);
```

### 4. Variables de entorno (`.env`)
Configurar el archivo `.env` con tus credenciales:

```env
PORT=3000
DB_HOST=localhost
DB_USER={user}
DB_PASSWORD={password}
DB_NAME=BackFront
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true
DB_POOL_MIN=1
DB_POOL_MAX=10
DB_POOL_IDLE=30000
JWT_SECRET=mi_clave_jwt
JWT_REFRESH_SECRET=mi_refresh_jwt
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

### 5. Ejecutar el servidor
```bash
npm run dev
```

Servidor disponible en:
```
http://localhost:3000/api/v1
```

---

## 🧩 Arquitectura — Clean Architecture

La aplicación sigue los principios de **Clean Architecture**, separando las capas de la siguiente forma:

```
src/
├── application/       → Casos de uso (reglas de negocio)
├── domain/            → Entidades y contratos (interfaces)
├── infrastructure/    → Implementaciones (DB, servicios, repositorios)
├── presentation/      → Rutas, controladores y middlewares
├── shared/            → Helpers, errores y respuestas comunes
```

### 🔹 Responsabilidad por capa

| Capa | Responsabilidad |
|------|------------------|
| **Domain** | Define las entidades (`User`, `Task`) y sus interfaces de repositorio. No depende de nada externo. |
| **Application** | Implementa los casos de uso (`UserUseCases`, `TaskUseCases`), aplicando reglas de negocio y validaciones. |
| **Infrastructure** | Gestiona la conexión a la base de datos (SQL Server) y las implementaciones de los repositorios. |
| **Presentation** | Expone la API HTTP: controladores, rutas y middlewares. |
| **Shared** | Define respuestas, manejo de errores y utilidades globales. |

---

## 🧠 Inyección de Dependencias

Cada capa recibe sus dependencias **por constructor**, asegurando bajo acoplamiento:

```ts
const db = new Database();
const repo = new TaskRepository(db);
const useCase = new TaskUseCases(repo);
const controller = new TaskController(useCase);
```

De esta forma, los casos de uso pueden testearse fácilmente con **mocks** o **repositorios falsos**, sin depender de la base real.

---

## 🔐 Roles y Autenticación

La app implementa autenticación con **JWT** mediante un middleware `authMiddleware`.

- **Admin**: puede listar, crear, actualizar y eliminar **todos los usuarios y tareas**.
- **User**: solo puede ver, editar o eliminar **sus propios datos o tareas**.

Los tokens incluyen en su payload:
```json
{
  "userId": 4,
  "email": "user@example.com",
  "role": "admin"
}
```

El middleware valida el token y expone `req.user` con la información del usuario autenticado.

---

## ⚙️ Middlewares

- **`authMiddleware`**: valida el token JWT y asigna el usuario al request.
- **`roleMiddleware`** *(opcional)*: permite o deniega acceso según el rol.
- **`loggerMiddleware`**: registra cada request (método, ruta, usuario).
- **`errorMiddleware`**: captura y formatea errores (AppError o genéricos).

---

## 🧾 Validación con Zod

El proyecto utiliza **Zod** para validar y tipar datos de entrada (DTOs) en los casos de uso.

Ejemplo:
```ts
const createUserSchema = z.object({
  firstName: z.string().min(2),
  email: z.email(),
  password: z.string().min(5),
  userRole: z.enum(['admin', 'user']).default('user'),
});
```

Esto garantiza que los datos que llegan desde el cliente estén correctamente estructurados **antes de llegar a la base de datos**.

---

## 🗄️ Dependencias Clave

| Librería | Uso |
|-----------|-----|
| **express** | Framework HTTP principal |
| **mssql** | Conexión a SQL Server |
| **zod** | Validación de esquemas (DTOs) |
| **bcrypt** | Hash de contraseñas |
| **jsonwebtoken** | Generación y validación de tokens |
| **dotenv** | Configuración de entorno |
| **eslint / prettier** | Estilo y limpieza de código |
| **typescript** | Tipado estático y mejor DX |

---

## 📚 Endpoints Principales

### 🔸 Auth
| Método | Endpoint | Descripción |
|--------|-----------|--------------|
| `POST` | `/api/v1/auth/register` | Registrar un nuevo usuario |
| `POST` | `/api/v1/auth/login` | Iniciar sesión y obtener tokens |

---

### 🔸 Users
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| `GET` | `/api/v1/users` | Admin: todos / User: solo el propio |
| `GET` | `/api/v1/users/:id` | Ver usuario por ID |
| `POST` | `/api/v1/users` | Crear nuevo usuario (solo admin) |
| `PUT` | `/api/v1/users/:id` | Actualizar usuario completo |
| `PATCH` | `/api/v1/users/:id` | Actualizar parcialmente |
| `DELETE` | `/api/v1/users/:id` | Eliminar usuario (admin o propio) |

---

### 🔸 Tasks
| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| `GET` | `/api/v1/tasks` | Admin: todas / User: solo las suyas |
| `GET` | `/api/v1/tasks/:id` | Obtener tarea por ID |
| `POST` | `/api/v1/tasks` | Crear nueva tarea |
| `PUT` | `/api/v1/tasks/:id` | Actualizar completamente una tarea |
| `PATCH` | `/api/v1/tasks/:id` | Actualizar parcialmente una tarea |
| `DELETE` | `/api/v1/tasks/:id` | Eliminar tarea (admin o propia) |

---

## 💡 Ejemplos con Curl

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"123456"}'
```

### Obtener todas las tareas
```bash
curl -X GET http://localhost:3000/api/v1/tasks -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Crear usuario (solo admin)
```bash
curl -X POST http://localhost:3000/api/v1/users -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" -d '{
  "firstName": "Juan",
  "lastName": "Pérez",
  "userName": "jperez",
  "email": "juan@example.com",
  "password": "12345",
  "userRole": "user"
}'
```

---

## Estructura del Proyecto

src/
├── application/         # Casos de uso y validaciones con Zod
│   ├── dto/             # Data Transfer Objects (validaciones de entrada)
│   └── use-cases/       # Lógica de negocio central
│
├── domain/              # Entidades y contratos de repositorios
│   ├── entities/        
│   └── repositories/    
│
├── infrastructure/      # Conexiones externas e implementación de repositorios
│   ├── db/              # Configuración y conexión a MSSQL
│   ├── repositories/    # Implementaciones concretas de interfaces del dominio
│   ├── services/        # Servicios como JWT, bcrypt, etc.
│   └── config/          # Variables de entorno y configuración general
│
├── presentation/        # Capa de presentación y ruteo
│   ├── controllers/     # Controladores Express
│   ├── middlewares/     # Middlewares globales y de seguridad
│   ├── routes/          # Rutas agrupadas por feature
│   └── server.ts        # Configuración principal del servidor
│
└── shared/              # Código compartido
    ├── errors/          # Manejo unificado de errores (AppError)
    ├── http/            # Utilidades de respuesta y asyncHandler
    └── utils/           # Funciones auxiliares


## Testing
El proyecto utiliza Jest + ts-jest para las pruebas unitarias.
Cada capa crítica (infraestructura, casos de uso, controladores y middlewares) cuenta con su propio conjunto de tests en la carpeta __test__ de cada módulo.

### Ejecutar los tests
```ts
npm install
npm run test
```

## Estructura de los tests
src/
├── infrastructure/
│   ├── db/__test__/...
│   ├── repositories/__test__/...
│   └── services/__test__/...
│
├── application/
│   └── use-cases/__test__/...
│
├── presentation/
│   ├── controllers/__test__/...
│   └── middlewares/__test__/...


Cada test se ejecuta en aislamiento, utilizando mocks de dependencias (como base de datos o JWT) para simular el comportamiento real sin afectar el entorno productivo.

Los tests cubren:
- Casos de uso principales (auth, users, tasks).
- Repositorios y conexiones a base de datos.
- Controladores y middlewares.
- Servicios como JWT o bcrypt.

## Tecnologías y librerías principales
- Express — Servidor HTTP.
- MSSQL — Base de datos relacional.
- Zod — Validaciones y tipado estático.
- bcrypt — Encriptación de contraseñas.
- jsonwebtoken (JWT) — Autenticación.
- Jest + ts-jest — Testing.
- ESLint + Prettier — Estilo y consistencia de código

## 🧱 Conclusión

El proyecto está diseñado para ser **limpio, extensible y fácil de mantener**, priorizando:
- separación clara de capas  
- validaciones robustas con Zod  
- inyección de dependencias controlada  
- autenticación segura con JWT  
- código testeable y desacoplado de infraestructura  

---

> Desarrollado por **Matías (Mati)** — enfoque profesional en arquitectura limpia, escalabilidad y mantenibilidad de sistemas backend.
