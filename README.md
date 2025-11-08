# Portal de Productos con Autenticación y Chat

Repositorio: [FernandoWilliam26/Portal](https://github.com/FernandoWilliam26/Portal)  

---

## Contenido

- `src/` — código fuente de la aplicación  
- `.env` — archivo de configuración de entorno
- `package.json` / `package-lock.json` — dependencias del proyecto  

---

## Características principales

- Registro, inicio de sesión y gestión de usuarios  
- Autenticación para el acceso a funciones privadas  
- Gestión de productos (listado, creación, edición, eliminación)  
- Funcionalidad de chat en tiempo real entre usuarios o entre usuario y sistema  
- Interfaz web moderna (JavaScript, HTML, CSS)  

---

## Instalación y puesta en marcha

1. **Clona este repositorio:**
   

   git clone https://github.com/FernandoWilliam26/Portal.git

   cd Portal

   ---

## Ejecución de la aplicación

2. **Instala las dependencias:**
   Instala las dependencias del proyecto usando `npm`:
  
   npm install

3. **Ejecuta la aplicación en modo desarrollo:**
   Una vez que las dependencias estén instaladas, puedes iniciar el servidor en modo desarrollo:
   
   npm start


## Estructura del proyecto

src/

├─ server.js

├─ config.js

├─ models/

│ ├─ User.js

│ └─ Product.js

├─ routes/

│ ├─ authRoutes.js

│ ├─ productRoutes.js

│ └─ chatRoutes.js

└─ middleware/

└─ authenticateJWT.js

public/

├─ index.html

├─ login.html

├─ register.html

├─ chat.html

├─ styles.css

├─ client.js

├─ chat.js

└─ images/

## Decisiones tomadas durante el desarrollo

Durante el desarrollo del proyecto se adoptaron una serie de decisiones orientadas a garantizar la claridad estructural, la funcionalidad del sistema y la facilidad de mantenimiento del código.

1. **Estructura del proyecto**  
   La aplicación se organizó en diferentes módulos (`models`, `routes`, `middleware`, etc.) con el objetivo de mantener una arquitectura ordenada, coherente y fácilmente escalable.

2. **Autenticación con JWT**  
   Se implementó un sistema de autenticación basado en JSON Web Tokens (JWT) para gestionar las sesiones de usuario y controlar el acceso a las distintas secciones de la aplicación. El almacenamiento del token se realiza en `localStorage`, una solución adecuada para el entorno de desarrollo planteado.

3. **Roles de usuario**  
   Se definieron dos niveles de acceso: `user` y `admin`. Esta diferenciación permite que únicamente los administradores puedan realizar operaciones de creación, edición y eliminación de productos, mientras que los usuarios estándar tienen acceso restringido a la visualización.

4. **Base de datos con MongoDB**  
   La persistencia de los datos se llevó a cabo mediante MongoDB, una base de datos NoSQL que ofrece flexibilidad en el manejo de la información y una integración sencilla con Mongoose para la gestión de esquemas y consultas.

5. **Chat en tiempo real**  
   La funcionalidad de chat se desarrolló con Socket.IO, permitiendo la comunicación bidireccional en tiempo real entre los usuarios. Además, se incorporó la posibilidad de personalizar el color del nombre de usuario, aportando un elemento de identificación visual dentro del entorno de conversación.

6. **Compatibilidad entre sistemas operativos**  
   Se utilizó la librería `cross-env` para asegurar la correcta ejecución de los scripts de desarrollo y producción en distintos sistemas operativos, garantizando la portabilidad del proyecto.

En conjunto, las decisiones adoptadas se enfocaron en lograr una aplicación equilibrada en términos de **claridad, funcionalidad y eficiencia**, facilitando su comprensión y posterior ampliación.


