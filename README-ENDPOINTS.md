# Endpoints usados por la web

Inventario generado desde el codigo fuente del frontend. Fecha de revision: 2026-06-16.

## Como se construyen las URLs

La mayor parte de la web no llama directo al backend. Usa el proxy local de Next:

```txt
Frontend -> /api/proxy/<ruta> -> NEXT_PUBLIC_API_BASE_URL/<ruta>
```

Archivos clave:

- `lib/axios.ts`: define `window.axios` con `baseURL = /api/proxy`.
- `app/api/proxy/[...path]/route.ts`: reenvia GET, POST, PUT, PATCH y DELETE al backend.
- `lib/api-config.ts`: define `fetchWithAuth` y `fetchApi`, ambos usando `/api/proxy`.

Notas:

- `fetchWithAuth(endpoint, options, true)` agrega `colegio_id` automaticamente cuando existe colegio seleccionado, salvo algunas rutas excluidas (`/colegios`, `/preguntas`, `/colegios/usuarios_colegios`).
- `usePaginationSR` agrega `page` y `perPage` a la ruta.
- Los endpoints con `{id}`, `{studentId}`, etc. son rutas dinamicas tomadas desde variables del frontend.
- Algunas rutas llaman directo a `NEXT_PUBLIC_API_BASE_URL` y no pasan por `/api/proxy`; estan marcadas como `Directo`.

## Endpoints via proxy `/api/proxy`

