# STARTER PROMPT — Nuevo Proyecto en Z.ai

Instrucciones de uso: 1) Copia todo el contenido de la sección PROMPT COMPLETO abajo. 2) Reemplaza todo lo que está entre corchetes con los datos de tu proyecto. 3) Si tu proyecto NO tiene paradigmas filosóficos especiales, elimina la sección 5 del CONTEXTO.md. 4) Pega el prompt como primer mensaje en un nuevo chat de Z.ai.

PROMPT COMPLETO:

Estoy iniciando un nuevo proyecto en Z.ai. Antes de escribir cualquier código, necesito que ejecutes los siguientes pasos en orden exacto. NO saltes ninguno.

PASO 0 — VERIFICACIÓN DEL ENTORNO

Ejecuta estos comandos y reporta los resultados:
pwd
git status
git log --oneline -3
git remote -v
ls -la
ls -la .zscripts/ 2>/dev/null || echo "NO EXISTE .zscripts/"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "NO HAY SERVIDOR"
cat .gitignore 2>/dev/null || echo "NO HAY .gitignore"

Si hay merge conflicts en git, RESUELVELOS ANTES de continuar:
git status
git checkout --ours . && git add -A && git commit --no-edit

Si git está limpio, continúa al paso 1.

PASO 1 — CONFIGURAR GIT Y GITHUB

1a. Si NO hay remote de GitHub:
git remote add origin [URL_DE_TU_REPO_GITHUB]
git fetch origin
git branch -a

1b. Si HAY remote:
git fetch origin
git pull --rebase origin main

1c. Verificar que .gitignore incluye estas líneas (agregar si faltan):
.zscripts/
worklog.md
download/
node_modules/
.env
.env.local

1d. Commit si hay cambios:
git add .gitignore
git commit -m "chore: configurar .gitignore para Z.ai sandbox"

PASO 2 — CREAR DOCUMENTOS ESENCIALES

Crea estos 4 archivos en /home/z/my-project/:

2a. CONTEXTO.md con este contenido:

# CONTEXTO — [NOMBRE DEL PROYECTO]

## 1. PROTOCOLO DE ACCIÓN INMEDIATA

Diagnóstico del Preview (5 pasos):
1. Verificar servidor: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
2. Si devuelve 000 → servidor caído. NO ejecutar bun run dev manualmente.
3. Verificar .zscripts/dev.sh: ls -la .zscripts/dev.sh
4. Si NO existe, crearlo (ver contenido abajo)
5. Verificar Caddy: curl -s -o /dev/null -w "%{http_code}" http://localhost:81

LO QUE NO SE DEBE HACER:
- NUNCA ejecutar bun run dev manualmente — colapsa el panel de preview
- NUNCA trackear .zscripts/ en git — causa merge conflicts mortales
- NUNCA dejar merge conflicts sin resolver — bloquea TODAS las herramientas
- NUNCA hacer git reset --hard sin verificar primero qué commit es HEAD
- NUNCA asumir que el remote de GitHub está configurado — siempre verificar

Contenido de .zscripts/dev.sh:
#!/bin/bash
cd /home/z/my-project
bun install 2>/dev/null || true
bun run db:push 2>/dev/null || true
nohup bun run dev > /tmp/next-dev.log 2>&1 &
echo $! > /tmp/next-dev.pid
echo "Dev server started with PID $(cat /tmp/next-dev.pid)"

Arquitectura del Sandbox Z.ai:
- /start.sh (PID 1 via tini) arranca todo
- Si .zscripts/dev.sh existe → lo ejecuta como entry point personalizado
- Si NO existe → ejecuta bun install → bun run db:push → bun run dev automáticamente
- Caddy (PID 2) proxy puerto 81 → 3000 para el panel de preview
- Health check: si hay merge conflicts en git, bloquea TODAS las herramientas (deadlock)
- Cada sesión de chat es independiente — no comparte estado con sesiones anteriores
- Si una sesión queda en deadlock por merge conflict, es IRRECUPERABLE — hay que abrir nuevo chat

## 2. IDENTIDAD DEL PROYECTO

Nombre: [NOMBRE]
Versión: [VERSIÓN]
Repositorio: [URL_GITHUB]
Descripción: [DESCRIPCIÓN DE 2-3 LÍNEAS]

## 3. STACK TECNOLÓGICO

