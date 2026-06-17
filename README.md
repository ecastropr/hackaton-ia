# MCP para Hackatón IA

Guía base para montar un servidor MCP (Model Context Protocol) que ayude a participantes con reglas claras, validación previa y soporte de depuración cuando el prompting no sea bueno.

## Inicio rapido

1. Instala dependencias:

pnpm install

2. Inicia el servidor:

npm run dev

3. Verifica salud:

GET http://localhost:3000/health

4. Valida una solicitud de ejemplo:

POST http://localhost:3000/validate
Body: examples/request-valid.json

## Adicionar el MCP en VS Code configurando el local server en el MCP user Configuration de tu extensión de IA:

### Paso 1: Instalar Claude Code Extension
1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca "Claude" y selecciona "Claude Code"
4. Haz clic en "Install"
5. Reinicia VS Code cuando se pida

### Paso 2: Instalar Gemini Extension
1. Ve a Extensions (Ctrl+Shift+X)
2. Busca "Google Gemini API" o "Gemini"
3. Instala la extensión oficial
4. Configura tu API key de Google Gemini en settings

### Paso 3: Instalar Claude Code Copilot Extension
1. Ve a Extensions (Ctrl+Shift+X)
2. Busca "Claude Code Copilot"
3. Haz clic en "Install"
4. Reinicia VS Code

### Paso 4: Configurar MCP en VS Code

Crea o edita el archivo `.vscode/mcp.config.json`:

```json
{
	"servers": {
		"my-local-server": {
			"type": "http",
			"url": "http://localhost:3000/sse"
		}
	}
}
```

### Paso 5: Conectar las extensiones

#### GitHub Copilot Chat
1. Ve a Extensions (Ctrl+Shift+X)
2. Busca "GitHub Copilot Chat"
3. Haz clic en "Install"
4. Inicia sesión con tu cuenta GitHub
5. Reinicia VS Code

#### Cline (Claude en VS Code)
1. Ve a Extensions (Ctrl+Shift+X)
2. Busca "Cline"
3. Haz clic en "Install"
4. Configura tu API key de Claude en settings
5. En configuración, apunta al archivo `.vscode/mcp.config.json`

#### Paso 5.1: Configurar MCP en extensiones
1. Abre la paleta de comandos (Ctrl+Shift+P)
2. Según la extensión:
   - Claude Code: "Claude: Configure MCP"
   - GitHub Copilot Chat: "Copilot: Configure MCP"
   - Cline: Accede a los settings de la extensión
3. Apunta a tu archivo `.vscode/mcp.config.json`
4. Verifica que el servidor local esté corriendo en `http://localhost:3000`

### Paso 6: Verificar conexión
1. En VS Code, abre el panel de la extensión (Claude, Copilot o Cline)
2. Prueba con una solicitud simple
3. Deberías recibir respuesta del servidor MCP local

## Politicas del evento

- Stack exclusivo: policy/STACK_POLICY.json
- Seguridad de dependencias: policy/DEPENDENCY_POLICY.json
- Validacion de requisitos: policy/VALIDATION_POLICY.json

## Endpoints disponibles

- GET /health
- POST /validate
- POST /ask

## Objetivos

- Validar requisitos antes de ejecutar consultas costosas o herramientas externas.
- Estandarizar tecnologías y entregables para todos los equipos.
- Reducir errores de uso con plantillas y flujos guiados.
- Activar modo depuración cuando la solicitud del participante sea ambigua o incompleta.

## Principios de diseño

1. Validar primero, responder después.
2. Reglas explícitas y medibles.
3. Trazabilidad: toda respuesta debe indicar qué validó.
4. Fallback seguro: ante duda, pedir aclaración y no inventar.

## Flujo recomendado del MCP

1. Recepción de solicitud del usuario.
2. Clasificación de intención:
	 - `build`: crear código o arquitectura.
	 - `debug`: resolver error existente.
	 - `review`: evaluar calidad/riesgos.
	 - `learn`: explicación o guía.
3. Validación de requisitos mínimos (gate).
4. Si falla el gate: devolver faltantes y activar guía de prompting.
5. Si pasa el gate: ejecutar herramientas permitidas.
6. Generar respuesta con evidencia de validación.

