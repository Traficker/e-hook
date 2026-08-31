import { getSupabase, isSupabaseReady } from './supabaseClient.js';
import { initialData } from '../data/initialData.js';

const STORAGE_NEWS_KEY = 'skoolx_news_cache_v34';

export class NewsService {
  /**
   * Carga las noticias desde Supabase con fallback a cache local e initialData
   */
  static async fetchNews() {
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map(n => ({
            id: n.id,
            title: n.title,
            category: n.category,
            date: n.date,
            isPinned: !!n.is_pinned,
            author: n.author,
            avatar: n.avatar,
            videoUrl: n.video_url || '',
            coverUrl: n.cover_url || '',
            content: n.content,
            created_at: n.created_at
          }));
          this.saveLocalCache(mapped);
          return mapped;
        } else if (error) {
          console.warn('⚠️ Nota: Tabla news_posts no encontrada aún en Supabase, usando cache local:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Error al consultar news_posts en Supabase:', err);
      }
    }

    return this.loadLocalCache();
  }

  /**
   * Guarda o crea una nueva noticia en Supabase y localmente
   */
  static async createNews(newsData, currentUser) {
    const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const authorName = currentUser?.fullName || currentUser?.name || 'Administrador';
    const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

    const newNews = {
      id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: newsData.title.trim(),
      category: newsData.category || '📢 Anuncio Oficial',
      date: today,
      isPinned: !!newsData.isPinned,
      author: authorName,
      avatar: authorAvatar,
      videoUrl: newsData.videoUrl?.trim() || '',
      coverUrl: newsData.coverUrl?.trim() || '',
      content: newsData.content.trim(),
      created_at: new Date().toISOString()
    };

    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('news_posts')
          .insert([{
            title: newNews.title,
            category: newNews.category,
            date: newNews.date,
            is_pinned: newNews.isPinned,
            author: newNews.author,
            avatar: newNews.avatar,
            video_url: newNews.videoUrl,
            cover_url: newNews.coverUrl,
            content: newNews.content
          }])
          .select()
          .single();

        if (!error && data) {
          newNews.id = data.id;
        }
      } catch (err) {
        console.warn('⚠️ Error al insertar noticia en Supabase:', err);
      }
    }

    const current = this.loadLocalCache();
    const updated = [newNews, ...current];
    this.saveLocalCache(updated);
    return newNews;
  }

  /**
   * Actualiza una noticia existente
   */
  static async updateNews(newsId, updateData) {
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('news_posts')
          .update({
            title: updateData.title.trim(),
            category: updateData.category,
            is_pinned: !!updateData.isPinned,
            video_url: updateData.videoUrl?.trim() || '',
            cover_url: updateData.coverUrl?.trim() || '',
            content: updateData.content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', newsId);
      } catch (err) {
        console.warn('⚠️ Error al actualizar noticia en Supabase:', err);
      }
    }

    const current = this.loadLocalCache();
    const updated = current.map(n => {
      if (n.id === newsId) {
        return {
          ...n,
          title: updateData.title.trim(),
          category: updateData.category,
          isPinned: !!updateData.isPinned,
          videoUrl: updateData.videoUrl?.trim() || '',
          coverUrl: updateData.coverUrl?.trim() || '',
          content: updateData.content.trim()
        };
      }
      return n;
    });

    this.saveLocalCache(updated);
    return updated.find(n => n.id === newsId);
  }

  /**
   * Cambia el estado fijado (pin) de una noticia
   */
  static async togglePin(newsId) {
    const current = this.loadLocalCache();
    const item = current.find(n => n.id === newsId);
    if (!item) return;

    const newPinStatus = !item.isPinned;

    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('news_posts')
          .update({ is_pinned: newPinStatus })
          .eq('id', newsId);
      } catch (err) {}
    }

    const updated = current.map(n => n.id === newsId ? { ...n, isPinned: newPinStatus } : n);
    this.saveLocalCache(updated);
    return newPinStatus;
  }

  /**
   * Elimina una noticia
   */
  static async deleteNews(newsId) {
    if (isSupabaseReady()) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('news_posts')
          .delete()
          .eq('id', newsId);
      } catch (err) {}
    }

    const current = this.loadLocalCache();
    const updated = current.filter(n => n.id !== newsId);
    this.saveLocalCache(updated);
    return true;
  }

  static loadLocalCache() {
    try {
      const raw = localStorage.getItem(STORAGE_NEWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const initial = initialData.newsPosts || [];
    this.saveLocalCache(initial);
    return initial;
  }

  static saveLocalCache(news) {
    try {
      localStorage.setItem(STORAGE_NEWS_KEY, JSON.stringify(news));
    } catch (e) {}
  }
}
