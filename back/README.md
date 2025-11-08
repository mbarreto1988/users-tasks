# 🧱 Users & Tasks API — Clean Architecture

API RESTful desarrollada en **Node.js + TypeScript** con enfoque en **Clean Architecture**, separando responsabilidades y garantizando un código mantenible, escalable y testeable.  
La aplicación gestiona **usuarios** y **tareas**, con control de **roles (admin/user)** y autenticación mediante **JWT**.

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

### 3. Variables de entorno (`.env`)
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

### 4. Ejecutar el servidor
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

## 🧪 Testing (Sugerido)

La arquitectura permite testear de forma independiente cada capa:
- **UseCases:** unit tests con mocks (lógica pura)
- **Repositories:** tests de integración con DB
- **Controllers:** tests HTTP con Supertest

---

## 🧱 Conclusión

El proyecto está diseñado para ser **limpio, extensible y fácil de mantener**, priorizando:
- separación clara de capas  
- validaciones robustas con Zod  
- inyección de dependencias controlada  
- autenticación segura con JWT  
- código testeable y desacoplado de infraestructura  

---

> Desarrollado por **Matías (Mati)** — enfoque profesional en arquitectura limpia, escalabilidad y mantenibilidad de sistemas backend.
