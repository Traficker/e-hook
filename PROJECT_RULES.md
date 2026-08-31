# 📜 REGLAS Y CONVENCIONES DE DESARROLLO — PLATAFORMA E-HOOK
**Sección / Módulo:** Proyectos y Gestión de la Plataforma  
**Stack:** Vanilla JavaScript (ES Modules), Supabase JS v2, CSS3 Custom Properties, DOMPurify, Lucide Icons.

---

## 1. 🏗️ Estructura y Arquitectura de Código

1. **Modularidad & ES Modules:**
   - Todo código nuevo debe modularizarse bajo la carpeta `js/` (`js/services/`, `js/components/` o submódulos dedicados si se requiere).
   - Mantener `js/app.js` como orquestador central o delegar la renderización de vistas complejas a módulos dedicados importados limpiamente.

2. **Convenciones de Nombres:**
   - **Funciones & Métodos:** `camelCase` (ej. `renderProjectsView()`, `syncProjectToSupabase()`).
   - **Clases & Objetos Principales:** `PascalCase` (ej. `ProjectService`, `App`).
   - **Constantes & Claves de Configuración:** `UPPER_SNAKE_CASE` (ej. `PROJECTS_STORAGE_KEY_V1`).
   - **Clases CSS:** `kebab-case` con prefijos temáticos (ej. `.project-card`, `.project-header`, `.project-status-badge`).

---

## 2. ⚡ Gestión de Estado y Persistencia

1. **Flujo de Datos Reactivo:**
   - Seguir el patrón unificado de la aplicación:
     1. Mutar el estado en memoria (`this.state.projects`).
     2. Disparar `this.updateState()` para re-renderizado reactivo sin recargar la página.
     3. Persistir en `LocalStorage` (`storage.js`) para disponibilidad offline/inmediata.
     4. Sincronizar en segundo plano con **Supabase** (`supabase.js`).

2. **Manejo de Errores y Loading States:**
   - Utilizar *skeletons* o spinners de carga mientras se sincronizan datos con Supabase.
   - En caso de fallas de red, mantener los datos locales e informar al usuario mediante alertas no invasivas (toasts/banners).

---

## 3. 🎨 Sistema de Diseño y UI/UX

1. **Variables y Tema:**
   - Usar exclusivamente las variables CSS existentes en `css/styles.css` (`--bg-primary`, `--bg-secondary`, `--text-primary`, `--accent-color`, `--border-color`, etc.).
   - No hardcodear colores HEX/RGB fuera del sistema de tokens CSS.

2. **Iconografía y Componentes Visuales:**
   - Usar **Lucide Icons** mediante `<i data-lucide="icon-name"></i>`.
   - Llamar siempre a `lucide.createIcons()` después de cada renderizado del DOM dinámico.

3. **Gamificación y Feedback Visual:**
   - Usar `canvas-confetti` al completar hitos, entregas o aprobaciones de proyectos relevantes.

---

## 4. 🔒 Seguridad y Sanitización (XSS & RLS)

1. **Sanitización Obligatoria:**
   - **Cualquier entrada de texto HTML / WYSIWYG de usuarios** (títulos, descripciones, comentarios de proyectos) **DEBE** ser procesada por `DOMPurify.sanitize(content)` antes de inyectarla con `innerHTML`.

2. **Seguridad en Supabase (RLS):**
   - Respetar los roles (`student`, `admin`, `superadmin`):
     - `student`: Solo puede crear, editar o eliminar sus propios proyectos/entregas (`creator_id = auth.uid()`).
     - `superadmin`: Acceso y moderación global.
   - Validar permisos en cliente antes de renderizar botones de acción destructiva (Eliminar / Editar).

---

## 5. 🚀 Despliegue y Anti-Caché

1. **Versionamiento de Assets:**
   - Cada cambio estructural en `js/app.js` o `css/styles.css` debe incrementar el parámetro de versión en `index.html` (ej. `?v=31`).
   - Mantener las cabeceras HTTP anti-caché en `index.html` intactas.

---

## 6. ✅ Checklist de Calidad antes de Cerrar una Tarea

- [ ] Sin errores en la consola del navegador (`F12`).
- [ ] Renderizado responsivo verificado en móvil (375px) y escritorio (1440px).
- [ ] Iconos de Lucide renderizados correctamente sin etiquetas vacías.
- [ ] Datos persistidos localmente y sincronizados con Supabase.
- [ ] Entradas de usuario sanitizadas con DOMPurify.
- [ ] No interferir con los módulos existentes (Aulas, Cursos, Selector, Teclas de atajo).