| Metodo | Endpoint backend | Uso / fuente |
|---|---|---|
| GET | `/alumnos` | Listado/paginacion de alumnos. `components/student/table/index.tsx`, `components/notices/form/destiny.tsx`, `components/surveys/form/destiny.tsx`, `services/students-service.ts` |
| GET | `/alumnos/{id}` | Alumno por ID. `services/students-service.ts` |
| GET | `/alumnos/buscar` | Buscar alumnos. `services/header-service.ts` |
| POST | `/alumnos/buscar` | Buscar alumnos con filtros/body. `services/header-service.ts` |
| GET | `/alumnos/detalle/{id}` | Detalle alumno. `app/alumnos/[id]/page.tsx`, `services/students-service.ts` |
| GET | `/alumnos/detalle/{studentId}/emociones/top` | Top emociones alumno. `components/student/student-emotions-section.tsx` |
| GET | `/alumnos/detalle/{studentId}/emociones/comparativa` | Comparativa emociones alumno. `components/student/student-emotions-section.tsx` |
| GET | `/alumnos/detalle/{studentId}/patologias/top` | Top patologias alumno. `components/student/student-emotions-section.tsx` |
| GET | `/alumnos/detalle/{studentId}/neurodivergencias/top` | Top neurodivergencias alumno. `components/student/student-emotions-section.tsx` |
| GET | `/alumnos/alertas` | Listado/paginacion alertas. `components/alerts/table/index.tsx`, `services/alerts-service/index.ts` |
| POST | `/alumnos/alertas` | Crear alerta. `services/alerts-service/index.ts` |
| GET | `/alumnos/alertas/{id}` | Detalle alerta. `app/alertas/[id]/page.tsx`, `services/alerts-service/index.ts`, `services/comparativo-service.ts` |
| PUT | `/alumnos/alertas/{id}` | Actualizar alerta. `services/alerts-service/index.ts` |
| PUT | `/alumnos/alertas/{id}?cambiar_lectura=true` | Marcar alerta como leida. `services/alerts-service/index.ts` |
| GET | `/alumnos/alertas/conteo` | Conteo de notificaciones. `services/header-service.ts` |
| GET | `/alumnos/alertas_bitacoras` | Bitacoras de alerta. `components/alerts/binnacle/table/index.tsx`, `services/alerts-service/index.ts` |
| POST | `/alumnos/alertas_bitacoras` | Crear accion/bitacora. `services/alerts-service/index.ts` |
| GET | `/alumnos/alertas_bitacoras?alumno_alerta_id={alertaId}` | Bitacoras por alerta. `services/alerts-service/index.ts` |
| PUT | `/alumnos/alertas_bitacoras/{bitacoraId}` | Actualizar bitacora. `services/alerts-service/index.ts` |
| DELETE | `/alumnos/alertas_bitacoras/{bitacoraId}` | Eliminar bitacora. `services/alerts-service/index.ts` |
| PUT | `/alumnos/alertas_bitacoras/{alumno_alerta_id}` | Actualizar bitacora por alerta. `services/alerts-service/index.ts` |
| GET | `/alumnos/obtenerAlertasPorId` | Alertas por tipo/colegio. `services/alerts-service/index.ts` |
| PUT | `/alumnos/perfil/update` | Actualizar perfil. `services/profile-service.ts` |
| GET | `/alumnos/informes/{id}` | Informe alumno por ID. `services/reports-service.ts` |
| POST | `/alumnos/informes` | Crear informe alumno. `services/reports-service.ts` |
| POST | `/informes/alumnos` | Obtener informes de alumnos con filtros. `services/students-service.ts` |
| GET | `/informes/generales` | Informes generales. `services/reports-service.ts` |
| POST | `/auditoria` | Registrar auditoria. `lib/audit.ts` |
| POST | `/auth/update-password` | Cambiar password autenticado. `services/auth-service.ts` |
| GET | `/auth/usuarios/` | Usuarios/power users. `services/alerts-service/index.ts` |
| GET | `/auth/usuarios/bitacora` | Usuarios para bitacora. `services/alerts-service/index.ts` |
| POST | `/auth/register` | Registro desde pagina auth. `app/(auth)/register/_page.tsx` |
| GET | `/avisosApp/avisos/listar` | Listado/paginacion avisos. `components/notices/table/index.tsx` |
| POST | `/avisosApp/avisos/crear` | Crear aviso. `components/notices/form/index.tsx` |
| PATCH | `/avisosApp/avisos/actualizar/{avisoId}` | Actualizar aviso. `components/notices/form/index.tsx` |
| DELETE | `/avisosApp/avisos/eliminar/{noticeId}` | Eliminar aviso. `components/notices/modals/delete.tsx` |
| GET | `/avisosApp/avisos/resumen` | Resumen aviso. `components/notices/modals/view.tsx`, `components/surveys/modals/view.tsx` |
| GET | `/colegios` | Listado/colegio por busqueda local. `services/school-service.ts` |
| GET | `/colegios/usuarios_colegios?usuario_id={usuario_id}` | Colegios por usuario. `services/school-service.ts` |
| GET | `/colegios/cursos` | Cursos/colegio. `components/notices/form/destiny.tsx`, `components/student/table/filters.tsx`, `components/surveys/form/destiny.tsx` |
| GET | `/colegios/grados` | Grados. `services/grade-service.ts` |
| GET | `/colores?grouped=true` | Catalogo colores. `services/colores-service.ts` |
| GET | `/comparativa/alerts/totales` | Grafico comparativo alertas totales. `services/alerts-service/index.ts` |
| GET | `/comparativa/alerts/historial` | Historico comparativo alertas. `services/alerts-service/index.ts` |
| GET | `/comparativa/emociones/top-diagnosticos` | Top diagnosticos por emocion. `components/dashboard/emotions/positive-chart.tsx`, `components/dashboard/emotions/negative-chart.tsx` |
| GET | `/comparativa/emociones/grado?grado_id={grado_id}` | Emociones por grado. `services/home-service.ts` |
| GET | `/comparativa/patologias/grado?grado_id={grado_id}` | Patologias por grado. `services/home-service.ts` |
| GET | `/comparativa/emotions/course` | Comparativa emociones por curso. `services/comparativo-service.ts` |
| GET | `/docentes` | Listado docentes. `services/teachers-service.ts` |
| GET | `/docentes/detalle/{id}` | Detalle docente. `services/teachers-service.ts` |
| DELETE | `/docentes/{id}` | Eliminar docente. `services/teachers-service.ts` |
| GET | `/encuestas/listar` | Listado/paginacion encuestas. `components/surveys/table/index.tsx` |
| GET | `/encuestas/catalogos` | Catalogos encuestas. `components/surveys/form/index.tsx`, `components/surveys/table/filters.tsx` |
| POST | `/encuestas/crear-encuesta` | Crear encuesta. `components/surveys/form/index.tsx` |
| PATCH | `/encuestas/actualizar-encuesta/{encuestaId}` | Actualizar encuesta. `components/surveys/form/index.tsx` |
| DELETE | `/encuestas/eliminar-encuesta/{encuestaId}` | Eliminar encuesta. `components/surveys/modals/delete.tsx` |
| GET | `/encuestas/obtener-respuestas` | Obtener respuestas encuesta. `components/surveys/modals/responses.tsx` |
| GET | `/encuestas/{id}/preguntas` | Preguntas encuesta/sociograma. `app/encuestas/[id]/sociograma/page.tsx` |
| GET | `/encuestas/{id}/sociograma` | Sociograma encuesta. `app/encuestas/[id]/sociograma/page.tsx` |
| GET | `/encuestas/tipos/{surveyTypeId}/plantillas` | Plantillas por tipo de encuesta. `components/surveys/form/questions.tsx` |
| GET | `/encuestas/plantillas/{templateId}/preguntas` | Preguntas de plantilla. `components/surveys/form/questions.tsx` |
| GET | `/evaluacion-asistida/catalogos` | Catalogos evaluacion asistida. `app/evaluacion-asistida/page.tsx`, `components/student/detail-sections/events/add-modal.tsx` |
| GET | `/evaluacion-asistida/alumno` | Alumnos evaluacion asistida. `components/assisted-evaluation/table/index.tsx` |
| POST | `/evaluacion-asistida/guardarRespuesta` | Guardar respuesta evaluacion asistida. `components/assisted-evaluation/table/checkbox.tsx`, `components/assisted-evaluation/table/modal.tsx`, `components/student/detail-sections/events/add-modal.tsx` |
| GET | `/evaluacion-asistida/evento_informacion_evento` | Eventos/informacion alumno. `components/student/detail-sections/events/index.tsx` |
| GET | `/home/cards/emociones` | Cards dashboard emociones. `components/dashboard/info-cards.tsx`, `services/home-service.ts` |
| GET | `/home/alertas/recientes` | Alertas recientes home. `services/home-service.ts` |
| GET | `/home/alertas/recientes?estado={estado}` | Alertas recientes por estado. `services/home-service.ts` |
| GET | `/home/alertas/totales` | Totales alertas home. `services/home-service.ts` |
| GET | `/home/fechas/importantes` | Fechas importantes. `services/home-service.ts` |
| GET | `/home/emotions/general` | Emociones generales. `services/home-service.ts` |
| GET | `/home/emotions/general?fecha_hasta={date}` | Emociones generales por fecha. `services/home-service.ts` |
| GET | `/home/barra/patologias` | Barra patologias. `services/home-service.ts` |
| GET | `/home/barra/patologias?fecha_hasta={date}` | Barra patologias por fecha. `services/home-service.ts` |
| GET | `/home/barra/neurodivergencias` | Barra neurodivergencias. `services/home-service.ts` |
| GET | `/home/barra/neurodivergencias?fecha_hasta={date}` | Barra neurodivergencias por fecha. `services/home-service.ts` |
| GET | `/perfil/obtener` | Perfil usuario. `services/profile-service.ts`, `middleware/user-context.tsx` |
| GET | `/personas?rol_id=3` | Equipo Alma. `services/alerts-service/index.ts` |
| GET | `/preguntas` | Preguntas. `services/questions-service.ts` |
| GET | `/alertas/recientes` | Alertas recientes. `services/alerts-service/index.ts`, `services/comparativo-service.ts` |
| GET | `/alertas/alertas_severidades` | Severidades de alerta. `services/alerts-service/index.ts` |
| GET | `/alertas/alertas_prioridades` | Prioridades de alerta. `services/alerts-service/index.ts` |
| GET | `/alertas/alertas_estado` | Estados de alerta. `services/alerts-service/index.ts` |
| GET | `/alertas/alertas_tipos` | Tipos de alerta. `services/alerts-service/index.ts` |