## Reglas de validación previas (Gate)

La IA debe verificar estos campos antes de consultar herramientas:

- `objetivo`: qué quiere lograr el equipo.
- `contexto`: stack, repo o entorno.
- `restricciones`: tiempo, versión, seguridad.
- `criterio_exito`: cómo sabrán que quedó bien.

Regla operativa:

- Si faltan 2 o más campos: no ejecutar herramientas y pedir información estructurada.
- Si falta 1 campo: continuar con advertencia y suposición explícita.
- Si no falta ninguno: continuar normal.

## Contrato de entrada sugerido

```json
{
	"objetivo": "Crear endpoint de autenticacion",
	"contexto": {
		"lenguaje": "TypeScript",
		"framework": "NestJS",
		"base_datos": "PostgreSQL"
	},
	"restricciones": ["No usar servicios pagos", "Tiempo maximo: 36h"],
	"criterio_exito": "Login y refresh token funcionando con pruebas"
}
```

## Lineamientos de tecnologías

Define una matriz fija por categoría para evitar dispersión:

- Backend: `Node.js + TypeScript`.
- API: `Fastify` o `NestJS`.
- Frontend: `React + Vite`.
- Base de datos: `PostgreSQL`.
- ORM: `Prisma`.
- Testing: `Vitest` o `Jest`.
- Calidad: `ESLint + Prettier`.
- Infra local: `Docker Compose`.

Política:

- Fuera de esta lista, solo con justificación técnica y aprobación del mentor.

## Reglas de respuesta de la IA

Toda respuesta debe incluir:

1. Estado de validación (`aprobado`, `parcial`, `rechazado`).
2. Suposiciones hechas (si existen).
3. Pasos accionables cortos.
4. Riesgos o límites.

Formato sugerido:

```txt
Validacion: APROBADO
Suposiciones: Ninguna
Plan: 1) ... 2) ... 3) ...
Riesgos: ...
```

## Modo depuración por errores de prompting

Cuando la solicitud del participante sea confusa, activar `modo_debug_prompt`:

1. Detectar problema:
	 - objetivo difuso,
	 - falta de contexto,
	 - tarea demasiado amplia,
	 - mezcla de multiples tareas sin prioridad.
2. Devolver plantilla guiada:

```txt
Ayudame a ayudarte. Completa:
1) Objetivo exacto:
2) Codigo/archivo afectado:
3) Error actual (mensaje literal):
4) Resultado esperado:
5) Restricciones (tiempo, stack, seguridad):
```

3. Reintentar con la nueva entrada.

## Guardrails para hackatón

- No inventar APIs o librerías inexistentes.
- No exponer secretos o tokens.
- No sugerir pasos que rompan datos sin advertencia.
- Si hay incertidumbre alta, priorizar pregunta aclaratoria.

## Métricas que vale la pena medir

- Porcentaje de solicitudes que pasan el gate a la primera.
- Tiempo promedio a primera respuesta útil.
- Errores evitados por modo debug prompt.
- Satisfacción de participantes por equipo.

## Implementación mínima (MVP)

1. Definir schema JSON de entrada.
2. Crear middleware de validación.
3. Implementar clasificador de intención simple (regex + reglas).
4. Integrar respuesta con formato de validación.
5. Activar modo depuración cuando falle gate.

## Prompt del sistema sugerido para tu MCP

```txt
Eres un asistente de hackaton. Antes de usar herramientas, valida: objetivo, contexto,
restricciones y criterio_exito. Si faltan 2 o mas campos, no ejecutes herramientas y
pide informacion estructurada. Si falta 1 campo, continua con suposicion explicita.
Siempre responde con: estado de validacion, suposiciones, pasos accionables y riesgos.
Si la solicitud es ambigua, activa modo_debug_prompt y pide los 5 campos guiados.
```

## Siguiente paso recomendado

Crear un servidor MCP con dos componentes iniciales:

- `validator`: aplica gate y clasifica intención.
- `orchestrator`: decide qué herramientas llamar solo si el gate aprueba.

Con esto tendrás una base robusta para que participantes usen mejor la IA, incluso cuando no tengan mucha experiencia escribiendo prompts.
