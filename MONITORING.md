# Sistema de Monitoreo Automatizado - Web Alma IA

## Descripción
Sistema que prueba automáticamente el login de usuarios cada día a las 5:00 AM (Zona: America/Santiago) y envía reportes por email.

## Instalación

### 1. Instalar dependencias
```bash
npm install nodemailer
```

### 2. Configurar variables de entorno en `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api-almaia.onrender.com/api/v1

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASS=tu-contraseña-app-gmail
MAIL_FROM=noreply@almaia.cl

# Destinatarios (separados por comas)
HEALTH_CHECK_RECIPIENTS=admin@almaia.cl,soporte@almaia.cl,jonathan@almaia.cl
```

### 3. Configurar usuarios de prueba

Edita `scripts/health-check.js` y reemplaza:

```javascript
TEST_USERS: [
  { email: 'jonathanweb@almaia.cl', password: 'tu-contraseña' },
  { email: 'soporte@almaia.cl', password: 'tu-contraseña' },
  // Agregar más usuarios según sea necesario
]
```

## Configuración de Gmail

### Obtener contraseña de aplicación:
1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona "Mail" y "Windows Computer"
3. Copia la contraseña generada
4. Usa esa contraseña en `MAIL_PASS`

## Ejecutar Manualmente

```bash
# Prueba única
node scripts/health-check.js

# Con npm
npm run health-check
```

## Programar Ejecución Automática

### Opción 1: Windows Task Scheduler (Recomendado para Windows)

1. Abre "Programador de tareas" (Task Scheduler)
2. Clic derecho → "Crear tarea básica"
3. Nombre: "Web Alma IA - Health Check"
4. Desencadenador: "Diariamente" → 5:00 AM
5. Acción: "Iniciar un programa"
   - Programa: `C:\Program Files\nodejs\node.exe`
   - Argumentos: `C:\ruta\a\scripts\health-check.js`
   - Iniciar en: `C:\Users\Probook 450 G7\Desktop\WEB ALMA IA`

### Opción 2: Cron (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Agregar línea (5 AM hora de Chile = 8 AM UTC en invierno)
0 8 * * * cd /ruta/al/proyecto && node scripts/health-check.js >> logs/health-check.log 2>&1
```

### Opción 3: PM2 (Recomendado para producción)

```bash
# Instalar PM2
npm install -g pm2

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'health-check',
    script: './scripts/health-check.js',
    cron_restart: '0 5 * * *', // 5 AM diariamente
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Iniciar
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Opción 4: GitHub Actions (Para CI/CD)

Crea `.github/workflows/health-check.yml`:

```yaml
name: Daily Health Check

on:
  schedule:
    - cron: '0 8 * * *'  # 5 AM Chile = 8 AM UTC (invierno)

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/health-check.js
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.API_URL }}
          MAIL_USER: ${{ secrets.MAIL_USER }}
          MAIL_PASS: ${{ secrets.MAIL_PASS }}
          HEALTH_CHECK_RECIPIENTS: ${{ secrets.HEALTH_CHECK_RECIPIENTS }}
```

## Reporte por Email

El reporte incluye:
- ✓ Fecha y hora (Zona: America/Santiago)
- ✓ Total de pruebas ejecutadas
- ✓ Cantidad de logins exitosos
- ✓ Cantidad de logins fallidos
- ✓ Tabla detallada con:
  - Email del usuario
  - Estado (✓ Exitoso / ✗ Fallido)
  - Duración de la petición
  - Mensaje de error (si aplica)

## Logs

Los logs se guardan en:
- Terminal: Salida estándar
- Archivo: `logs/health-check.log` (si está configurado)

## Estructura de Respuesta

### Login Exitoso
```json
{
  "success": true,
  "email": "usuario@almaia.cl",
  "duration": 245,
  "message": "Login exitoso"
}
```

### Login Fallido
```json
{
  "success": false,
  "email": "usuario@almaia.cl",
  "duration": 150,
  "status": 401,
  "message": "Credenciales inválidas"
}
```

## Troubleshooting

### No se envían emails
- Verifica que `MAIL_USER` y `MAIL_PASS` sean correctos
- Verifica que `HEALTH_CHECK_RECIPIENTS` no esté vacío
- Revisa los logs para mensajes de error

### Script no se ejecuta a la hora programada
- Verifica que la zona horaria sea correcta
- Revisa los logs del Task Scheduler / Cron
- Asegúrate de que el servidor esté disponible

### Todos los logins fallan
- Verifica que el API esté disponible
- Verifica que las credenciales sean correctas
- Revisa los logs detallados en la consola

## Próximos Pasos

1. Instala `nodemailer`: `npm install nodemailer`
2. Configura las variables de entorno en `.env.local`
3. Agrega los usuarios de prueba en `scripts/health-check.js`
4. Prueba manualmente: `node scripts/health-check.js`
5. Configura la ejecución automática según tu plataforma
