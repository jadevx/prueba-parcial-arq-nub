# Task API — Proyecto de Prueba

API REST de gestión de tareas. Proyecto de ejemplo para demostrar el pipeline de documentación automática con IA.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tasks` | Listar tareas (filtros: `?status=`, `?priority=`) |
| GET | `/api/tasks/:id` | Obtener tarea |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/stats` | Estadísticas |

## Ejecutar

```bash
npm install
npm start
```

## Pipeline de Documentación

Al hacer push a la rama `docs`, se ejecuta automáticamente un agente IA que:
1. Analiza el código fuente
2. Genera documentación completa
3. Produce un PDF en `docs/documentation.pdf`

El pipeline usa el script de [parcial-arq-nub](https://github.com/jadevx/parcial-arq-nub).

### Configuración

Agregar secret `KIRO_API_KEY` en Settings → Secrets → Actions.