[LISTAR FRAMEWORK, LENGUAJE, DB, ETC.]

## 4. ESTRUCTURA DEL PROYECTO

[DESCRIBIR CARPETAS Y ARCHIVOS PRINCIPALES]

## 5. PARADIGMAS Y PRINCIPIOS DEL PROYECTO

[ESTA SECCIÓN ES ESPECÍFICA DE CADA PROYECTO. INCLUIR AQUÍ LOS MARCOS CONCEPTUALES, FILOSOFÍA, PARADIGMAS EPISTEMOLÓGICOS, O CUALQUIER PRINCIPIO FUNDAMENTAL QUE DEBA GUIAR TODAS LAS DECISIONES. SI EL PROYECTO NO TIENE PARADIGMAS ESPECIALES, ELIMINAR ESTA SECCIÓN ENTERA.]

Ejemplo de estructura para proyectos con marco epistemológico:
- Corriente filosófica: [NOMBRE]
- Principios operativos: [LISTA]
- Tabla de correspondencia: [SI APLICA]
- AVISO CRÍTICO: Estos paradigmas son el ADN del proyecto. Cada decisión técnica debe ser consistente con ellos. Si un agente propone algo que los contradice, está proponiendo algo incorrecto.

## 6. ESTADO DE DOCUMENTACIÓN

[LISTAR DOCUMENTOS CON ESTADO: COMPLETO O PENDIENTE Y ACCIÓN REQUERIDA]

## 7. TAREAS PENDIENTES

Prioridad 1 — MÁXIMA: [LISTAR]
Prioridad media: [LISTAR]
Prioridad baja: [LISTAR]

## 8. PREFERENCIAS DEL USUARIO

- Idioma: [ESPAÑOL/INGLÉS/OTRO]
- Metodología: Analiza, investiga y resuelve. No supongas ni hagas intentos a lo loco.
- Formato de entregas: [PDF/DOCX/OTRO]
- Git: Trabajar con protocolo claro, no actualizar el repo hasta estar listos

## 9. PROBLEMAS RESUELTOS / LECCIONES APRENDIDAS

1. Preview colapsa → .zscripts/dev.sh con nohup; NO ejecutar bun run dev manualmente
2. Merge conflict deadlock → .zscripts/ en .gitignore; si ocurre, abrir nuevo chat
3. git reset --hard sin verificar → Puede destruir archivos no commiteados. SIEMPRE verificar HEAD primero
4. Sesiones no comparten estado → CONTEXTO.md y worklog.md son la memoria persistente
5. Health check cacheado → Sesión en deadlock es irrecuperable, continuar en nuevo chat
6. Remote de GitHub no persiste entre sandboxes → Siempre verificar con git remote -v

## 10. PROTOCOLO GIT

Ver archivo: PROTOCOLO_GIT.md

2b. PROTOCOLO_GIT.md con este contenido:

# PROTOCOLO GIT — [NOMBRE DEL PROYECTO]

REGLAS ABSOLUTAS:

1. .zscripts/ NUNCA en el repositorio. Son infraestructura del sandbox. Si se trackean causan merge conflicts al hacer release sandbox. El merge conflict bloquea TODAS las herramientas (deadlock). SIEMPRE verificar que .zscripts/ esté en .gitignore.

2. NUNCA hacer git reset --hard sin verificar HEAD. ANTES de cualquier reset ejecutar git log --oneline -5. Verificar que HEAD apunta al commit correcto. Un reset destructivo puede eliminar archivos no commiteados.

3. NUNCA dejar merge conflicts sin resolver. El health check del sandbox bloquea TODAS las herramientas si hay unmerged paths. Deadlock: no puedes resolver el conflicto porque las herramientas están bloqueadas.

4. Commit antes de cualquier operación de sandbox. Antes de release sandbox → commit + push. Antes de reiniciar → commit + push. Antes de cambiar de sesión → commit + push.

5. NUNCA ejecutar bun run dev manualmente. El sandbox lo ejecuta automáticamente. Ejecutarlo manualmente interfiere y colapsa el panel de preview.

WORKFLOW ESTÁNDAR:

Inicio de sesión: cd /home/z/my-project && git status && git log --oneline -3 && git remote -v

Si no hay remote: git remote add origin [URL_GITHUB] && git fetch origin && git reset --hard origin/main

Antes de trabajar: git pull --rebase origin main

