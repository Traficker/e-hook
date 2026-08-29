export const initialData = {
  currentUser: {
    id: "usr_101",
    name: "Carlos Mendoza",
    email: "carlos@ejemplo.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    xp: 0,
    level: 1,
    completedLessons: [],
    passedQuizzes: {}
  },
  courses: [],
  communityPosts: [
    {
      id: "post_1",
      authorName: "Laura Restrepo",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      time: "Hace 2 horas",
      category: "Dudas de Cursos",
      title: "¡Logré conectar mi WhatsApp Business con Meta Ads! 🎉",
      content: "Siguiendo la lección 4 del Módulo 3 logré que mi cuenta de WhatsApp me aparezca en verde como 'Conectado'. ¡Muchas gracias por la explicación de la autenticación 2FA!",
      likes: 12,
      comments: [
        {
          id: "c_sample_1",
          author: "Carlos Mendoza",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          text: "¡Excelente Laura! Yo también acabo de terminar el Módulo 3 y pasé la evaluación con 100%.",
          time: "Hace 1 hora",
          likes: 3,
          replies: [
            {
              id: "r_sample_1",
              author: "Laura Restrepo",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
              text: "¡Felicidades Carlos! ¿Cómo te fue configurando la cuenta de WhatsApp Business?",
              time: "Hace 30 min",
              replyToUser: "Carlos Mendoza"
            }
          ]
        }
      ]
    },
    {
      id: "post_2",
      authorName: "Diego Morales (Instructor)",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      time: "Hace 1 día",
      category: "Anuncios",
      title: "🚀 Bienvenidos al Proyecto E-hook: Dominando el E-commerce",
      content: "Recuerden avanzar lección por lección en la sección de Aulas, marcar cada lección como completada para ganar sus primeros puntos XP y presentar las evaluaciones de cada módulo.",
      likes: 34,
      comments: []
    }
  ],
  leaderboard: [
    { name: "Sofía Ramírez", level: 5, xp: 1250, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
    { name: "Mateo Gómez", level: 4, xp: 980, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    { name: "Carlos Mendoza (Tú)", level: 1, xp: 0, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    { name: "Ana Lucía Torres", level: 1, xp: 100, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
  ],
  newsPosts: [
    {
      id: "news_1",
      title: "🚀 Lanzamiento Oficial del Curso: Proyecto E-hook",
      category: "📢 Anuncio Oficial",
      date: "11 de Agosto, 2026",
      isPinned: true,
      author: "Diego Morales (Director Académico)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      content: "¡Nos alegra darles la bienvenida al programa interactivo Proyecto E-hook! En este curso aprenderás desde cero a dominar la mentalidad empresarial, comprender el e-commerce B2C y configurar tu ecosistema comercial en Meta Ads (Facebook, Instagram y WhatsApp Business)."
    },
    {
      id: "news_2",
      title: "📢 Nueva actualización: Visor de PDFs de Google Drive y Avance Secuencial",
      category: "🎉 Novedad",
      date: "10 de Agosto, 2026",
      isPinned: false,
      author: "Equipo SkoolX",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      coverUrl: "",
      content: "Hemos incorporado el visor interactivo de PDFs de Google Drive para estudiar documentos directamente en las lecciones y el sistema de avance secuencial con candados de seguridad 🔒."
    }
  ]
};
