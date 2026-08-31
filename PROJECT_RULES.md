# 📐 REGLAS Y CONVENCIONES DE DESARROLLO: SECCIÓN "PROJECTS" (E-HOOK)

> **Documento Normativo de Arquitectura y Buenas Prácticas**  
> Aplica para todas las iteraciones, refactorizaciones y nuevas características relacionadas con el módulo de **Proyectos (Projects)** dentro de la plataforma E-hook.

---

## 1. 📂 Estructura y Organización de Código

Para mantener el código modular, mantenible y desacoplado:

### 1.1 Ubicación de Archivos
* **Lógica de Dominio y Renderizado de Proyectos:** `js/modules/projects/` (o métodos claramente delimitados con prefijo `projects_` en la clase principal).
* **Servicio de Datos / API Supabase:** `js/services/projectsService.js` (responsable de consultas, inserciones y mutaciones a la tabla `projects`).
* **Estilos CSS Específicos:** Integrar en `css/styles.css` bajo un bloque claramente comentado:
  ```css
  /* ==========================================================================
     MÓDULO: PROYECTOS (PROJECTS)
     ========================================================================== */
  ```

### 1.2 Convenciones de Nomenclatura
| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Funciones JS** | `camelCase` con verbos de acción | `renderProjectsTab()`, `createProject()`, `deleteProjectById()` |
| **Variables y Propiedades** | `camelCase` descriptivo | `selectedProjectId`, `isSubmittingProject` |
| **Clases CSS** | `kebab-case` con prefijo de bloque | `.project-card`, `.project-grid`, `.project-badge-status` |
| **Identificadores DOM (IDs)** | `kebab-case` único | `id="project-modal-overlay"`, `id="project-filter-category"` |
| **Columnas Base de Datos (Supabase)** | `snake_case` | `project_title`, `creator_id`, `demo_url`, `created_at` |
| **Eventos Personalizados** | `kebab-case` o callbacks estándar | `window.app.handleProjectSubmit(event)` |

---

## 2. 🔄 Gestión del Estado y Flujo de Datos

### 2.1 Arquitectura del Estado (Dual-Layer Reactive State)
1. **Estado en Memoria (`this.state.projects`):** La interfaz siempre lee de forma reactiva de `this.state.projects`.
2. **Persistencia Local (`LocalStorage`):** Cada mutación mediante `this.updateState()` guarda el snapshot local en la clave de versión activa (ej. `skoolx_platform_state_v30`).
3. **Sincronización en la Nube (`Supabase`):**
   - **Lectura:** Al iniciar sesión o cambiar de pestaña, se invoca `loadProjectsFromSupabase()`.
   - **Escritura (Optimistic UI):** Se actualiza el estado local inmediatamente (interfaz instantánea), se muestra el Toast de éxito y se sincroniza en segundo plano con `syncProjectToSupabase(projectData)`.

### 2.2 Manejo de Estados de Carga y Errores
* **Loading State:** Mostrar un Skeleton animado o spinner discreto mientras se obtienen los proyectos por primera vez.
* **Empty State:** Si `projects.length === 0`, renderizar una tarjeta amigable con botón de llamada a la acción (CTA): *"Aún no hay proyectos publicados. ¡Sé el primero en crear uno!"*.
* **Error Fallback:** En caso de fallo de red en Supabase, registrar con `console.warn` y notificar al usuario con `this.showToast('No se pudo sincronizar el proyecto con la nube', 'warning')` manteniendo la copia local en memoria.

---

## 3. 🎨 Diseño, UI y Experiencia de Usuario (UI/UX)

### 3.1 Respeto Estricto al Design System (`css/styles.css`)
Queda **estrictamente prohibido** usar colores hexadecimales o estilos inline no estandarizados. Utilizar siempre las variables de diseño existentes:
* **Fondos:** `var(--bg-primary)`, `var(--bg-card)`, `var(--bg-sidebar)`
* **Acentos:** `var(--accent-primary)`, `var(--accent-secondary)`, `var(--accent-hover)`
* **Bordes y Sombras:** `var(--border-color)`, `var(--border-highlight)`, `var(--shadow-card)`
* **Tipografía y Textos:** `var(--text-main)`, `var(--text-muted)`, `var(--font-sans)`
* **Bordes Redondeados:** `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`

