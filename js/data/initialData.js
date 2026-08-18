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
  courses: [
    {
      id: "course_ehook",
      title: "Proyecto E-hook: Dominando el E-commerce y Ecosistema Meta",
      subtitle: "Aprende a construir tu negocio de comercio electrónico y escalar ventas por WhatsApp con Meta Ads.",
      coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
      badge: "Oficial & Completo",
      level: "Principiante a Avanzado",
      studentsCount: 1420,
      rating: 4.9,
      modules: [
        // =====================================================================
        // MÓDULO 1: Mentalidad Empresarial
        // =====================================================================
        {
          id: "mod_1",
          title: "MÓDULO 1: Mentalidad Empresarial",
          description: "Cambia tu forma de pensar sobre el dinero y aprende a construir activos digitales.",
          lessons: [
            {
              id: "m1_l1",
              title: "LECCIÓN 1: Mejora tu relación con el dinero",
              type: "video_content",
              videoUrl: "",
              summary: "Descubre por qué miles de personas utilizan el comercio electrónico para generar ingresos adicionales y cómo empezar a pensar como un creador de activos digitales.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>💡 Cambia tu forma de pensar sobre el dinero</h3>
                    <p>En este módulo descubrirás por qué miles de personas utilizan el comercio electrónico para generar ingresos adicionales y cómo empezar a pensar como un creador de activos digitales.</p>
                  </div>

                  <h2>La mayoría de las personas intercambian tiempo por dinero</h2>
                  <p>Un emprendedor busca crear sistemas y activos que puedan generar ingresos de manera constante.</p>
                  <p>No significa dejar tu empleo ni asumir grandes riesgos. Se trata de construir una segunda fuente de ingresos que complemente tu economía y te dé más opciones en el futuro.</p>

                  <p>Robert Kiyosaki, autor de <em>Padre Rico, Padre Pobre</em>, popularizó una idea que sigue siendo relevante para millones de emprendedores:</p>

                  <blockquote class="quote-box">
                    <p>"No trabajes únicamente por dinero. Haz que el dinero trabaje para ti."</p>
                    <cite>— Robert Kiyosaki, autor de <em>Padre Rico, Padre Pobre</em></cite>
                  </blockquote>

                  <p>El comercio electrónico es una herramienta que permite construir activos como una tienda online, una marca, una comunidad o una base de clientes, capaces de generar ingresos incluso cuando no estás trabajando de forma directa.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <div class="grid-2-col my-4">
                    <div class="card-highlight" style="background:var(--bg-sidebar);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.25rem;">
                      <h4>🎯 Idea clave</h4>
                      <p>No busques únicamente ganar más dinero. Busca desarrollar habilidades y construir activos que produzcan valor con el tiempo.</p>
                    </div>
                    <div class="card-highlight" style="background:var(--bg-sidebar);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.25rem;">
                      <h4>🤔 Reflexiona</h4>
                      <p>¿De dónde provienen hoy tus ingresos?</p>
                      <p>Si esa fuente desapareciera durante tres meses, ¿qué harías?</p>
                    </div>
                  </div>

                  <h3>📚 Recursos recomendados</h3>
                  <ul class="resources-list">
                    <li>📖 <strong>Libro sugerido:</strong> Padre Rico Padre Pobre — Robert Kiyosaki</li>
                  </ul>
                </div>
              `,
              checklist: [
                "Comprender la diferencia entre intercambiar tiempo por dinero y construir activos.",
                "Identificar tus fuentes actuales de ingresos y evaluar tu seguridad financiera.",
                "Definir el objetivo principal de tu proyecto de E-commerce."
              ]
            }
          ]
        },

        // =====================================================================
        // MÓDULO 2: Fundamentos, Historia y Evolución del Comercio Electrónico
        // =====================================================================
        {
          id: "mod_2",
          title: "MÓDULO 2: Fundamentos, Historia y Evolución del Comercio Electrónico",
          description: "Domina la historia del e-commerce, el protocolo SSL y los modelos comerciales B2B, B2C, C2C y C2B.",
          lessons: [
            {
              id: "m2_l1",
              title: "LECCIÓN 1: Origen del comercio electrónico y modelos de negocio (B2B, B2C, C2C y C2B)",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=2v-oZ0sO0Kk",
              videoUrls: [
                "https://www.youtube.com/watch?v=2v-oZ0sO0Kk",
                "https://www.youtube.com/watch?v=3JZ_D3ELwOQ"
              ],
              summary: "Dominio conceptual de e-commerce, omnicanalidad, protocolo SSL y clasificación precisa de modelos comerciales (B2B, B2C, C2C, B2B).",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Dominio conceptual de e-commerce, omnicanalidad y protocolos de seguridad (SSL).</li>
                      <li>Clasificación precisa de modelos comerciales (B2B, B2C, C2C, C2B).</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>Para entender cómo vender hoy por internet, debemos comprender cómo nació el comercio electrónico, qué barreras de seguridad superó y cómo se clasifican las ventas según quién compra y quién vende.</p>

                  <h2>Desarrollo completo</h2>

                  <h3>1. Definición e Hitos Históricos</h3>
                  <p>El e-commerce es la compra y venta de bienes, servicios o datos por internet.</p>
                  <ul>
                    <li><strong>1994:</strong> Se realiza la primera venta segura (un CD de Sting por $12,48 USD) gracias al protocolo <strong>SSL</strong>, que cifra datos de pago para evitar robos. Ese mismo año Pizza Hut vendió sus primeras pizzas online.</li>
                    <li><strong>1995:</strong> Nacen <strong>Amazon</strong> y <strong>eBay</strong>, demostrando que internet podía sostener negocios masivos.</li>
                    <li><strong>Hoy:</strong> Mueve billones de dólares globales y supera el 20% de las ventas minoristas del mundo.</li>
                  </ul>

                  <h3>2. Tipos de Comercio Electrónico</h3>
                  <div class="models-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:1.5rem 0;">
                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:rgba(255,255,255,0.1);border-radius:4px;">B2B</span>
                      <h4>Empresa a Empresa</h4>
                      <p>Transacciones mayoristas entre compañías (ej. fábrica vendiendo insumos a un taller).</p>
                    </div>
                    <div class="model-card" style="background:rgba(99,102,241,0.1);border:1px solid var(--accent-primary);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:var(--accent-primary);color:#fff;border-radius:4px;">B2C</span>
                      <h4>Empresa a Consumidor Final</h4>
                      <p>La empresa le vende directo al cliente final (ej. Amazon o tu tienda). <strong>Es el modelo más común.</strong></p>
                    </div>
                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:rgba(255,255,255,0.1);border-radius:4px;">C2C</span>
                      <h4>Consumidor a Consumidor</h4>
                      <p>Particulares vendiendo a particulares (ej. Facebook Marketplace o eBay).</p>
                    </div>
                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:rgba(255,255,255,0.1);border-radius:4px;">C2B</span>
                      <h4>Consumidor a Empresa</h4>
                      <p>Independientes ofreciendo servicios o contenido a empresas (ej. freelancers o fotógrafos).</p>
                    </div>
                  </div>

                  <h3>📌 Ejemplos para entender cada modelo</h3>
                  <ul>
                    <li><strong>B2B:</strong> Una fábrica vende 500 metros de tela a un taller de confección.</li>
                    <li><strong>B2C:</strong> El taller confecciona camisetas y te vende una a ti por su web.</li>
                    <li><strong>C2C:</strong> Tú le vendes esa camiseta usada a un vecino en Facebook Marketplace.</li>
                    <li><strong>C2B:</strong> Le tomas una foto a la camiseta y se la vendes a una marca para sus anuncios.</li>
                  </ul>

                  <h3>💡 Analogías para recordar fácil</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🔒 <strong>SSL:</strong> Fue como poner un camión blindado e invisible para transportar el dinero del cliente a la tienda sin que nadie lo robe en el camino.</p>
                    <p>🏪 <strong>B2C vs. B2B:</strong> B2C es el supermercado de tu barrio; B2B es el mercado mayorista donde solo entran camiones de carga.</p>
                  </div>

                  <h3>✏️ Actividades</h3>
                  <p>Dibuja un cuadro de 4 casilleros (B2B, B2C, C2C, C2B) y ubica 1 ejemplo de tu vida cotidiana en cada uno.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>📝 Resumen</h3>
                  <p>El e-commerce nació resolviendo el reto del pago seguro en los años 90 y evolucionó en diferentes formatos comerciales, siendo el modelo <strong>B2C</strong> el más directo y accesible para nuevos emprendedores.</p>

                  <h3>📺 Recursos recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Historia y Origen):</strong> Buscar en YouTube: <em>Historia del comercio electrónico línea de tiempo</em></li>
                    <li>🎥 <strong>Video 2 (Tipos de E-commerce):</strong> Buscar en YouTube: <em>Tipos de Comercio Electrónico B2B B2C</em></li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Intentar aplicar estrategias B2C (emocionales) para vender productos B2B (que requieren contratos y juntas comerciales).</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Enfocar el aprendizaje inicial en dominar el modelo <strong>B2C</strong>, que requiere procesos de decisión más cortos por parte del cliente.</p>
                </div>
              `,
              checklist: [
                "Sé qué significa e-commerce y el protocolo SSL.",
                "Identifico la diferencia entre B2B, B2C, C2C y C2B.",
                "Reconozco que mi proyecto se ubicará en el modelo B2C."
              ]
            },
            {
              id: "m2_quiz",
              title: "EVALUACIÓN: Fundamentos, Historia y Evolución del Comercio Electrónico",
              type: "quiz",
              summary: "Evaluación requerida para aprobar el Módulo 2. Puntaje mínimo: 70%",
              minScore: 70,
              questions: [
                {
                  id: "q2_1",
                  question: "1. ¿En qué año se realizó la primera transacción segura de comercio electrónico (la venta de un CD a través de NetMarket)?",
                  options: ["1991", "1994", "1998", "2000"],
                  correctIndex: 1,
                  explanation: "En 1994 se realizó la primera transacción segura cifrada con protocolo SSL."
                },
                {
                  id: "q2_2",
                  question: "2. En el modelo B2C (Business to Consumer), la venta se realiza directamente desde una empresa hacia el consumidor final.",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 0,
                  explanation: "B2C representa Business to Consumer (Empresa a Consumidor final)."
                },
                {
                  id: "q2_3",
                  question: "3. ¿Cuál de las siguientes opciones es un ejemplo típico de comercio electrónico C2C (Consumer to Consumer)?",
                  options: [
                    "Una fábrica que vende insumos a un taller de confección.",
                    "Una persona que le vende una camiseta usada a un vecino en Facebook Marketplace.",
                    "Un creador de contenido que vende una fotografía a una marca.",
                    "Una tienda oficial de calzado vendiendo en su sitio web."
                  ],
                  correctIndex: 1,
                  explanation: "Vender artículos usados entre particulares es la esencia del comercio C2C."
                },
                {
                  id: "q2_4",
                  question: "4. El protocolo SSL fue fundamental para el desarrollo del comercio electrónico porque permite cifrar (encriptar) los datos de pago y proteger las transacciones.",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 0,
                  explanation: "El cifrado SSL hace seguro el envío de información sensible de tarjetas."
                },
                {
                  id: "q2_5",
                  question: "5. Si vendes productos directamente a las personas utilizando un canal como tu propia tienda o WhatsApp Business, ¿en qué modelo de comercio electrónico te estás ubicando?",
                  options: [
                    "B2B (Business to Business)",
                    "B2C (Business to Consumer)",
                    "C2B (Consumer to Business)",
                    "C2C (Consumer to Consumer)"
                  ],
                  correctIndex: 1,
                  explanation: "Vender directamente a clientes finales por tu tienda o WhatsApp es modelo B2C."
                }
              ]
            }
          ]
        },

        // =====================================================================
        // MÓDULO 3: Crea y configura tu ecosistema Meta
        // =====================================================================
        {
          id: "mod_3",
          title: "MÓDULO 3: Crea y configura tu ecosistema Meta",
          description: "Paso a paso práctico para crear tu Fanpage, Instagram Profesional, Business Manager, WhatsApp Business y Cuenta Publicitaria.",
          lessons: [
            // -----------------------------------------------------------------
            // LECCIÓN 1: Estructura del ecosistema Meta y creación de cuentas
            // -----------------------------------------------------------------
            {
              id: "m3_l1",
              title: "LECCIÓN 1: Estructura del ecosistema Meta y creación de cuentas clave",
              type: "video_content",
              videoUrl: "",
              summary: "Aprende a diferenciar la cuenta personal de los activos comerciales, crea tu Fanpage y tu perfil profesional de Instagram.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-accent" style="border-left-color:var(--warning);background:rgba(245,158,11,0.08);">
                    <h3>🚀 Empieza el camino a tu primera campaña de WhatsApp</h3>
                    <p>En los módulos anteriores sentamos las bases de tu mentalidad empresarial y organizamos la estructura de tu negocio. Ahora ha llegado el momento de pasar a la acción práctica y construir la infraestructura digital donde ocurrirá la magia de tus ventas.</p>
                    <p>Vender por internet de forma constante no es cuestión de suerte ni de subir publicaciones esperando a que los clientes aparezcan mágicamente. Requiere construir una maquinaria bien engranada.</p>
                  </div>

                  <p>En este módulo dejarás de ver a Facebook, Instagram y WhatsApp como simples redes sociales de entretenimiento y aprenderás a utilizarlos como lo que realmente son: <strong>las herramientas comerciales más potentes del planeta para captar clientes.</strong></p>

                  <p>A lo largo de estas 4 lecciones iremos de la mano, paso a paso y sin tecnicismos complejos:</p>
                  <ol>
                    <li><strong>Construiremos las vitrinas de tu negocio:</strong> Crearemos la Página de Facebook y el perfil independiente de Instagram Comercial de tu marca.</li>
                    <li><strong>Crearemos tu centro de mando (Business Manager):</strong> Configuraremos la plataforma profesional desde donde administrarás tu empresa y la blindaremos con medidas de seguridad.</li>
                    <li><strong>Estructuraremos tu canal de cobro y atención:</strong> Dejaremos listo tu WhatsApp Business con su catálogo de productos e integraremos tu Cuenta Publicitaria con medios de pago locales.</li>
                    <li><strong>Sincronizaremos todo el sistema:</strong> Conectaremos cada una de las piezas entre sí para que tus futuros anuncios lleven un flujo constante de clientes directamente a tu chat.</li>
                  </ol>

                  <p>No necesitas conocimientos técnicos previos ni experiencia en programación. Si sabes seguir instrucciones paso a paso, al finalizar este módulo tendrás tu ecosistema comercial 100% verificado, conectado y preparado para lanzar tu primera campaña publicitaria a WhatsApp.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Comprensión del mapa mental del ecosistema comercial de Meta.</li>
                      <li>Creación de la Página de Facebook e Instagram comercial (creación de perfil independiente y conversión a perfil profesional).</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>Antes de pautar, necesitas construir la vitrina pública de tu negocio. Aprenderás a diferenciar la cuenta personal de los activos comerciales, crearás tu Página de Facebook y abrirás un perfil de Instagram independiente para tu marca para convertirlo en profesional.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. El Mapa de la Infraestructura</h3>
                  <ul>
                    <li>👤 <strong>Perfil Personal de Facebook:</strong> La clave de acceso. No se usa para vender, solo para administrar.</li>
                    <li>🚩 <strong>Página de Facebook (Fanpage):</strong> Tu presencia pública oficial en Facebook.</li>
                    <li>📸 <strong>Perfil Profesional de Instagram:</strong> La cuenta comercial independiente de tu marca en Instagram.</li>
                  </ul>

                  <h3>2. Paso a Paso de Creación</h3>

                  <h4>Paso A: Crear la Página de Facebook</h4>
                  <p>Desde tu perfil personal, ve al menú de opciones <em>Páginas → Crear nueva página</em>. Asigna el nombre exacto de tu marca, la categoría principal y sube las imágenes de perfil y portada.</p>

                  <h4>Paso B: Crear un Perfil de Instagram Nuevo e Independiente</h4>
                  <p>Abre la aplicación de Instagram en tu celular (o entra a instagram.com). Selecciona <em>Registrarse</em>, ingresa el correo comercial o número telefónico de tu negocio, tu nombre de empresa y crea un nombre de usuario exclusivo para la marca (ejemplo: <code>@minegocio_col</code>). Agrega tu contraseña y confirma el código que llegará a tu correo/móvil.</p>

                  <h4>Paso C: Convertir el perfil de Instagram a Profesional</h4>
                  <p>Dentro de la app de la nueva cuenta de Instagram:</p>
                  <ol>
                    <li>Ve a tu perfil y toca el menú de las tres líneas (≡) en la esquina superior derecha.</li>
                    <li>Selecciona <em>Configuración y actividad</em> → desplázate hasta <em>Para profesionales</em> y toca en <em>Tipo de cuenta y herramientas</em>.</li>
                    <li>Selecciona <em>Cambiar a cuenta profesional</em>.</li>
                    <li>Elige la categoría que mejor describa tu negocio (ej. Tienda de ropa, Producto/Servicio) y marca la opción <strong>Empresa</strong> o <strong>Creador</strong>.</li>
                    <li>Agrega los datos de contacto comerciales de tu marca (correo, teléfono) y guarda los cambios.</li>
                  </ol>

                  <h3>📌 Ejemplos</h3>
                  <p>Si tu negocio se llama "Calzado Express", la página de Facebook y el nuevo usuario de Instagram deben tener nombres alineados (ejemplo: <strong>Calzado Express</strong> en Facebook y <strong>@calzadoexpress_co</strong> en Instagram) para mantener coherencia de marca.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🏷️ Tu perfil personal de Facebook es el <strong>documento de identidad del dueño</strong>; la Página de Facebook y la nueva cuenta de Instagram son el <strong>letrero y la vitrina</strong> del local.</p>
                  </div>

                  <h3>📝 Resumen</h3>
                  <p>Separar la identidad personal de la comercial es el primer paso. Dejas listas las dos vitrinas públicas independientes por donde los clientes te van a descubrir.</p>

                  <h3>📺 Recursos recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Crear Página de Facebook):</strong> Buscar en YouTube: <em>Como crear una pagina de facebook para mi negocio paso a paso</em></li>
                    <li>🎥 <strong>Video 2 (Crear Instagram y Cambiar a Profesional):</strong> Buscar en YouTube: <em>Como crear cuenta de instagram para empresa y cambiar a profesional paso a paso</em></li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Intentar usar la cuenta personal de Instagram que usas con tus amigos en lugar de crear un perfil independiente para el negocio.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Guardar el correo y la contraseña de la nueva cuenta de Instagram en una libreta o gestor de contraseñas de la empresa.</p>

                  <h3>📌 Tarea</h3>
                  <p>Asegúrate de que la nueva cuenta de Instagram tenga publicado el logo del negocio como foto de perfil y una breve descripción comercial en la biografía.</p>

                  <div class="callout callout-primary" style="margin-top:1.5rem;">
                    <p>➡️ <strong>Preparación para la siguiente lección:</strong> Con las páginas públicas creadas, en la lección 2 crearemos el centro de mando profesional: el Business Manager (Portafolio Empresarial).</p>
                  </div>
                </div>
              `,
              checklist: [
                "Tengo mi perfil personal activo y seguro.",
                "Creé la Página de Facebook con nombre, foto y portada.",
                "Abrí un perfil de Instagram nuevo para la marca.",
                "Convertí el nuevo perfil de Instagram a cuenta profesional."
              ]
            },

            // -----------------------------------------------------------------
            // LECCIÓN 2: Business Manager y Seguridad
            // -----------------------------------------------------------------
            {
              id: "m3_l2",
              title: "LECCIÓN 2: Creación y configuración del Business Manager y Seguridad",
              type: "video_content",
              videoUrl: "",
              summary: "Crea tu Portafolio Empresarial (Business Manager) en Meta Business Suite y blinda la cuenta con Autenticación en 2 Pasos (2FA).",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Creación del Portafolio Empresarial / Business Manager directamente desde la interfaz de Facebook.</li>
                      <li>Configuración de la seguridad (Autenticación en dos pasos) para evitar bloqueos y proteger la cuenta.</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>El Business Manager (Portafolio Empresarial) es el cerebro invisible de tu negocio. Aquí dentro organizarás tus activos, administrarás tu dinero de pauta publicitaria y protegerás tu cuenta contra hackeos o bloqueos de Meta.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. Creación del Business Manager desde tu Facebook</h3>

                  <div class="callout callout-accent" style="border-left-color:var(--warning);background:rgba(245,158,11,0.08);">
                    <p>⚠️ <strong>Nota previa obligatoria:</strong> Realiza este procedimiento desde una computadora y asegúrate de tener tu perfil personal de Facebook abierto en el mismo navegador.</p>
                  </div>

                  <ol>
                    <li><strong>Paso 1:</strong> Entra a tu cuenta en <code>facebook.com</code>.</li>
                    <li><strong>Paso 2:</strong> En la columna izquierda de la pantalla de inicio de Facebook, busca y haz clic en <strong>Meta Business Suite</strong> (si no lo ves de entrada, haz clic en el menú de puntos arriba a la derecha y selecciónalo).</li>
                    <li><strong>Paso 3:</strong> Una vez dentro de Meta Business Suite, dirígete a la parte superior izquierda de la pantalla y haz clic sobre el menú desplegable donde aparece el nombre de tu perfil o página.</li>
                    <li><strong>Paso 4:</strong> En la parte inferior de esa lista desplegable, haz clic en el botón <strong>Crear un portafolio empresarial</strong> (o <strong>Crear una cuenta</strong>).</li>
                    <li><strong>Paso 5:</strong> Completa los datos requeridos:
                      <ul>
                        <li><strong>Nombre del portafolio:</strong> Escribe el nombre exacto de la fanpage de tu negocio.</li>
                        <li><strong>Tu nombre:</strong> Verifica que corresponda a tu nombre real.</li>
                        <li><strong>Correo electrónico comercial:</strong> Ingresa el correo electrónico donde manejas tu empresa.</li>
                      </ul>
                    </li>
                    <li><strong>Paso 6:</strong> Abre la bandeja de entrada de tu correo electrónico, busca el mensaje de validación enviado por Meta y haz clic en <strong>Confirmar ahora</strong> para activar tu portafolio.</li>
                  </ol>

                  <h3>2. Blindaje de Seguridad Obligatorio</h3>
                  <ol>
                    <li>En el menú lateral de Meta Business Suite, ve a <em>Configuración del negocio</em> (o <em>Configuración del portafolio</em>).</li>
                    <li>Selecciona la opción <strong>Centro de seguridad</strong>.</li>
                    <li>En el apartado de <em>Autenticación en dos pasos</em>, selecciona la opción <strong>Todos</strong> o <strong>Solo administradores</strong>.</li>
                    <li>Activa el código de seguridad vinculando una aplicación de autenticación en tu celular (como <strong>Google Authenticator</strong>) o mediante código SMS.</li>
                  </ol>

                  <h3>📌 Ejemplos</h3>
                  <p>Si Meta detecta que ingresas al Business Manager desde un dispositivo o ubicación diferente sin tener activa la seguridad de dos pasos, restringirá preventivamente tu cuenta para evitar posibles estafas.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🏦 El Business Manager es la <strong>oficina privada de la administración</strong> donde guardas las escrituras del negocio, los permisos y la caja fuerte de la empresa.</p>
                  </div>

                  <h3>📝 Resumen</h3>
                  <p>El Business Manager centraliza el control operativo de tu empresa. Configurar la cuenta desde Facebook y aplicar el blindaje de seguridad desde el primer día evita restricciones futuras.</p>

                  <h3>📺 Recursos recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Crear Business Manager):</strong> Buscar en YouTube: <em>Como crear un business manager de meta business suite paso a paso</em></li>
                    <li>🎥 <strong>Video 2 (Seguridad y 2FA en Meta):</strong> Buscar en YouTube: <em>Como activar la autenticacion en dos pasos en facebook y business manager</em></li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Ingresar un correo falso o al que no tienes acceso al momento de crear el Business Manager.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Guardar los códigos de recuperación de la autenticación en dos pasos en un lugar seguro.</p>

                  <h3>📌 Tarea</h3>
                  <p>Toma una captura de pantalla del mensaje de confirmación de tu correo electrónico dentro del Business Manager.</p>

                  <div class="callout callout-primary" style="margin-top:1.5rem;">
                    <p>➡️ <strong>Preparación para la siguiente lección:</strong> En la Lección 3 agregaremos la tarjeta para pagar la publicidad y la cuenta comercial de WhatsApp Business.</p>
                  </div>
                </div>
              `,
              checklist: [
                "Abrí Meta Business Suite desde mi perfil personal de Facebook.",
                "Creé el Portafolio Empresarial con los datos de mi negocio.",
                "Confirmé el correo electrónico de verificación.",
                "Activé la autenticación en dos pasos (2FA) en el Centro de Seguridad."
              ]
            },

            // -----------------------------------------------------------------
            // LECCIÓN 3: WhatsApp Business y Cuenta Publicitaria
            // -----------------------------------------------------------------
            {
              id: "m3_l3",
              title: "LECCIÓN 3: Configuración de WhatsApp Business y Cuenta Publicitaria",
              type: "video_content",
              videoUrl: "",
              summary: "Configura tu línea de WhatsApp Business con catálogo de productos y crea tu Cuenta Publicitaria con moneda local y métodos de pago.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Instalación y configuración profesional de WhatsApp Business (Perfil, catálogo, mensajes).</li>
                      <li>Creación de la Cuenta Publicitaria e integración de métodos de pago locales.</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>Para recibir ventas por chat necesitas adaptar tu WhatsApp con herramientas comerciales e integrar la cuenta de pago dentro de Meta para financiar tus anuncios.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. WhatsApp Business Profesional</h3>
                  <ul>
                    <li>Descarga la app <strong>WhatsApp Business</strong> (diferente a la versión personal).</li>
                    <li>Ve a <em>Ajustes de empresa → Perfil de la empresa</em>: Agrega horario comercial, dirección, descripción e historia.</li>
                    <li>Crea tu <strong>Catálogo</strong>: Sube las fotos de tus productos principales con su precio y descripción.</li>
                  </ul>

                  <h3>2. Cuenta Publicitaria y Métodos de Pago</h3>
                  <ul>
                    <li>En tu Business Manager, ve a <em>Cuentas → Cuentas publicitarias → Agregar → Crear una nueva cuenta publicitaria</em>.</li>
                    <li>Asigna el nombre, selecciona tu <strong>Zona Horaria local</strong> y tu <strong>Moneda local</strong> (ej. COP para Colombia).</li>
                  </ul>

                  <div class="callout callout-accent" style="border-left-color:var(--danger);background:rgba(239,68,68,0.08);">
                    <p>🚨 <strong>¡Cuidado!</strong> Si te equivocas de moneda no se podrá cambiar después.</p>
                  </div>

                  <ul>
                    <li>En <em>Métodos de pago</em>, agrega tu tarjeta de crédito o débito (debe tener habilitadas compras internacionales/en línea).</li>
                  </ul>

                  <h3>📌 Ejemplos</h3>
                  <p>En Colombia, puedes vincular tarjetas débito virtuales (como las de Nequi o Daviplata habilitadas para compras online) dentro de tu cuenta publicitaria.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>💳 La Cuenta Publicitaria es el <strong>datáfono / caja registradora</strong> y WhatsApp Business es el <strong>vendedor amable en el mostrador</strong>.</p>
                  </div>

                  <h3>✏️ Actividades</h3>
                  <p>Crea tu cuenta publicitaria con tu moneda local, agrega tu método de pago y sube al menos 2 productos al catálogo de tu WhatsApp Business.</p>

                  <h3>📝 Resumen</h3>
                  <p>Con tu canal de cierre listo (WhatsApp) y tu caja registradora configurada (Cuenta Publicitaria), el dinero de la publicidad se procesará sin interrupciones.</p>

                  <h3>📺 Recursos recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Configurar WhatsApp Business):</strong> Buscar en YouTube: <em>Como configurar whatsapp business para mi negocio perfil y catalogo</em></li>
                    <li>🎥 <strong>Video 2 (Crear Cuenta Publicitaria y Pago):</strong> Buscar en YouTube: <em>Como crear una cuenta publicitaria en meta business manager y agregar metodo de pago</em></li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Seleccionar una moneda errónea (como Dólares) al crear la cuenta publicitaria sin tener tarjetas internacionales.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Dejar configurado un mensaje de bienvenida automático en WhatsApp Business para clientes nuevos.</p>

                  <h3>📌 Tarea</h3>
                  <p>Envía el enlace de tu catálogo de WhatsApp a un conocido para verificar que se vea de forma correcta.</p>

                  <div class="callout callout-primary" style="margin-top:1.5rem;">
                    <p>➡️ <strong>Preparación para la siguiente lección:</strong> En la lección final conectaremos todas las piezas entre sí y resolveremos las fallas de vinculación más comunes.</p>
                  </div>
                </div>
              `,
              checklist: [
                "Tengo configurado mi WhatsApp Business con catálogo y perfil completo.",
                "Creé mi Cuenta Publicitaria con la zona horaria y moneda de mi país.",
                "Asigné un método de pago válido."
              ]
            },

            // -----------------------------------------------------------------
            // LECCIÓN 4: Conecta todo y checklist de lanzamiento
            // -----------------------------------------------------------------
            {
              id: "m3_l4",
              title: "LECCIÓN 4: Conecta todo el ecosistema y checklist de lanzamiento",
              type: "video_content",
              videoUrl: "",
              summary: "Vincula tu Fanpage, Instagram y WhatsApp dentro del Business Manager, asígnate todos los permisos y prepara el lanzamiento.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Vinculación de la Página de Facebook, Instagram y WhatsApp dentro del Business Manager.</li>
                      <li>Diagnóstico y resolución de errores de conexión previos al lanzamiento de campañas.</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>Tener las cuentas creadas no es suficiente: deben estar enlazadas formalmente dentro del Business Manager para que los anuncios de Instagram y Facebook sepan a qué número de WhatsApp enviar los mensajes.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. Conexión de Activos en el Business Manager</h3>
                  <p>En <em>Configuración del Negocio</em>:</p>
                  <ul>
                    <li>Ve a <em>Páginas → Agregar</em>: Vincula tu Página de Facebook.</li>
                    <li>Ve a <em>Cuentas de Instagram → Agregar</em>: Inicia sesión con las credenciales de tu nuevo Instagram profesional.</li>
                    <li>Ve a <em>Cuentas de WhatsApp → Agregar</em>: Ingresa tu número de WhatsApp Business y digita el código de confirmación enviado a tu celular.</li>
                  </ul>

                  <h3>2. Asignación de Personas y Permisos</h3>
                  <p>En <em>Personas</em>, selecciona tu nombre y asegúrate de asignarte <strong>Control Total</strong> sobre la Página, Instagram, WhatsApp y la Cuenta Publicitaria.</p>

                  <h3>3. Verificación y Resolución de Errores Comunes</h3>
                  <p>Si la cuenta de WhatsApp no conecta, verifica que no esté vinculada como cuenta personal previa en otra página.</p>

                  <h3>📌 Ejemplos</h3>
                  <p>Si tu cuenta publicitaria no tiene permisos asignados sobre la página de Facebook, cuando intentes hacer un anuncio el sistema te mostrará un error diciéndote <em>"No tienes acceso a esta página"</em>.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🔌 Esta lección es como sincronizar el <strong>cableado eléctrico</strong> de tu negocio: unimos los interruptores (anuncios) con la luz (WhatsApp) para que cuando el cliente presione el botón, todo encienda.</p>
                  </div>

                  <h3>✏️ Actividades</h3>
                  <p>Conecta tu Página, Instagram y WhatsApp dentro del menú de activos de tu Business Manager y asígnate todos los permisos de administrador.</p>

                  <h3>📝 Resumen</h3>
                  <p>Has completado la construcción de tu infraestructura digital. Tu ecosistema Meta está unido, seguro y listo para financiar tus primeros anuncios hacia WhatsApp.</p>

                  <h3>📺 Recursos recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Vincular Facebook, Instagram y WhatsApp):</strong> Buscar en YouTube: <em>Como conectar whatsapp business e instagram a la pagina de facebook y business manager</em></li>
                    <li>🎥 <strong>Video 2 (Solución de errores de conexión):</strong> Buscar en YouTube: <em>Como solucionar error al conectar whatsapp business con meta business suite</em></li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Olvidar asignarse a uno mismo los permisos de administración sobre la cuenta publicitaria recién creada.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Realizar un checklist final antes de lanzar cualquier campaña publicitaria para confirmar que ningún activo marque alerta roja.</p>

                  <h3>📌 Tarea</h3>
                  <p>Comprobar que dentro de la sección <em>Cuentas de WhatsApp</em> de tu Business Manager tu número figure con el estado verde de <strong>Conectado</strong>.</p>
                </div>
              `,
              checklist: [
                "Página de Facebook agregada al Business Manager.",
                "Cuenta de Instagram profesional agregada al Business Manager.",
                "Número de WhatsApp Business conectado y verificado.",
                "Permisos de Control Total asignados a mi perfil personal sobre todos los activos."
              ]
            },

            // -----------------------------------------------------------------
            // EVALUACIÓN del Módulo 3
            // -----------------------------------------------------------------
            {
              id: "m3_quiz",
              title: "EVALUACIÓN: Crea y configura tu ecosistema Meta",
              type: "quiz",
              summary: "Evaluación requerida para aprobar el Módulo 3. Puntaje mínimo: 70%",
              minScore: 70,
              questions: [
                {
                  id: "q3_1",
                  question: "1. ¿Qué recurso es indispensable utilizar como llave de acceso para gestionar y dar de alta el Portafolio Empresarial (Business Manager) en Meta?",
                  options: [
                    "Una página web con dominio propio.",
                    "Tu perfil personal de Facebook.",
                    "Una cuenta de WhatsApp personal.",
                    "Una tarjeta de crédito empresarial."
                  ],
                  correctIndex: 1,
                  explanation: "Tu perfil personal de Facebook es la llave de acceso única para ingresar a Meta Business Manager."
                },
                {
                  id: "q3_2",
                  question: "2. La configuración de la Moneda local y la Zona Horaria al aperturar la Cuenta Publicitaria admite modificaciones simples en el futuro.",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 1,
                  explanation: "Falso: Una vez configurada la moneda en la cuenta publicitaria no se puede modificar fácilmente después."
                },
                {
                  id: "q3_3",
                  question: "3. ¿Qué medida resulta vital para robustecer la protección de tu Business Manager y mitigar el riesgo de restricciones por parte de Meta?",
                  options: [
                    "Publicar contenido todos los días en Instagram.",
                    "Tener más de mil seguidores en la Página de Facebook.",
                    "Activar la Autenticación en dos pasos (2FA) en el Centro de Seguridad.",
                    "Usar un perfil personal de Facebook falso para la administración."
                  ],
                  correctIndex: 2,
                  explanation: "La Autenticación en 2 pasos (2FA) es la exigencia de seguridad principal de Meta."
                },
                {
                  id: "q3_4",
                  question: "4. El Business Manager permite integrar simultáneamente una Fanpage, un perfil de Instagram comercial y una línea de WhatsApp Business.",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 0,
                  explanation: "Verdadero: Business Manager centraliza todos los activos de tu empresa."
                },
                {
                  id: "q3_5",
                  question: "5. Para ejecutar campañas de pauta dirigidas a la conversión por chat, ¿qué plataforma debe contar con un catálogo activo y perfil corporativo?",
                  options: [
                    "Facebook Messenger personal.",
                    "WhatsApp personal.",
                    "WhatsApp Business.",
                    "Telegram personal."
                  ],
                  correctIndex: 2,
                  explanation: "WhatsApp Business ofrece herramientas profesionales como catálogo de productos y perfiles comerciales."
                }
              ]
            }
          ]
        },

        // =====================================================================
        // MÓDULO 5: Logística, envíos y devoluciones
        // =====================================================================
        {
          id: "mod_5",
          title: "MÓDULO 5: Logística, envíos y devoluciones",
          description: "Aprende la gestión operativa de entregas, modelos de fulfillment, empaque eficiente y manejo proactivo de novedades para evitar devoluciones.",
          lessons: [
            // Lección 1
            {
              id: "m5_l1",
              title: "LECCIÓN 1: Fundamentos de logística y modelos de fulfillment (Propio, Tercerizado y Dropshipping)",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=uvC6dXiiCxo",
              videoUrls: [
                "https://www.youtube.com/watch?v=uvC6dXiiCxo",
                "https://www.youtube.com/watch?v=rjfRbyxTPok"
              ],
              summary: "Comprensión del flujo logístico desde la confirmación de la orden hasta la salida del paquete y elección del modelo ideal de fulfillment.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Comprensión del flujo logístico desde la confirmación de la orden hasta la salida del paquete.</li>
                      <li>Elección del modelo de fulfillment ideal según el capital y la etapa del negocio (propio, bodegas de terceros o dropshipping).</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>En el e-commerce, una venta solo es real cuando el producto llega a manos del cliente y el dinero ingresa a tu balance. Dependiendo de tu presupuesto y tiempo, existen 3 formas operativas de entregar pedidos: haciéndolo tú mismo, delegando la bodega o vendiendo el inventario de un proveedor.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. El Ciclo Logístico Básico</h3>
                  <ol>
                    <li><strong>Recepción:</strong> Confirmación inmediata de datos con el cliente (nombre, cédula/ID, dirección exacta con barrio y celular).</li>
                    <li><strong>Alistamiento (Picking & Packing):</strong> Localizar el producto, verificar que no tenga defectos y empacar.</li>
                    <li><strong>Despacho:</strong> Entrega a la transportadora para inicio del transporte.</li>
                  </ol>

                  <h3>2. Los 3 Modelos de Fulfillment</h3>
                  <div class="models-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0;">
                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:rgba(255,255,255,0.1);border-radius:4px;">PROPIO</span>
                      <h4>Almacenamiento Propio (In-House)</h4>
                      <p>Compras inventario, lo guardas en tu casa o local, empacas y llevas a la transportadora.</p>
                      <small style="color:var(--text-muted);display:block;margin-top:6px;">🎯 <em>Para quién es: Principiantes con stock propio que buscan máximo margen y control de calidad.</em></small>
                    </div>

                    <div class="model-card" style="background:rgba(99,102,241,0.1);border:1px solid var(--accent-primary);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:var(--accent-primary);color:#fff;border-radius:4px;">TERCERIZADO</span>
                      <h4>Fulfillment Tercerizado (Bodega externa)</h4>
                      <p>Compras tu inventario y lo envías a una bodega especializada que empaca y despacha automáticamente cada vez que vendes.</p>
                      <small style="color:var(--text-muted);display:block;margin-top:6px;">🎯 <em>Para quién es: Negocios en crecimiento que no quieren perder tiempo empacando cajas.</em></small>
                    </div>

                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="font-size:0.75rem;font-weight:800;padding:2px 8px;background:rgba(255,255,255,0.1);border-radius:4px;">DROPSHIPPING</span>
                      <h4>Dropshipping</h4>
                      <p>No compras el inventario por adelantado; cuando vendes, el proveedor despacha directamente al cliente final a tu nombre.</p>
                      <small style="color:var(--text-muted);display:block;margin-top:6px;">🎯 <em>Para quién es: Emprendedores con bajo capital inicial que quieren validar productos sin riesgo de stock.</em></small>
                    </div>
                  </div>

                  <h3>📌 Ejemplos</h3>
                  <p>Si vendes bolsos y compras 20 unidades al por mayor, empezarás con fulfillment propio empacando en tu casa. Si pasas a vender 30 bolsos diarios, te conviene pagar una bodega de fulfillment tercerizado para enfocarte solo en pauta publicitaria.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🍳 <strong>Fulfillment propio:</strong> Cocinar en tu casa para tus invitados.</p>
                    <p>🍽️ <strong>Fulfillment tercerizado:</strong> Contratar un servicio de catering que cocine tus ingredientes.</p>
                    <p>🛵 <strong>Dropshipping:</strong> Ordenar comida a domicilio directamente a la casa de tus invitados con el menú del restaurante.</p>
                  </div>

                  <h3>✏️ Actividades</h3>
                  <p>Haz un cuadro comparativo de tu negocio actual definiendo cuál de los 3 modelos se adapta a tu presupuesto y tiempo disponible hoy.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>📝 Resumen</h3>
                  <p>El fulfillment define cómo operas tu día a día. Elegir el modelo correcto evita ahogarte en tareas operativas o gastar dinero en bodegas antes de tiempo.</p>

                  <h3>📺 Recursos recomendados (Videos)</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Qué es Fulfillment y cómo funciona):</strong> Canal <em>Marketing4eCommerce</em> — Explicación visual de centros de fulfillment.</li>
                    <li>🎥 <strong>Video 2 (Modelos Logísticos y Vender sin Stock):</strong> Canal <em>Tiendanube</em> — Dropshipping vs Stock Propio.</li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Pagar bodegas tercerizadas cuando apenas vendes 1 o 2 pedidos a la semana.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Despachar siempre dentro de las primeras 24 horas tras confirmar el pedido.</p>

                  <h3>📌 Tarea</h3>
                  <p>Elige tu modelo de fulfillment para este mes y anota tu tiempo máximo de respuesta para despachar cada orden.</p>
                </div>
              `,
              checklist: [
                "Conozco las etapas del ciclo logístico.",
                "Entiendo la diferencia entre fulfillment propio, tercerizado y dropshipping.",
                "Elegí el modelo operativo para arrancar."
              ]
            },

            // Lección 2
            {
              id: "m5_l2",
              title: "LECCIÓN 2: Gestión de inventario, empaque y entrega de última milla",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=rqT8XuUOErA",
              videoUrls: [
                "https://www.youtube.com/watch?v=rqT8XuUOErA",
                "https://www.youtube.com/watch?v=hujwEXgU6HQ"
              ],
              summary: "Control básico de stock, cálculo de punto de reorden, estándares de empaque para evitar sobrecostos y manejo de transportadoras de última milla.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Control básico de stock y cálculo de punto de reorden para no quebrar inventario.</li>
                      <li>Estándares de empaque para evitar sobrecostos por peso volumétrico y roturas.</li>
                      <li>Manejo de transportadoras y mensajería urbana para la última milla.</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>Vender un producto que no tienes en stock o recibir quejas de clientes porque el paquete llegó roto destruye tu reputación. En esta lección aprenderás a cuidar tu inventario, empacar rápido y coordinar la entrega final con las transportadoras.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. Gestión Práctica de Inventario</h3>
                  <ul>
                    <li><strong>Stock Mínimo (Punto de Reorden):</strong> La cantidad mínima de unidades que debes tener antes de hacer un nuevo pedido a tu proveedor.
                      <div class="callout callout-accent" style="margin:1rem 0;background:rgba(99,102,241,0.08);border-left-color:var(--accent-primary);">
                        <p style="font-weight:700;font-size:1rem;margin:0;">
                          📐 Punto de reorden = (Ventas diarias promedio × Días que tarda el proveedor) + Stock de seguridad
                        </p>
                      </div>
                    </li>
                    <li><strong>Control de unidades:</strong> Si tienes 10 unidades, nunca anuncies 15; sincroniza tu inventario diariamente.</li>
                  </ul>

                  <h3>2. Empaque Seguro y Optimización de Costos</h3>
                  <ul>
                    <li><strong>El factor peso volumétrico:</strong> Las transportadoras cobran por lo que pese más: el peso real en báscula o el tamaño de la caja (volumen).</li>
                    <li><strong>Regla de oro del empaque:</strong> Caja o bolsa ajustada al tamaño del producto + protección interna (plástico burbuja o papel Kraft) + cinta selladora resistente.</li>
                  </ul>

                  <h3>3. Última Milla y Selección de Transportadoras</h3>
                  <ul>
                    <li><strong>Envíos Urbanos (Mismo día / Siguiente día):</strong> Mensajeros locales en moto para entregas ultrarrápidas en tu ciudad.</li>
                    <li><strong>Envíos Nacionales:</strong> Transportadoras de encomiendas con cobertura intermunicipal.</li>
                  </ul>

                  <h3>📌 Ejemplos</h3>
                  <p>Si vendes una prenda de vestir ligera, usar una caja grande de cartón hará que la transportadora te cobre el flete al doble por espacio. Enviarla en una bolsa de seguridad para e-commerce reduce el costo del flete a la mitad.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🛡️ El empaque es el <strong>chaleco antibalas</strong> de tu producto durante el viaje; si es débil, el producto no sobrevive al trato de los camiones de encomienda.</p>
                  </div>

                  <h3>✏️ Actividades</h3>
                  <p>Consigue los insumos para empacar un producto de prueba, pésalo y mide sus dimensiones (alto, ancho, largo) para cotizar el flete exacto en una transportadora local.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>📝 Resumen</h3>
                  <p>El control de inventario garantiza que cumplas lo prometido, mientras que un empaque eficiente protege tu mercancía y cuida tu bolsillo reduciendo costos de flete.</p>

                  <h3>📺 Recursos recomendados (Videos)</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Control de Inventario Básico en Excel):</strong> Canal <em>Saber Programas</em> — Cómo crear INVENTARIO y control de STOCK.</li>
                    <li>🎥 <strong>Video 2 (Cómo calcular Peso Volumétrico y Tarifas):</strong> Canal <em>Manu Martínez Marketing</em> — Calcula costo de envío por peso.</li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Seguir pautando anuncios de un producto cuando el inventario ya se agotó.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Compartir la guía de rastreo y el enlace de la transportadora por WhatsApp en cuanto el paquete sea recolectado.</p>

                  <h3>📌 Tarea</h3>
                  <p>Diseña tu plantilla básica de inventario con: Nombre del producto, Unidades disponibles, Costo unitario y Punto de reorden.</p>
                </div>
              `,
              checklist: [
                "Calculé mi stock mínimo de seguridad.",
                "Utilizo bolsas o cajas ajustadas al tamaño del producto.",
                "Tengo identificado al menos un operador logístico para envíos locales y nacionales."
              ]
            },

            // Lección 3
            {
              id: "m5_l3",
              title: "LECCIÓN 3: Gestión de novedades, devoluciones y logística inversa",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=uM7KrxoFnOM",
              videoUrls: [
                "https://www.youtube.com/watch?v=uM7KrxoFnOM",
                "https://www.youtube.com/watch?v=eeyXMPlGnsI"
              ],
              summary: "Protocolo de confirmación previa para reducir cancelaciones en Pago Contra Entrega (COD), manejo de novedades en ruta y logística inversa.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>🎓 Competencias adquiridas</h3>
                    <ul>
                      <li>Protocolo de confirmación previa para reducir la tasa de cancelación en pedidos Contra Entrega (COD).</li>
                      <li>Gestión proactiva de novedades en ruta (dirección errónea, cliente ausente).</li>
                      <li>Estructuración de políticas y costos de logística inversa (devoluciones y garantías).</li>
                    </ul>
                  </div>

                  <h2>Introducción</h2>
                  <p>En el e-commerce (especialmente con pago contra entrega), una entrega fallida representa pérdida directa de dinero en fletes de ida y vuelta. Aprenderás a blindar tus pedidos antes de enviarlos y a resolver incidencias en ruta para maximizar tu tasa de entregas efectivas.</p>

                  <h2>Desarrollo paso a paso</h2>

                  <h3>1. Confirmación Previa al Despacho (Anti-Cancelación)</h3>
                  <ul>
                    <li>Nunca despaches un pedido sin confirmación escrita o telefónica del cliente.</li>
                    <li>Verifica los 4 datos obligatorios: Dirección exacta (con torre/apto/barrio), punto de referencia, persona autorizada para recibir y confirmación de que tiene el dinero en efectivo disponible.</li>
                  </ul>

                  <h3>2. Manejo Diario de Novedades</h3>
                  <ul>
                    <li><strong>Novedad:</strong> Sucede cuando la transportadora intenta entregar pero no puede (ejemplo: Dirección no encontrada, Cliente no estaba en casa, No tenía el dinero).</li>
                    <li><strong>Protocolo de rescate en menos de 2 horas:</strong> Contacta de inmediato al cliente por WhatsApp: <em>"Hola [Nombre], el repartidor estuvo en tu dirección pero no pudo entregarte. ¿A qué hora podemos coordinar el segundo intento hoy?"</em></li>
                  </ul>

                  <h3>3. Logística Inversa (Devoluciones y Garantías)</h3>
                  <ul>
                    <li><strong>Devolución por no entrega:</strong> Si el paquete se devuelve, asumes el costo del flete. Regístralo en tu hoja de costos para medir tu tasa de devolución (el objetivo debe ser menor al 10%-12%).</li>
                    <li><strong>Garantía o Cambio por defecto:</strong> Establece una política clara: el cliente entrega el producto en buen estado y tú coordinas la recolección o reenvío.</li>
                  </ul>

                  <h3>📌 Ejemplos</h3>
                  <p>Si envías 100 paquetes y 15 se devuelven por no confirmar la dirección, habrás perdido el costo de 15 fletes dobles. Si llamas y confirmas antes, puedes reducir las devoluciones a solo 5.</p>

                  <h3>💡 Analogías</h3>
                  <div class="analogy-box" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:1.25rem;margin:1.5rem 0;">
                    <p>🚑 La novedad de entrega es como un <strong>paciente en urgencias</strong>: si lo atiendes en los primeros minutos lo salvas (concretas la entrega); si lo dejas para el día siguiente, el paquete se devuelve y pierdes el dinero.</p>
                  </div>

                  <h3>✏️ Actividades</h3>
                  <p>Redacta un guion de 3 líneas para confirmar pedidos por WhatsApp antes de generar la guía de envío.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>📝 Resumen</h3>
                  <p>El dinero real en el e-commerce no se hace solo vendiendo, sino entregando. Controlar las novedades y confirmar los despachos protege tu margen y reduce drásticamente las devoluciones.</p>

                  <h3>📺 Recursos recomendados (Videos)</h3>
                  <ul>
                    <li>🎥 <strong>Video 1 (Cómo Bajar Devoluciones en Contra Entrega):</strong> Canal <em>Iván Caicedo</em> — Como bajar tus DEVOLUCIONES haciendo DROPSHIPPING.</li>
                    <li>🎥 <strong>Video 2 (Logística de Última Milla y Novedades Operativas):</strong> Canal <em>Conduce Tu Empresa</em> — La Última milla | Concepto, Importancia y Soluciones.</li>
                  </ul>

                  <h3>⚠️ Errores comunes</h3>
                  <p style="color:var(--danger);">❌ Despachar pedidos "fantasma" sin haber validado si el cliente realmente los pidió o si la dirección existe.</p>

                  <h3>✅ Buenas prácticas</h3>
                  <p style="color:var(--success);">✔️ Incluir en el precio de venta un colchón de seguridad del 3% al 5% para cubrir los costos de fletes de posibles devoluciones.</p>

                  <h3>📌 Tarea</h3>
                  <p>Crea tu mensaje de rescate de novedades para enviar a clientes que no estaban en casa al momento de la entrega.</p>
                </div>
              `,
              checklist: [
                "Implementé el guion de confirmación previa de datos.",
                "Reviso las novedades de las transportadoras diariamente a primera hora.",
                "Cuento con una política clara de cambios y garantías redactada."
              ]
            },

            // Quiz Módulo 5
            {
              id: "m5_quiz",
              title: "EVALUACIÓN: Logística, envíos y devoluciones",
              type: "quiz",
              summary: "Evaluación requerida para aprobar el Módulo 5. Puntaje mínimo: 70%",
              minScore: 70,
              questions: [
                {
                  id: "q5_1",
                  question: "1. En el modelo de Dropshipping, ¿cuál de las siguientes afirmaciones es correcta respecto al inventario?",
                  options: [
                    "Debes comprar grandes cantidades por adelantado y guardarlas en tu casa.",
                    "Es obligatorio contratar una bodega de fulfillment propia.",
                    "No compras inventario por adelantado; el proveedor despacha el producto directamente al cliente final.",
                    "La transportadora compra el producto por ti antes de enviarlo."
                  ],
                  correctIndex: 2,
                  explanation: "En dropshipping no compras inventario anticipado; el proveedor envía directamente al comprador."
                },
                {
                  id: "q5_2",
                  question: "2. Las empresas de mensajería y paquetería cobran el flete basándose únicamente en el peso real que marca la báscula, sin importar el tamaño de la caja.",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 1,
                  explanation: "Falso: Cobran por el mayor valor entre el peso real y el peso volumétrico (tamaño)."
                },
                {
                  id: "q5_3",
                  question: "3. ¿Qué representa el 'Punto de Reorden' en la gestión básica de inventario?",
                  options: [
                    "La cantidad máxima de paquetes que un mensajero puede llevar en el día.",
                    "El total de devoluciones acumuladas durante el mes.",
                    "El nivel mínimo de unidades en stock que te avisa cuándo debes realizar un nuevo pedido a tu proveedor.",
                    "El precio con descuento que le ofreces al cliente en su segunda compra."
                  ],
                  correctIndex: 2,
                  explanation: "El punto de reorden es la alerta de stock mínimo para pedir nuevo inventario antes de agotar."
                },
                {
                  id: "q5_4",
                  question: "4. ¿Cuál es la acción más efectiva para reducir las cancelaciones y devoluciones en pedidos con modalidad Pago Contra Entrega (COD)?",
                  options: [
                    "Despachar el paquete de inmediato sin revisar los datos.",
                    "Confirmar previamente por WhatsApp o llamada la dirección completa, referencias y disponibilidad de dinero del cliente.",
                    "Esperar una semana antes de entregar el paquete a la transportadora.",
                    "Enviar el producto sin número de guía para darle una sorpresa al cliente."
                  ],
                  correctIndex: 1,
                  explanation: "Confirmar dirección y datos antes de enviar reduce drásticamente las entregas fallidas COD."
                },
                {
                  id: "q5_5",
                  question: "5. En logística de e-commerce, una 'Novedad en ruta' (como cliente ausente o dirección no encontrada) debe resolverse y gestionarse el mismo día para evitar que el paquete sea devuelto a origen.",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 0,
                  explanation: "Verdadero: Atender las novedades en las primeras horas rescata la entrega antes del retorno."
                }
              ]
            }
          ]
        },

        // =====================================================================
        // MÓDULO 6: Marketing Digital y Redes Sociales para Vender
        // =====================================================================
        {
          id: "mod_6",
          title: "MÓDULO 6: Marketing Digital y Redes Sociales para Vender",
          description: "Domina el embudo de ventas TOFU-MOFU-BOFU, estrategias de contenido en redes sociales, automatizaciones de Email Marketing y publicidad pagada en Meta Ads.",
          lessons: [
            // Lección 6.1
            {
              id: "m6_l1",
              title: "LECCIÓN 6.1: Fundamentos y Embudo de Ventas Digital para Tiendas en Línea",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=ABRqXRMLt-8",
              videoUrls: [
                "https://www.youtube.com/watch?v=ABRqXRMLt-8",
                "https://www.youtube.com/watch?v=K_hiCkiIrlY"
              ],
              summary: "Aprende el concepto del Embudo de Conversión (TOFU-MOFU-BOFU) y cómo llevar desconocidos a compradores recurrentes.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>💡 Concepto Clave (Nivel Cero)</h3>
                    <p>El marketing digital para comercio electrónico no consiste en publicar al azar, sino en guiar a una persona que nunca te conoce hasta que realiza una compra y vuelve a comprar. Esto se organiza en el <strong>Embudo de Conversión (TOFU-MOFU-BOFU)</strong>.</p>
                  </div>

                  <h2>Etapas del Embudo de Ventas Digital</h2>
                  <div class="models-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0;">
                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="background:var(--accent-primary);color:#fff;">TOFU</span>
                      <h4>1. Atracción (Top of Funnel)</h4>
                      <p>Captar la atención de desconocidos mediante contenido de valor, videos cortos y anuncios de descubrimiento.</p>
                    </div>

                    <div class="model-card" style="background:var(--bg-sidebar);border:1px solid var(--border-color);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="background:var(--warning);color:#fff;">MOFU</span>
                      <h4>2. Consideración (Middle of Funnel)</h4>
                      <p>Demostrar cómo tu producto resuelve un problema específico, responder dudas y generar confianza.</p>
                    </div>

                    <div class="model-card" style="background:rgba(16,185,129,0.1);border:1px solid var(--success);padding:1.25rem;border-radius:var(--radius-md);">
                      <span class="model-badge" style="background:var(--success);color:#fff;">BOFU</span>
                      <h4>3. Conversión (Bottom of Funnel)</h4>
                      <p>La compra final a través de una oferta clara, llamados a la acción (CTA) directos y proceso de pago sin fricción.</p>
                    </div>
                  </div>

                  <p>🔄 <strong>Retención y Recomendación:</strong> Recompras y fidelización a través de una buena experiencia de entrega y seguimiento.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>🤖 Caja de Herramientas & Prompt de IA</h3>
                  <div class="callout callout-accent" style="background:rgba(99,102,241,0.08);border-left-color:var(--accent-primary);">
                    <p><strong>Prompt para Generar tu Embudo con IA:</strong></p>
                    <code style="display:block;padding:10px;background:var(--bg-sidebar);border-radius:6px;margin-top:6px;font-size:0.88rem;">
                      Actúa como un estratega de marketing digital para comercio electrónico. Mi tienda online vende: [DESCRIBE TU PRODUCTO O NICHO].<br><br>
                      Diseña un embudo de ventas sencillo de 3 etapas (Atracción, Consideración y Conversión). Para cada etapa incluye:<br>
                      1. Objetivo principal.<br>
                      2. Formato de contenido o mensaje sugerido.<br>
                      3. Un llamado a la acción (CTA) exacto para utilizar en mis publicaciones.
                    </code>
                  </div>

                  <h3>✏️ Actividad Práctica</h3>
                  <ol>
                    <li>Define el perfil de tu cliente ideal (quién es, qué problema tiene y por qué compraría tu producto).</li>
                    <li>Escribe una idea de publicación o video para cada fase del embudo (1 para atraer, 1 para educar y 1 directa de venta).</li>
                  </ol>

                  <h3>📺 Videos de Apoyo Recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1:</strong> <em>Qué es el Embudo de Ventas en Marketing Digital</em> (Canal Cyberclick)</li>
                    <li>🎥 <strong>Video 2:</strong> <em>Marketing Digital para Empresas B2C: El Embudo que Transforma Desconocidos en Clientes</em> (Canal Caro Dubi)</li>
                  </ul>
                </div>
              `,
              checklist: [
                "Tengo definido el perfil y principal dolor de mi cliente ideal.",
                "Identifico con claridad qué tipo de mensaje usar en cada etapa del embudo (Atracción, Consideración, Conversión).",
                "Redacté un llamado a la acción (CTA) específico para mis publicaciones de venta."
              ]
            },

            // Lección 6.2
            {
              id: "m6_l2",
              title: "LECCIÓN 6.2: Marketing de Contenidos y Social Commerce (Instagram, TikTok y Facebook)",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=IFgPzdWO_wU",
              videoUrls: [
                "https://www.youtube.com/watch?v=IFgPzdWO_wU"
              ],
              summary: "Aprende los pilares de contenido (UGC, Problema-Solución, Prueba Social) y cómo convertir tus redes en canales de compra directa.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>💡 Concepto Clave (Nivel Cero)</h3>
                    <p>Las redes sociales ya no son solo vitrinas de fotos; son canales de venta directa (<strong>Social Commerce</strong>). Para vender sin depender 100% de anuncios costosos, debes combinar dos pilares principales.</p>
                  </div>

                  <h2>1. Pilares de Contenido</h2>
                  <ul>
                    <li><strong>Contenido UGC (User Generated Content / Demostrativo):</strong> Mostrar el producto en uso real, unboxing y antes/después.</li>
                    <li><strong>Entretenimiento y Problema-Solución:</strong> Videos verticales de 15-30 segundos atacando el dolor del cliente.</li>
                    <li><strong>Prueba Social:</strong> Testimonios, pedidos empaquetados y comentarios reales.</li>
                  </ul>

                  <h2>2. Configuración de Social Commerce</h2>
                  <ul>
                    <li>Enlace optimizado en bio hacia la tienda o canal de WhatsApp.</li>
                    <li>Catálogo y etiquetas de producto activadas en Instagram/Facebook para compra en 1 clic.</li>
                  </ul>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>🤖 Caja de Herramientas & Prompt de IA</h3>
                  <div class="callout callout-accent" style="background:rgba(99,102,241,0.08);border-left-color:var(--accent-primary);">
                    <p><strong>Prompt para Ideas de Videos Cortos (Reels/TikTok):</strong></p>
                    <code style="display:block;padding:10px;background:var(--bg-sidebar);border-radius:6px;margin-top:6px;font-size:0.88rem;">
                      Actúa como un creador de contenido viral y copywriter de comercio electrónico. Vendo: [NOMBRE Y DESCRIPCIÓN DEL PRODUCTO].<br><br>
                      Dame 5 ideas de guiones para videos cortos (Reels/TikTok de 20 segundos) siguiendo la estructura:<br>
                      • Gancho (primeros 3 segundos para detener el scroll)<br>
                      • Desarrollo / Demostración del producto (12 segundos)<br>
                      • Llamado a la acción (CTA) para visitar el link de la tienda o perfil (5 segundos).
                    </code>
                  </div>

                  <h3>✏️ Actividad Práctica</h3>
                  <ol>
                    <li>Graba con tu teléfono móvil un video corto (15 a 30 segundos) mostrando tu producto en acción con buena luz natural, siguiendo la fórmula Gancho + Demostración + CTA.</li>
                    <li>Publica el video como Reel/TikTok asegurándote de colocar el enlace de tu tienda en el perfil.</li>
                  </ol>

                  <h3>📺 Videos de Apoyo Recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1:</strong> <em>Aprende a crear contenido para ser VIRAL en redes sociales</em> (Canal converzzo)</li>
                    <li>🎥 <strong>Video 2:</strong> <em>Estrategia en Redes Sociales para tu Negocio | Crecer en Instagram</em> (Canal Jordi Segués)</li>
                  </ul>
                </div>
              `,
              checklist: [
                "Mi biografía de Instagram/TikTok tiene una descripción clara y el enlace directo de compra o WhatsApp.",
                "Apliqué la regla de los primeros 3 segundos (gancho visual o verbal) en mi video.",
                "Utilizo contenido demostrativo (UGC) mostrando el producto en uso real."
              ]
            },

            // Lección 6.3
            {
              id: "m6_l3",
              title: "LECCIÓN 6.3: Email Marketing Básico y Automatización de Retención",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=VT3ni8mbMUc",
              videoUrls: [
                "https://www.youtube.com/watch?v=VT3ni8mbMUc",
                "https://www.youtube.com/watch?v=HphPg7DjwTM"
              ],
              summary: "Monta secuencias automáticas de bienvenida y recupera compras perdidas con flujos de Carrito Abandonado.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>💡 Concepto Clave (Nivel Cero)</h3>
                    <p>El tráfico web es costoso; si una persona entra a tu tienda y se va sin comprar, pierdes esa inversión a menos que captures su contacto. El <strong>Email Marketing</strong> permite automatizar la comunicación con costo casi nulo por envío.</p>
                  </div>

                  <h2>Flujos Principales de Email Marketing</h2>
                  <ul>
                    <li><strong>Secuencia de Bienvenida:</strong> Se dispara al registrarse ofreciendo un descuento inicial o contenido de bienvenida.</li>
                    <li><strong>Flujo de Carrito Abandonado (El más rentable):</strong> Envío automático de 2 a 3 correos recordatorios (a la 1 hora, a las 24 horas y a las 48 horas) cuando un usuario dejó productos en el checkout sin finalizar el pago.</li>
                    <li><strong>Campañas Periódicas / Lanzamientos:</strong> Promociones por temporadas, fechas especiales o llegada de nuevo stock.</li>
                  </ul>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>🤖 Caja de Herramientas & Prompt de IA</h3>
                  <div class="callout callout-accent" style="background:rgba(99,102,241,0.08);border-left-color:var(--accent-primary);">
                    <p><strong>Prompt para Recuperación de Carritos:</strong></p>
                    <code style="display:block;padding:10px;background:var(--bg-sidebar);border-radius:6px;margin-top:6px;font-size:0.88rem;">
                      Actúa como un especialista en Email Marketing para tiendas online. Escribe una secuencia de 2 correos para recuperar carritos abandonados para una tienda de: [DESCRIPCIÓN DE TU TIENDA/PRODUCTO].<br><br>
                      • Correo 1 (Enviar 1 hora después): Tono amable recordando los productos olvidados y preguntando si tuvo algún problema con el pago.<br>
                      • Correo 2 (Enviar 24 horas después): Tono de urgencia ligera con un cupón de 10% de descuento por tiempo limitado.<br>
                      Incluye Asunto persuasivo y cuerpo del mensaje con espacio para el botón de compra.
                    </code>
                  </div>

                  <h3>✏️ Actividad Práctica</h3>
                  <ol>
                    <li>Crea una cuenta gratuita en una plataforma de Email Marketing (ej. Mailchimp, Klaviyo, Brevo o la herramienta nativa de tu plataforma web).</li>
                    <li>Redacta y deja activado el primer correo automático de carrito abandonado.</li>
                  </ol>

                  <h3>📺 Videos de Apoyo Recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1:</strong> <em>CÓMO HACER EMAIL MARKETING DESDE CERO | Estrategia Paso a Paso</em> (Canal Tribu Olaf)</li>
                    <li>🎥 <strong>Video 2:</strong> <em>Cómo Conectar Mailchimp Con Tienda De Shopify</em></li>
                  </ul>
                </div>
              `,
              checklist: [
                "Creé e integré la cuenta de email marketing con mi tienda online.",
                "Configuré la automatización de recuperación de carrito abandonado para enviarse dentro de las primeras 24 horas.",
                "El correo de recuperación incluye un asunto llamativo, botón directo al checkout y datos de contacto/soporte."
              ]
            },

            // Lección 6.4
            {
              id: "m6_l4",
              title: "LECCIÓN 6.4: Introducción Práctica a la Publicidad Pagada en Internet y Redes Sociales",
              type: "video_content",
              videoUrl: "https://www.youtube.com/watch?v=APLGmmxOBCY",
              videoUrls: [
                "https://www.youtube.com/watch?v=APLGmmxOBCY",
                "https://www.youtube.com/watch?v=NkjukD3ikUI"
              ],
              summary: "Aprende la estructura de campaña en Meta Ads (Campaña, Conjunto y Anuncio) y cómo lanzar presupuestos de prueba diarios.",
              contentHTML: `
                <div class="lesson-rich-content">
                  <div class="callout callout-primary">
                    <h3>💡 Concepto Clave (Nivel Cero)</h3>
                    <p>La publicidad pagada (Traffic Paid / Meta Ads) te permite comprar visibilidad inmediata frente a miles de clientes potenciales. Para principiantes, las reglas fundamentales son:</p>
                  </div>

                  <h2>1. Estructura de Campaña en Meta Ads</h2>
                  <ol>
                    <li><strong>Campaña:</strong> Donde eliges el objetivo (para ecommerce siempre seleccionar <strong>Ventas / Conversiones</strong>, no "Interacción" ni "Me gusta").</li>
                    <li><strong>Conjunto de Anuncios:</strong> Donde defines el presupuesto diario, la ubicación geográfica y la segmentación (público amplio o por intereses).</li>
                    <li><strong>Anuncio:</strong> El video o imagen con su texto persuasivo (copy) y el enlace directo al producto.</li>
                  </ol>

                  <h2>2. Presupuesto de Prueba</h2>
                  <p>Empezar con presupuestos mínimos diarios (ej. $3 a $5 USD por conjunto) para validar qué anuncio convierte mejor antes de escalar.</p>

                  <hr style="border:none;border-top:1px solid var(--border-color);margin:1.5rem 0;">

                  <h3>🤖 Caja de Herramientas & Prompt de IA</h3>
                  <div class="callout callout-accent" style="background:rgba(99,102,241,0.08);border-left-color:var(--accent-primary);">
                    <p><strong>Prompt para Textos Publicitarios (Copies):</strong></p>
                    <code style="display:block;padding:10px;background:var(--bg-sidebar);border-radius:6px;margin-top:6px;font-size:0.88rem;">
                      Actúa como un Media Buyer profesional en Meta Ads. Mi producto es: [NOMBRE Y PRECIO DEL PRODUCTO]. Mi público objetivo es: [HOMBRES/MUJERES, RANGO DE EDAD, CIUDAD/PAÍS].<br><br>
                      Genera 3 opciones de textos publicitarios (Copies) para anuncios en Instagram/Facebook con la estructura:<br>
                      1. Gancho llamativo.<br>
                      2. Beneficio principal que elimina una objeción.<br>
                      3. Llamado a la acción claro con escasez o garantía.
                    </code>
                  </div>

                  <h3>✏️ Actividad Práctica</h3>
                  <ol>
                    <li>Entra a Meta Ads Manager y configura un borrador de campaña con objetivo Ventas.</li>
                    <li>Sube un anuncio en formato video vertical (9:16) con el copy generado y define un presupuesto de prueba diario para tu ciudad o país.</li>
                  </ol>

                  <h3>📺 Videos de Apoyo Recomendados</h3>
                  <ul>
                    <li>🎥 <strong>Video 1:</strong> <em>APRENDE cómo hacer ANUNCIOS en 10MIN en Meta ADS</em> (Canal Juan ADS)</li>
                    <li>🎥 <strong>Video 2:</strong> <em>Cómo crear tu primera campaña en Meta Ads paso a paso</em> (Canal CaniPack)</li>
                  </ul>
                </div>
              `,
              checklist: [
                "Elegí el objetivo 'Ventas/Conversiones' en el nivel de Campaña.",
                "Definí un presupuesto de prueba controlado ($3 a $5 USD/día) y la segmentación geográfica correcta.",
                "El anuncio tiene un formato vertical (9:16) y dirige directamente a la página del producto."
              ]
            },

            // Quiz Módulo 6
            {
              id: "m6_quiz",
              title: "EVALUACIÓN: Marketing Digital y Redes Sociales para Vender",
              type: "quiz",
              summary: "Evaluación requerida para aprobar el Módulo 6. Puntaje mínimo: 70%",
              minScore: 70,
              questions: [
                {
                  id: "q6_1",
                  question: "1. ¿En la etapa de atracción (TOFU) del embudo de ventas, el objetivo principal siempre debe ser exigir la compra inmediata al cliente?",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 1,
                  explanation: "Falso: En atracción el objetivo es captar atención y generar interés; la compra directa se empuja principalmente en la etapa de conversión."
                },
                {
                  id: "q6_2",
                  question: "2. ¿Qué etapa del embudo se encarga de resolver dudas del producto y generar confianza antes de pagar?",
                  options: [
                    "Top of Funnel (Atracción)",
                    "Middle of Funnel (Consideración)",
                    "Fulfillment"
                  ],
                  correctIndex: 1,
                  explanation: "Middle of Funnel (Consideración) resuelve dudas y construye confianza antes de pedir la compra."
                },
                {
                  id: "q6_3",
                  question: "3. ¿Los primeros 3 segundos de un video corto (Reel o TikTok) son los más críticos para evitar que el usuario deslice y se vaya?",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 0,
                  explanation: "Verdadero: El gancho inicial determina si el algoritmo distribuirá el contenido a más personas."
                },
                {
                  id: "q6_4",
                  question: "4. ¿Cuál de los siguientes formatos suele generar mayor confianza en la decisión de compra?",
                  options: [
                    "Una foto de catálogo con fondo blanco genérico",
                    "Un video en uso real demostrando el beneficio y testimonios (UGC)",
                    "Una imagen solo con texto promocional"
                  ],
                  correctIndex: 1,
                  explanation: "El contenido demostrativo en uso real (UGC) genera mucha mayor confianza y tasa de conversión."
                },
                {
                  id: "q6_5",
                  question: "5. ¿Para generar ventas reales en una tienda online, es mejor elegir el objetivo 'Ventas/Conversiones' en Meta Ads?",
                  options: ["Verdadero", "Falso"],
                  correctIndex: 0,
                  explanation: "Verdadero: Debes elegir siempre el objetivo 'Ventas/Conversiones' para que el algoritmo busque personas con alta probabilidad de comprar."
                }
              ]
            }
          ]
        }
      ]
    }
  ],
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
