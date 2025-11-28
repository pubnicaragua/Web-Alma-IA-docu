# Resumen de Cambios - Sesión 28 Nov 2025

## 1. ✅ reCAPTCHA Habilitado

**Archivos modificados:**
- `actions/auth.ts` - Línea 14: Descomentada validación de reCAPTCHA

**Cambio:**
```javascript
// Antes (deshabilitado)
// await validateRecaptch(values.captcha ?? '');

// Ahora (habilitado)
await validateRecaptch(values.captcha ?? '');
```

**Requisito:** Asegúrate de tener en `.env.local`:
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
NEXT_PUBLIC_RECAPTCHA_SECRET=tu_secret_key
```

---

## 2. 🔍 Logs Mejorados para Debugging

**Archivos modificados:**
- `actions/auth.ts` - Función `validateCredentials()`
- `app/(auth)/login/page.tsx` - Función `onSubmit()`
- `app/api/proxy/[...path]/route.ts` - Proxy handler

**Mejoras:**
- ✅ Logs detallados en cada paso del login
- ✅ Muestra URL exacta del API
- ✅ Muestra status HTTP y body de respuesta
- ✅ Diferencia entre errores de red y credenciales
- ✅ Logs con emojis para fácil identificación

**Ejemplo de logs en consola:**
```
[AUTH] ========== INICIO LOGIN ==========
[AUTH] URL: https://api-almaia.onrender.com/api/v1/auth/login
[AUTH] Email: usuario@almaia.cl
[AUTH] Status HTTP: 200
[AUTH] Response Body: {"token":"eyJ...","user":{...}}
[AUTH] ✅ Login exitoso
[AUTH] Token recibido: true
[AUTH] ========== FIN LOGIN EXITOSO ==========
```

---

## 3. 🤖 Sistema de Monitoreo Automatizado

### Archivos Creados:
- `scripts/health-check.js` - Script de prueba de login
- `MONITORING.md` - Guía completa de configuración
- `package.json` - Agregado script `health-check`

### Características:
- ✅ Prueba login de múltiples usuarios
- ✅ Verifica disponibilidad del API
- ✅ Mide tiempo de respuesta
- ✅ Envía reportes por email
- ✅ Se ejecuta automáticamente a las 5:00 AM (Zona: America/Santiago)
- ✅ Genera reportes HTML con detalles

### Configuración Rápida:

**1. Instalar dependencias:**
```bash
npm install nodemailer
```

**2. Agregar a `.env.local`:**
```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASS=tu-contraseña-app-gmail
MAIL_FROM=noreply@almaia.cl
HEALTH_CHECK_RECIPIENTS=admin@almaia.cl,soporte@almaia.cl
```

**3. Editar `scripts/health-check.js`:**
```javascript
TEST_USERS: [
  { email: 'jonathanweb@almaia.cl', password: 'contraseña' },
  { email: 'soporte@almaia.cl', password: 'contraseña' },
]
```

**4. Probar manualmente:**
```bash
npm run health-check
```

**5. Programar ejecución automática:**

**Windows (Task Scheduler):**
- Abre "Programador de tareas"
- Nueva tarea: "Web Alma IA - Health Check"
- Desencadenador: Diariamente a las 5:00 AM
- Acción: `node.exe` con argumentos `C:\ruta\scripts\health-check.js`

**Linux/Mac (Cron):**
```bash
crontab -e
# Agregar: 0 8 * * * cd /ruta/proyecto && node scripts/health-check.js
```

---

## 4. 📝 Correcciones de Texto

**Archivos modificados:**
- `components/surveys/table/index.tsx` - Línea 47
- `components/surveys/modals/edit.tsx` - Línea 31
- `components/notices/table/index.tsx` - Línea 53

**Cambios:**
- ✅ Encuestas: "No se encontraron **encuestas**" (antes: "alertas")
- ✅ Avisos: "No se encontraron **avisos**" (antes: "alertas")
- ✅ Modal: "Edición de **Encuesta**" (antes: "Encuesto")

---

## 5. 📚 Documentación Creada

- `SETUP.md` - Configuración inicial del proyecto
- `DEBUG.md` - Guía de debugging
- `MONITORING.md` - Sistema de monitoreo automatizado
- `RESUMEN_CAMBIOS.md` - Este archivo

---

## 🚀 Próximos Pasos

### Inmediato:
1. Instala `nodemailer`: `npm install nodemailer`
2. Configura variables de entorno en `.env.local`
3. Prueba login manualmente y verifica logs en F12
4. Agrega usuarios de prueba en `scripts/health-check.js`

### Corto Plazo:
1. Prueba el script de health-check: `npm run health-check`
2. Configura la ejecución automática (Task Scheduler / Cron)
3. Verifica que los emails se reciban correctamente

### Mediano Plazo:
1. Monitorea los reportes diarios
2. Ajusta usuarios de prueba según sea necesario
3. Agrega más métricas si es necesario

---

## 📊 Reporte Diario

El reporte incluye:
- Fecha y hora exacta (Zona: America/Santiago)
- Total de pruebas ejecutadas
- Cantidad de logins exitosos ✓
- Cantidad de logins fallidos ✗
- Tabla detallada con:
  - Email del usuario
  - Estado (✓ Exitoso / ✗ Fallido)
  - Duración de la petición (ms)
  - Mensaje de error (si aplica)

---

## ⚠️ Notas Importantes

### Sobre las Credenciales:
- **NO guardes contraseñas en el código**
- Usa variables de entorno en `.env.local`
- El archivo `.env.local` está en `.gitignore` (no se commitea)

### Sobre el Monitoreo:
- Verifica que el servidor esté disponible antes de ejecutar
- Los reportes se envían incluso si hay fallos (para alertar)
- Puedes ejecutar manualmente en cualquier momento

### Sobre los Logs:
- Los logs en servidor aparecen en la terminal
- Los logs en cliente aparecen en F12 → Console
- Usa los logs para identificar exactamente dónde falla

---

## 🔧 Troubleshooting

### El login sigue fallando
1. Verifica credenciales en `.env.local`
2. Abre F12 → Console y copia los logs
3. Verifica que el API esté disponible
4. Revisa la respuesta del API en Network tab

### No se envían emails
1. Verifica `MAIL_USER` y `MAIL_PASS`
2. Verifica que `HEALTH_CHECK_RECIPIENTS` no esté vacío
3. Prueba manualmente: `npm run health-check`

### El script no se ejecuta automáticamente
1. Verifica que Task Scheduler / Cron esté configurado
2. Revisa los logs del Task Scheduler
3. Prueba ejecutar manualmente primero

---

## 📞 Contacto

Para preguntas o problemas, revisa:
- `MONITORING.md` - Guía de monitoreo
- `DEBUG.md` - Guía de debugging
- Logs en terminal y F12 Console