## Endpoints directos a `NEXT_PUBLIC_API_BASE_URL`

Estas llamadas no usan el proxy local.

| Metodo | Endpoint backend | Uso / fuente |
|---|---|---|
| POST | `/auth/login` | Login. `actions/auth.ts` |
| GET | `/perfil/obtener` | Validar perfil despues de login. `actions/auth.ts` |
| POST | `/auth/solicitar/cambio/password` | Solicitar cambio de password. `services/auth-service.ts` |
| POST | `/auth/restore-password` | Restaurar password con codigo. `services/auth-service.ts` |
| POST | `/contacto/almaia` | Contacto. `actions/contact.ts` |
| POST | `/contacto/almaia/soporte` | Soporte. `actions/support.ts` |
| GET | `/beneficios/todos` | Listar beneficios. `services/beneficios.ts` |
| GET | `/beneficios/{beneficioId}` | Detalle beneficio via `fetch`. `services/beneficios.ts` |
| GET | `/beneficios/{id}` | Detalle beneficio via `axios`. `services/beneficios.ts` |

## Endpoints externos

| Metodo | URL | Uso / fuente |
|---|---|---|
| POST | `https://www.google.com/recaptcha/api/siteverify` | Validar reCAPTCHA. `lib/reacaptcha.ts` |

## URLs externas no API

Estas URLs aparecen en la web, pero son enlaces/recursos, no endpoints de backend de la aplicacion:

- `https://almaia.cl/app-android-almaia-v1.0.apk`
- `https://expo.dev/artifacts/eas/83LyqUUVEtF58iUxsFyujf.ipa`
- `https://expo.dev/accounts/dxgabalt/projects/almaia/builds/bc03fd7a-3b1d-48e8-9fec-2b93fd9454e9`
- `https://avatar.iran.liara.run/public`
- `https://storage.colegio.com/...` datos mock de reportes.
- `https://images.unsplash.com/...` datos dummy de beneficios.
- `https://www.coca-cola.com` dato dummy de beneficio.

## Comandos para re-auditar

Busqueda rapida:

```powershell
rg -n "(fetchWithAuth|fetchApi)\(|window\.axios\.(get|post|put|patch|delete)\(|axios\.(get|post|put|patch|delete)\(|fetch\(|usePaginationSR\(" app components services actions lib hooks -S
```

Buscar endpoints construidos con variables:

```powershell
rg -n "endpoint\s*=|baseUrl\s*=|route:\s*" services actions lib hooks app components -S
```

Ver endpoints realmente usados en runtime:

```powershell
rg -n "\[PROXY\]|GET /api/proxy|POST /api/proxy|PUT /api/proxy|PATCH /api/proxy|DELETE /api/proxy" *.log dev-*.log
```