Durante el trabajo: Commit frecuentes con formato tipo: descripción. Tipos: feat, fix, docs, refactor, chore.

Al terminar sesión: git add -A && git commit -m "sesión: descripción" && git push origin main

Si hay merge conflict:
Opción A: git checkout --ours archivo && git add archivo && git commit --no-edit
Opción B: git checkout --theirs archivo && git add archivo && git commit --no-edit
Opción C: git merge --abort
Opción D (último recurso): git log --oneline -5 PRIMERO, luego git reset --hard HEAD

PROCEDIMIENTO DE EMERGENCIA:

Si sandbox queda en deadlock por merge conflict:
1. NO intentar resolver desde la sesión bloqueada — es imposible
2. Abrir NUEVO chat en Z.ai
3. En el nuevo chat ejecutar: cd /home/z/my-project && git status && git checkout --ours . && git add -A && git commit --no-edit
4. Continuar en el nuevo chat (la sesión bloqueada es irrecuperable)

Si se pierden archivos no commiteados:
1. git remote -v (verificar que existe)
2. Si existe: git fetch origin && git reset --hard origin/main
3. Si no: git remote add origin [URL_GITHUB] y luego fetch + reset
4. Reconstruir desde CONTEXTO.md o memoria de sesión anterior

CHECKLIST PRE-COMMIT:
- .zscripts/ no está siendo trackeado
- No hay archivos temporales o de runtime en el commit
- Mensaje de commit descriptivo
- CONTEXTO.md aktualizado si hubo cambios significativos
- worklog.md aktualizado con lo realizado
- Versión correcta si aplica

2c. worklog.md con este contenido:

# Worklog — [NOMBRE DEL PROYECTO]

Task ID: 1
Agent: [NOMBRE AGENTE]
Task: Inicialización del proyecto

Work Log:
- Verificado entorno Z.ai (git, sandbox, preview)
- Configurado remote de GitHub
- Creados documentos esenciales: CONTEXTO.md, PROTOCOLO_GIT.md, worklog.md
- Verificado .gitignore con exclusiones de sandbox
- Conectado a repositorio remoto

Stage Summary:
- Entorno listo para desarrollo
- Documentación base creada
- Repositorio sincronizado con GitHub

2d. Verificar .zscripts/dev.sh:

Si .zscripts/dev.sh NO existe, créalo:
mkdir -p .zscripts
cat > .zscripts/dev.sh << 'EOF'
#!/bin/bash
cd /home/z/my-project
bun install 2>/dev/null || true
bun run db:push 2>/dev/null || true
nohup bun run dev > /tmp/next-dev.log 2>&1 &
echo $! > /tmp/next-dev.pid
echo "Dev server started with PID $(cat /tmp/next-dev.pid)"
EOF
chmod +x .zscripts/dev.sh

PASO 3 — COMMIT INICIAL

cd /home/z/my-project
git add CONTEXTO.md PROTOCOLO_GIT.md .gitignore
git commit -m "docs: crear documentos esenciales del proyecto y protocolo Git"
git push origin main

PASO 4 — VERIFICACIÓN FINAL

Ejecuta y reporta:
git status
git log --oneline -3
git remote -v
ls -la CONTEXTO.md PROTOCOLO_GIT.md worklog.md
cat .gitignore | grep -E "zscripts|worklog|download"

PASO 5 — CONFIRMAR

Responde con: "Proyecto inicializado. Entorno listo. [NOMBRE DEL PROYECTO] en commit [HASH]."

Luego lee CONTEXTO.md completo para entender el proyecto y sus principios.

NOTAS DE PERSONALIZACIÓN:

Antes de usar este prompt, reemplaza: [NOMBRE DEL PROYECTO], [URL_DE_TU_REPO_GITHUB], [VERSIÓN], [DESCRIPCIÓN], Sección 5 del CONTEXTO.md con tus paradigmas (o elimínala si no aplica), Sección 6 con tus documentos, Sección 7 con tus tareas, Sección 8 con tus preferencias, [URL_GITHUB] en PROTOCOLO_GIT.md.

Lo que NO necesitas cambiar (universal para Z.ai): Todo el Paso 0, Todo el Paso 1, Sección 1 del CONTEXTO.md, Todo el PROTOCOLO_GIT.md excepto la URL, Los pasos 3, 4 y 5.
