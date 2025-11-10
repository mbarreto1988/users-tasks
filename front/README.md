# Users Task Frontend

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-repo/users-task-front.git
cd users-task/front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Levantar el proyecto

```bash
npm run dev
```

> El proyecto se ejecutará en `http://localhost:5173` por defecto (usando **Vite**).

---

## 🔗 Dependencias principales

* **React + TypeScript**
* **Vite** (para desarrollo rápido)
* **React Router DOM** (navegación)
* **Axios** (consumo de API)
* **React Toastify** (notificaciones)
* **Jest + React Testing Library** (tests unitarios)

---

## 🔧 Arquitectura del Proyecto

```
front/
├── src/
│   ├── api/              # Servicios HTTP (axiosConfig, userService, taskService)
│   ├── assets/           # Recursos estáticos (imágenes, iconos, etc.)
│   ├── components/       # Componentes reutilizables
│   ├── context/          # Contextos globales (AuthContext)
│   ├── pages/            # Páginas principales (Login, Register, Tasks, Profile, Users)
│   ├── styles/           # Estilos globales y modulares (CSS anidado)
│   ├── tests/            # Tests unitarios
│   ├── App.tsx           # Raíz de la app y rutas
│   └── main.tsx          # Punto de entrada
└── package.json
```

> Se aplicó una **arquitectura limpia**, separando responsabilidades entre vistas, servicios y contexto.

---

## 🌐 Descripción del Proyecto

**Users Task** es una aplicación web para gestión de usuarios y tareas. Permite:

* Registro e inicio de sesión.
* Creación, edición y eliminación de tareas.
* Visualización de tareas según rol (admin o usuario).
* Edición de perfil y cambio de contraseña.

---

## 👤 Roles y Permisos

### • Administrador (`admin`)

* Puede ver todas las tareas de todos los usuarios.
* Puede gestionar (crear, editar, eliminar) cualquier tarea.
* Puede cambiar roles a otros usuarios.

### • Usuario normal (`user`)

* Solo ve y gestiona sus propias tareas.
* Puede editar su perfil y contraseña.

### 🔐 Usuario inicial por defecto

Al iniciar el backend, se genera automáticamente:

```
Email: admin@admin.com
Password: admin123
```

> Con este usuario podés iniciar sesión como **Administrador** desde el frontend.

---

## 🔒 Autenticación y Manejo del Token

* Al iniciar sesión, el backend devuelve un **accessToken (JWT)** y los datos del usuario.
* El token se guarda en `localStorage` y también se maneja dentro del **AuthContext**.
* Cada petición autenticada (como editar perfil o crear tarea) incluye el token en los headers:

```ts
Authorization: `Bearer ${token}`
```

* Si el token expira o el usuario cierra sesión, se limpia del contexto y del localStorage.

---

## 🔎 Context API (AuthContext)

El proyecto utiliza **React Context** para manejar la autenticación global.

### Estado Global

```ts
{
  user: { id, userName, email, role },
  accessToken: string,
  login(token, user),
  logout(),
  setUser(user)
}
```

* `login()` guarda el token y los datos del usuario.
* `logout()` limpia la sesión.
* `setUser()` permite actualizar el usuario desde cualquier componente (por ejemplo, en `Profile`).

---

## 📋 Estilos

Se utilizan **estilos anidados con clases BEM** para mantener un CSS limpio y escalable.

Ejemplo:

```css
.tasks {
  &__table { ... }
  &__title { ... }
  &__btn--edit { ... }
}
```

> Esto permite agrupar estilos por componente sin colisiones.

---

## 🔧 Testing

Los tests se realizan con **Jest** y **React Testing Library**.

* Se mockean contextos, servicios y notificaciones.
* Se prueban flujos completos: login, register, tareas y perfil.

Ejemplo de ejecución:

```bash
npm run test
```

> Los tests corren una sola vez y finalizan automáticamente.

---

## 💡 Características destacadas

* Arquitectura limpia y modular.
* Context API para autenticación global.
* Manejo de roles avanzado (admin / user).
* Persistencia del token en localStorage.
* API Layer con Axios configurado.
* Estilos BEM + CSS anidado.
* Suite completa de tests.

---

## 🚀 Comandos disponibles

| Comando           | Descripción                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Inicia el entorno de desarrollo |
| `npm run build`   | Genera la versión de producción |
| `npm run preview` | Sirve la build localmente       |
| `npm run test`    | Ejecuta los tests unitarios     |

---

## 💎 Autor

**Matias Barreto**
Desarrollador Fullstack | JavaScript | React | Node.js