### 3.2 Iconografía y Sanitización
* **Lucide Icons:** Toda acción o botón debe contar con su icono semántico (`<i data-lucide="..."></i>`). Tras cada render dinámico de HTML, es **obligatorio** ejecutar `if (window.lucide) window.lucide.createIcons();`.
* **Sanitización XSS:** Todo texto ingresado por el usuario (títulos, descripciones, enlaces demo/GitHub) debe pasar obligatoriamente por `DOMPurify.sanitize()` o `this.sanitizeHTML()` antes de incrustarse en el DOM.

### 3.3 Responsividad
* El layout de proyectos debe usar **CSS Grid con `minmax()`** o Flexbox responsivo:
  ```css
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  ```
* Garantizar legibilidad y botones táctiles adecuados ($\ge 44\text{px}$) en pantallas móviles ($\le 768\text{px}$).

---

## 4. 🛡️ Seguridad, Permisos y Reglas de Negocio

### 4.1 Jerarquía de Permisos en Proyectos
* **Estudiantes (`student`):**
  - Pueden crear y publicar sus propios proyectos.
  - Pueden editar o eliminar **únicamente** los proyectos creados por ellos (`creator_id === auth.uid()`).
  - Límite preventivo de proyectos por estudiante: máximo 10 proyectos activos.
* **Super Admin (`role === 'superadmin'`):**
  - Puede moderar, editar, destacar o eliminar cualquier proyecto de la plataforma.

### 4.2 Esquema SQL Requerido para la Tabla `projects` en Supabase
```sql
CREATE TABLE public.projects (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text DEFAULT 'General',
  cover_url text,
  demo_url text,
  repo_url text,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name text,
  creator_avatar text,
  likes_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Políticas RLS:
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proyectos visibles públicamente" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear proyectos" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() is not null);

CREATE POLICY "Creador o Super Admin pueden editar proyecto" ON public.projects
  FOR UPDATE USING (auth.uid() = creator_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');

CREATE POLICY "Creador o Super Admin pueden eliminar proyecto" ON public.projects
  FOR DELETE USING (auth.uid() = creator_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin');
```

### 4.3 Control de Caché y Cero Regresiones
* **Cache-Busting Obligatorio:** Al realizar modificaciones en `js/app.js` o `css/styles.css`, se debe incrementar el sufijo de versión en `index.html` (ej: `js/app.js?v=31`) y la constante `STORAGE_KEY` en `js/services/storage.js`.
* **Cero Regresiones:** Las nuevas vistas o botones de Proyectos no deben romper ni interferir con las secciones de **Aulas/Cursos**, **Noticias**, **Comunidad**, **Clasificación** o el **Panel de Administración**.

---

## 5. ✅ Checklist de Calidad antes de Cerrar una Tarea

Antes de dar por completado cualquier cambio o commit en el módulo de Proyectos:

- [ ] **Validación Sintáctica:** Ejecutar validación ESM en Node (`node --input-type=module ...`) para asegurar 0 errores de sintaxis.
- [ ] **Consola Limpia:** Comprobar en el navegador que no existan advertencias ni errores en la consola (`Console Tab`).
- [ ] **Lucide Icons Renderizados:** Comprobar que todos los iconos Lucide se visualizan correctamente (sin cajas vacías).
- [ ] **Sanitización Verificada:** Probar inyectar etiquetas HTML como `<script>` o `<img>` en inputs de proyectos para confirmar que DOMPurify las neutraliza.
- [ ] **Persistencia y Sincronización:** Crear, editar y eliminar un proyecto de prueba y verificar que el cambio se refleje en Supabase.
- [ ] **Layout Responsivo:** Probar el ajuste visual en modo móvil ($\approx 375\text{px}$) y escritorio ($\ge 1200\text{px}$).
- [ ] **Cache Bumping & Commit Limpio:** Incrementar versión de cache-busting, hacer commit con mensaje descriptivo y push a `main`.
