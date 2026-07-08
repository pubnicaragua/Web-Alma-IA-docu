# Configuración del Proyecto Web Alma IA

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# API Base URL - Reemplaza con tu URL de API
NEXT_PUBLIC_API_BASE_URL=http://tu-api-url.com

# reCAPTCHA (Opcional - actualmente deshabilitado)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET=tu_secret_key

# OrÃ­genes CORS permitidos, separados por coma (sin comodÃ­n *)
ALLOWED_ORIGINS=http://localhost:3000
```

## Errores Corregidos

### 1. Error de Login: "Failed to parse URL from undefined/auth/login"
- **Causa**: `NEXT_PUBLIC_API_BASE_URL` no está configurada
- **Solución**: Configura la variable en `.env.local`

### 2. Errores de Texto
- ✅ Encuestas: "No se encontraron **encuestas**" (antes decía "alertas")
- ✅ Avisos: "No se encontraron **avisos**" (antes decía "alertas")
- ✅ Modal de edición: "Edición de **Encuesta**" (antes decía "Encuesto")

### 3. reCAPTCHA
- ✅ Deshabilitado temporalmente en `actions/auth.ts`
- ✅ Componente dummy en `components/ui/recaptcha.tsx`

## Estructura del Proyecto

### Encuestas (`/encuestas`)
- **Página**: `app/encuestas/page.tsx`
- **Tabla**: `components/surveys/table/index.tsx`
- **Formulario**: `components/surveys/form/index.tsx`
- **Modales**: 
  - Crear: `components/surveys/modals/new.tsx`
  - Editar: `components/surveys/modals/edit.tsx`
  - Ver Respuestas: `components/surveys/modals/responses.tsx`
  - Ver Resumen: `components/surveys/modals/view.tsx`
- **Filtros**: `components/surveys/table/filters.tsx`

**Funcionalidades**:
- Crear, editar y listar encuestas
- Gestionar preguntas y respuestas
- Definir destinatarios
- Programar ejecución con frecuencia
- Ver respuestas por encuestado
- Gráficos de resumen (pie charts)

### Avisos (`/avisos`)
- **Página**: `app/avisos/page.tsx`
- **Tabla**: `components/notices/table/index.tsx`
- **Formulario**: `components/notices/form/index.tsx`
- **Modales**:
  - Crear: `components/notices/modals/new.tsx`
  - Editar: `components/notices/modals/edit.tsx`
  - Ver: `components/notices/modals/view.tsx`
- **Filtros**: `components/notices/table/filters.tsx`

**Funcionalidades**:
- Crear, editar y listar avisos
- Adjuntar archivos
- Programar envío
- Dirigir a alumnos o apoderados
- Ver resumen de lecturas
- Gráficos de estadísticas

## API Endpoints Utilizados

### Encuestas
- `GET /encuestas/listar` - Listar encuestas
- `POST /encuestas/crear-encuesta` - Crear encuesta
- `PATCH /encuestas/actualizar-encuesta/{id}` - Actualizar encuesta
- `GET /encuestas/catalogos` - Obtener catálogos
- `GET /encuestas/obtener-respuestas` - Obtener respuestas

### Avisos
- `GET /avisosApp/avisos/listar` - Listar avisos
- `POST /avisosApp/avisos/crear` - Crear aviso
- `PATCH /avisosApp/avisos/actualizar/{id}` - Actualizar aviso
- `GET /avisosApp/avisos/resumen` - Obtener resumen

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /perfil/obtener` - Obtener perfil del usuario

## Próximos Pasos

1. Configura `NEXT_PUBLIC_API_BASE_URL` en `.env.local`
2. Verifica que el servidor API esté corriendo
3. Prueba el login
4. Navega a Encuestas y Avisos para verificar funcionamiento
