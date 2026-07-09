# Guía de Debugging - Error de Login

## Problema Actual
- ✅ POST /login retorna 200 (éxito HTTP)
- ❌ GET /perfil/obtener retorna 401 (no autorizado)
- ❌ El token no se está enviando correctamente
- prueba de vercel por pub6


## Pasos para Debuggear

### 1. Abre la Consola del Navegador (F12)
En la pestaña **Console**, busca los logs:
```
[LOGIN] Enviando credenciales: { email: '...', password: '***' }
[AUTH] Intentando login en: https://api-almaia.onrender.com/api/v1/auth/login
[AUTH] Respuesta del login - Status: 200 OK
[AUTH] Login exitoso - Token recibido: true/false
```

### 2. Verifica en la Terminal del Servidor
Busca estos logs:
```
[PROXY] POST https://api-almaia.onrender.com/api/v1/auth/login -> 200
[PROXY] GET https://api-almaia.onrender.com/api/v1/perfil/obtener -> 401
```

### 3. Posibles Causas

#### A. El API no devuelve token
**Síntoma**: `[AUTH] Login exitoso - Token recibido: false`

**Solución**: Verifica que el API devuelva un campo `token` en la respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### B. El token se guarda pero no se envía
**Síntoma**: Token en localStorage pero 401 en perfil

**Verificación en Console del navegador**:
```javascript
// Ejecuta esto en la consola
localStorage.getItem('auth_token')
```

Si devuelve algo, el token se guardó. Si devuelve `null`, no se guardó.

#### C. El header Authorization está mal formado
**Verificación**: En Network tab (F12), ve a la petición GET `/perfil/obtener` y verifica:
- Headers → Authorization: `Bearer eyJhbGciOiJIUzI1NiIs...`

### 4. Respuesta Esperada del API

**POST /auth/login** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Usuario"
  }
}
```

**GET /perfil/obtener** (200 OK con token válido):
```json
{
  "id": 1,
  "nombre": "Usuario",
  "rol": {
    "nombre": "Admin"
  }
}
```

### 5. Logs Agregados

Se han agregado logs en:
- `app/(auth)/login/page.tsx` - Logs del cliente
- `actions/auth.ts` - Logs del servidor (server action)
- `app/api/proxy/[...path]/route.ts` - Logs del proxy

## Próximos Pasos

1. **Intenta login** con credenciales válidas
2. **Abre F12** → Console
3. **Copia los logs** que aparezcan
4. **Verifica en Network** la respuesta del API
5. **Comparte los logs** para identificar el problema exacto

## Credenciales de Prueba

Necesitas credenciales válidas del API. Pregunta al equipo de backend por:
- Email/Usuario de prueba
- Contraseña de prueba
- Confirmar que el endpoint `/auth/login` devuelve un `token`
