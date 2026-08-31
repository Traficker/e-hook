import { getSupabase, isSupabaseReady } from './supabaseClient.js';

const STORAGE_PROJECTS_KEY = 'skoolx_projects_cache_v31';

export const INITIAL_SAMPLE_PROJECTS = [
  {
    id: "proj_sample_1",
    title: "Ecosistema de Ventas WhatsApp Business + Meta Ads",
    description: "Configuración integral de catálogo, respuestas rápidas automatizadas y campaña de mensajes en Meta Ads con costo por lead optimizado a $0.15 USD.",
    cover_url: "https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=800&q=80",
    demo_url: "https://wa.me/ejemplo",
    repo_url: "",
    tags: ["WhatsApp Business", "Meta Ads", "E-commerce"],
    creator_id: "usr_instructor",
    creator_name: "Diego Morales (Instructor)",
    creator_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    likes_count: 18,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "proj_sample_2",
    title: "Tienda Shopify de Nicho con Dropshipping Local",
    description: "Tienda optimizada para conversión móvil con pasarela de pago contra-entrega, checkout de 1 paso y pixel de Facebook configurado con API de Conversiones.",
    cover_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    demo_url: "https://ejemplo-tienda.myshopify.com",
    repo_url: "https://github.com/ejemplo/shopify-custom-theme",
    tags: ["Shopify", "Dropshipping", "Meta Ads"],
    creator_id: "usr_101",
    creator_name: "Carlos Mendoza",
    creator_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    likes_count: 9,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export class ProjectsService {
  /**
   * Carga la lista de proyectos desde Supabase con fallback a cache local / samples
   */
  static async fetchProjects() {
    // 1. Intentar cargar desde Supabase si está disponible
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          this.saveLocalCache(data);
          return data;
        } else if (error) {
          console.warn('⚠️ No se pudo consultar tabla projects en Supabase (puede que aún no exista la tabla):', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Error de conexión con Supabase projects:', err);
      }
    }

    // 2. Fallback: LocalStorage o datos iniciales de ejemplo
    return this.loadLocalCache();
  }

  /**
   * Crea un nuevo proyecto en Supabase y localmente
   */
  static async createProject(projectData, currentUser) {
    const newProject = {
      id: "proj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      title: projectData.title.trim(),
      description: projectData.description.trim(),
      cover_url: projectData.cover_url?.trim() || "",
      demo_url: projectData.demo_url?.trim() || "",
      repo_url: projectData.repo_url?.trim() || "",
      tags: Array.isArray(projectData.tags) ? projectData.tags : [],
      creator_id: currentUser?.id || "usr_guest",
      creator_name: currentUser?.fullName || currentUser?.name || "Estudiante",
      creator_avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    // Sincronizar en Supabase si está conectado
    if (isSupabaseReady() && currentUser?.id && currentUser.id !== "usr_guest" && currentUser.id !== "usr_101") {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            title: newProject.title,
            description: newProject.description,
            cover_url: newProject.cover_url,
            demo_url: newProject.demo_url,
            repo_url: newProject.repo_url,
            tags: newProject.tags,
            creator_id: currentUser.id,
            creator_name: newProject.creator_name,
            creator_avatar: newProject.creator_avatar,
            likes_count: 0
          }])
          .select()
          .single();

        if (!error && data) {
          newProject.id = data.id;
        } else if (error) {
          console.warn('⚠️ Error al insertar proyecto en Supabase:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Excepción al guardar en Supabase:', err);
      }
    }

    // Actualizar cache local
    const current = this.loadLocalCache();
    const updated = [newProject, ...current];
    this.saveLocalCache(updated);

    return newProject;
  }

  /**
   * Actualiza un proyecto existente
   */
  static async updateProject(projectId, updateData, currentUser) {
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('projects')
          .update({
            title: updateData.title.trim(),
            description: updateData.description.trim(),
            cover_url: updateData.cover_url?.trim() || "",
            demo_url: updateData.demo_url?.trim() || "",
            repo_url: updateData.repo_url?.trim() || "",
            tags: updateData.tags || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);
      } catch (err) {
        console.warn('⚠️ Error al actualizar en Supabase:', err);
      }
    }

    // Actualizar cache local
    const current = this.loadLocalCache();
    const updated = current.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          title: updateData.title.trim(),
          description: updateData.description.trim(),
          cover_url: updateData.cover_url?.trim() || "",
          demo_url: updateData.demo_url?.trim() || "",
          repo_url: updateData.repo_url?.trim() || "",
          tags: updateData.tags || [],
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    this.saveLocalCache(updated);
    return updated.find(p => p.id === projectId);
  }

  /**
   * Elimina un proyecto
   */
  static async deleteProject(projectId, currentUser) {
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);
      } catch (err) {
        console.warn('⚠️ Error al eliminar de Supabase:', err);
      }
    }

    const current = this.loadLocalCache();
    const updated = current.filter(p => p.id !== projectId);
    this.saveLocalCache(updated);
    return true;
  }

  /**
   * Da like o quita like a un proyecto
   */
  static async toggleLike(projectId, userId) {
    const current = this.loadLocalCache();
    const likesKey = `liked_projects_${userId || 'guest'}`;
    let likedSet = new Set(JSON.parse(localStorage.getItem(likesKey) || '[]'));
    const isLiked = likedSet.has(projectId);

    let newCount = 0;
    const updated = current.map(p => {
      if (p.id === projectId) {
        const diff = isLiked ? -1 : 1;
        newCount = Math.max(0, (p.likes_count || 0) + diff);
        return { ...p, likes_count: newCount };
      }
      return p;
    });

    if (isLiked) {
      likedSet.delete(projectId);
    } else {
      likedSet.add(projectId);
    }
    localStorage.setItem(likesKey, JSON.stringify([...likedSet]));
    this.saveLocalCache(updated);

    // Sync likes count en Supabase si es posible
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('projects')
          .update({ likes_count: newCount })
          .eq('id', projectId);
      } catch (err) {
        // Silently fail for likes sync
      }
    }

    return { liked: !isLiked, count: newCount };
  }

  static hasUserLiked(projectId, userId) {
    const likesKey = `liked_projects_${userId || 'guest'}`;
    const likedList = JSON.parse(localStorage.getItem(likesKey) || '[]');
    return likedList.includes(projectId);
  }

  static loadLocalCache() {
    try {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading projects cache:', e);
    }
    this.saveLocalCache(INITIAL_SAMPLE_PROJECTS);
    return INITIAL_SAMPLE_PROJECTS;
  }

  static saveLocalCache(projects) {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects cache:', e);
    }
  }
}
