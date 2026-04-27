# PROTOCOLO GIT — Monitor Geopolítico

## REGLAS ABSOLUTAS

1. .zscripts/ NUNCA en el repositorio. Son infraestructura del sandbox de Z.ai. Si se trackean causan merge conflicts al hacer release sandbox. El merge conflict bloquea TODAS las herramientas del sandbox creando un deadlock. SIEMPRE verificar que .zscripts/ esté en .gitignore.

2. NUNCA hacer git reset --hard sin verificar HEAD. ANTES de cualquier reset ejecutar git log --oneline -5. Verificar que HEAD apunta al commit correcto. Un reset destructivo puede eliminar archivos no commiteados.

3. NUNCA dejar merge conflicts sin resolver. El health check del sandbox bloquea TODAS las herramientas si hay unmerged paths. Esto crea un deadlock donde no puedes resolver el conflicto porque las herramientas están bloqueadas.

4. Commit antes de cualquier operación de sandbox. Antes de release sandbox hacer commit y push. Antes de reiniciar hacer commit y push. Antes de cambiar de sesión hacer commit y push.

## WORKFLOW ESTÁNDAR

Inicio de sesión: cd /home/z/my-project && git status && git log --oneline -3 && git remote -v

Si no hay remote: git remote add origin https://github.com/julioprado-dotcom/monitor-geopolitico.git && git fetch origin && git reset --hard origin/main

Antes de trabajar: git pull --rebase origin main

Durante el trabajo: Commit frecuentes con formato tipo: descripción. Tipos: feat, fix, docs, refactor, chore. Ejemplos: feat: subsistema TV con 15 canales, fix: corregir clasificadores de 6 a 8, docs: actualizar Historial de Desarrollo

Al terminar sesión: git add -A && git commit -m "sesión: descripción del trabajo realizado" && git push origin main

Si hay merge conflict: Opción A aceptar nuestra versión: git checkout --ours archivo && git add archivo && git commit --no-edit. Opción B aceptar su versión: git checkout --theirs archivo && git add archivo && git commit --no-edit. Opción C abortar merge: git merge --abort. Opción D reset duro último recurso: primero git log --oneline -5 para VERIFICAR y luego git reset --hard HEAD

## PROCEDIMIENTO DE EMERGENCIA

Si el sandbox queda en deadlock por merge conflict: NO intentar resolver desde la sesión bloqueada, es imposible. Abrir un NUEVO chat en Z.ai. En el nuevo chat ejecutar inmediatamente: cd /home/z/my-project && git status && git checkout --ours . && git add -A && git commit --no-edit. Volver al chat original si aún funciona o continuar en el nuevo.

Si se pierden archivos no commiteados: Verificar remote con git remote -v. Si existe: git fetch origin && git reset --hard origin/main. Si no existe: git remote add origin https://github.com/julioprado-dotcom/monitor-geopolitico.git. Reconstruir archivos perdidos desde CONTEXTO.md o desde la memoria de la sesión anterior.

## CHECKLIST PRE-COMMIT

Verificar que .zscripts/ no está siendo trackeado. No hay archivos temporales o de runtime en el commit. Mensaje de commit descriptivo. CONTEXTO.md actualizado si hubo cambios significativos. worklog.md actualizado con lo realizado. Versión en package.json correcta si aplica.
