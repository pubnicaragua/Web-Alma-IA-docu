# Alma IA - Frontend 🚀

Este proyecto es el frontend de la plataforma **Alma IA**, desarrollado utilizando el framework moderno **Next.js** (App Router), con **TypeScript**, **Tailwind CSS** para los estilos y la biblioteca de componentes **shadcn/ui**.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* **Node.js** (versión v18 o superior recomendada)
* **pnpm** (el gestor de paquetes recomendado para este proyecto). Si no lo tienes instalado globalmente, puedes instalarlo usando:
  ```bash
  npm install -g pnpm
  ```

---

## ⚙️ Configuración del Entorno (`.env`)

El frontend requiere ciertas variables de entorno para conectarse al backend, validar captchas y encriptar datos en el cliente. 

Hemos creado una plantilla para ti. Sigue estos pasos para configurarlo:

1. Localiza el archivo `.env` que acabamos de crear en la raíz del proyecto.
2. Si prefieres configurar entornos específicos, puedes copiar la plantilla `.env.example` a un nuevo archivo `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Configura los siguientes campos en tu archivo `.env` o `.env.local`:
   * **`NEXT_PUBLIC_API_BASE_URL`**: La URL base de tu API de backend (ej. `http://localhost:8000` o tu servidor en la nube).
   * **`NEXT_PUBLIC_ENCRYPTION_KEY`**: Una clave secreta para encriptar datos localmente.
   * **`NEXT_PUBLIC_ENVIROMENT`**: Establece `"development"` para ver la etiqueta de desarrollo en pantalla o `"production"` para ocultarla.
   * **`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`** y **`NEXT_PUBLIC_RECAPTCHA_SECRET`**: Claves para habilitar Google reCAPTCHA v2.

---

## 🚀 Instrucciones para Ejecutar el Proyecto

Sigue estos sencillos comandos en la terminal (desde la carpeta raíz del proyecto):

### 1. Instalar las dependencias
Instala todas las librerías necesarias con el package manager preconfigurado (`pnpm`):
```bash
pnpm install
```
*(Si no usas `pnpm`, también puedes usar `npm install` o `yarn install`).*

### 2. Ejecutar el servidor de desarrollo
Inicia el entorno local de desarrollo:
```bash
pnpm dev
```
*(O alternativamente: `npm run dev` / `yarn dev`).*

Una vez iniciado, abre tu navegador e ingresa a:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Comandos Útiles

* **Ejecutar en desarrollo**: `pnpm dev` (Ejecuta el servidor de desarrollo interactivo con Hot Module Replacement).
* **Compilar para producción**: `pnpm build` (Crea una versión optimizada del frontend lista para desplegar).
* **Iniciar en producción**: `pnpm start` (Ejecuta la build de producción previamente construida).
* **Analizar errores de sintaxis**: `pnpm lint` (Ejecuta ESLint para asegurar la calidad del código).

---

## 📂 Estructura Principal del Proyecto

* **`/app`**: Rutas y páginas de la aplicación utilizando el sistema de App Router de Next.js.
* **`/components`**: Componentes visuales interactivos y de UI (incluyendo componentes shadcn).
* **`/services`**: Funciones encargadas de interactuar con las APIs de backend (autenticación, beneficios, etc.).
* **`/actions`**: Server Actions para realizar peticiones directamente desde componentes de Next.js.
* **`/lib`**: Utilidades genéricas (criptografía, validación de recaptcha, etc.).
* **`/hooks`**: React Hooks personalizados.