// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = 80;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ===== HEADER SCROLL TRANSITION PROGRESIVA =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const scrollProgress = Math.min(scrollY / 200, 1);

  if (scrollProgress > 0.5) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== CAROUSEL FUNCTIONALITY OPTIMIZADO =====
document.addEventListener("DOMContentLoaded", () => {
  // 🚀 CONFIGURACIÓN RÁPIDA: Solo cambia estos números cuando agregues/quites imágenes
  const categories = {
    novias: 23, // Cambia este número cuando agregues/quites imágenes
    madrinas: 18, // Cambia este número cuando agregues/quites imágenes
    invitadas: 18 // Cambia este número cuando agregues/quites imágenes
  };

  // 🎯 CONFIGURACIÓN DE NOMBRES: Define los patrones de nombres de tus imágenes
  const imagePatterns = {
    madrinas: {
      pattern: 'img/madrinas/{index}.jpg',
      // customNames: ['madrina_1.jpg', 'madrina_2.png', 'bridesmaid.webp']
    },
    novias: {
      // Patrón: nombre base + número + extensión
      pattern: 'img/novias/{index}.jpg',
      // Si tus imágenes tienen nombres diferentes, usa un array:
      // customNames: ['novia1.jpg', 'vestido-blanco.png', 'bride-photo.webp']
    },
    invitadas: {
      pattern: 'img/invitadas/{index}.jpg',
      // customNames: ['invitada-1.jpg', 'guest-dress.png', 'formal.webp']
    }
  };

  let currentCategory = "novias";
  let currentIndex = 0;
  let isDragging = false;
  let startPosY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationFrame = 0;
  let isTransitioning = false; // Nueva variable para controlar las transiciones laterales

  const tabs = document.querySelectorAll(".tab-button");
  const carouselContainer = document.getElementById("carouselContainer");
  const carouselTrack = document.getElementById("carouselTrack");
  const arrowUp = document.getElementById("arrowUp");
  const arrowDown = document.getElementById("arrowDown");

  // 🚀 Función de carga súper rápida
  function loadCategoryImages(category) {
    carouselTrack.innerHTML = '';

    if (!categories[category]) {
      console.warn(`Categoría no encontrada: ${category}`);
      return;
    }

    const imageCount = categories[category];
    const pattern = imagePatterns[category];

    for (let i = 1; i <= imageCount; i++) {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');

      const img = document.createElement('img');

      // Usar nombres personalizados si están definidos, sino usar el patrón
      if (pattern.customNames && pattern.customNames[i - 1]) {
        img.src = `img/${category}/${pattern.customNames[i - 1]}`;
      } else {
        img.src = pattern.pattern.replace('{index}', i);
      }

      img.alt = `${category.slice(0, -1)} ${i}`;
      img.loading = i <= 3 ? 'eager' : 'lazy'; // Carga rápida para las primeras 3

      // Manejo de errores más silencioso
      img.onerror = function () {
        console.warn(`Imagen no encontrada: ${this.src}`);
        // En lugar de ocultar, mostrar placeholder
        this.style.backgroundColor = '#f0f0f0';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.innerHTML = '📷';
      };

      slide.appendChild(img);
      carouselTrack.appendChild(slide);
    }
  }

  // Nueva función para asegurar que las slides tengan la altura correcta
  function updateSlideHeights() {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const containerHeight = carouselContainer.clientHeight;

    slides.forEach(slide => {
      slide.style.height = `${containerHeight}px`;
    });
  }

  // Función corregida para calcular la posición
  function setPositionByIndex() {
    const containerHeight = carouselContainer.clientHeight;
    currentTranslate = Math.round(currentIndex * -containerHeight);
    prevTranslate = currentTranslate;
    carouselTrack.style.transform = `translateY(${currentTranslate}px)`;
  }

  // Función para actualizar el estado de las flechas
  function updateArrows() {
    if (arrowUp && arrowDown) {
      arrowUp.disabled = currentIndex === 0;
      arrowDown.disabled = currentIndex === categories[currentCategory] - 1;
    }
  }

  // Funciones para navegación con flechas
  function goToPrevious() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      setPositionByIndex();
      updateArrows();
    }
  }

  function goToNext() {
    if (currentIndex < categories[currentCategory] - 1) {
      currentIndex += 1;
      setPositionByIndex();
      updateArrows();
    }
  }

  // Función para ir a un slide específico
  function goToSlide(index) {
    currentIndex = index;
    setPositionByIndex();
    updateArrows();
  }


  // MODIFICADO: Transición lateral entre categorías
  function switchCategoryWithTransition(newCategory) {
    if (isTransitioning || newCategory === currentCategory) return;
    isTransitioning = true;

    // Función interna para manejar la transición lateral
    const startLateralTransition = () => {
      // Determinar dirección de la animación
      const categoryOrder = ['madrinas','novias','invitadas'];
      const currentCategoryIndex = categoryOrder.indexOf(currentCategory);
      const newCategoryIndex = categoryOrder.indexOf(newCategory);
      const moveRight = newCategoryIndex > currentCategoryIndex;

      // Fase 1: Slide out (deslizar hacia fuera)
      carouselTrack.style.transition = 'transform 0.2s ease-in-out';
      carouselTrack.style.transform = moveRight ? 'translateX(-100%)' : 'translateX(100%)';

      // Fase 2: Cambiar contenido y slide in (después de 200ms)
      setTimeout(() => {
        // Cambiar categoría y resetear índice
        currentCategory = newCategory;
        currentIndex = 0;

        // Cargar nuevas imágenes
        loadCategoryImages(currentCategory);

        // Posicionar el track fuera de la vista en el lado opuesto
        carouselTrack.style.transition = 'none';
        carouselTrack.style.transform = moveRight ? 'translateX(100%)' : 'translateX(-100%)';

        // Actualizar alturas después de cargar imágenes
        setTimeout(() => {
          updateSlideHeights();

          // Fase 3: Slide in (deslizar hacia dentro)
          setTimeout(() => {
            carouselTrack.style.transition = 'transform 0.2s ease-in-out';
            carouselTrack.style.transform = 'translateX(0)';

            // Fase 4: Después de que termine la animación horizontal, aplicar posición vertical
            setTimeout(() => {
              carouselTrack.style.transition = 'transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)';
              setPositionByIndex();
              updateArrows();
              isTransitioning = false;
            }, 200);
          }, 50);
        }, 50);
      }, 200);
    };

    // Lógica condicional: si ya estamos en la primera imagen, saltar a la transición lateral
    if (currentIndex === 0) {
      startLateralTransition();
    } else {
      // Si no estamos en la primera imagen, volver al inicio y esperar
      goToSlide(0);
      setTimeout(() => {
        startLateralTransition();
      }, 700); // 700ms de espera para la animación de subida
    }
  }

  // Manejar redimensionamiento de ventana
  function handleResize() {
    setTimeout(() => {
      carouselContainer.offsetHeight;
      setPositionByIndex();
      updateSlideHeights();
    }, 150);
  }

  // Funciones de interacción táctil/mouse
  function getPosition(event) {
    return event.type.includes('mouse') ? event.pageY : event.touches[0].clientY;
  }

  function animation() {
    carouselTrack.style.transform = `translateY(${currentTranslate}px)`;
    if (isDragging) {
      animationFrame = requestAnimationFrame(animation);
    }
  }

  function touchStart(event) {
    if (event.target.closest('.carousel-arrow') || isTransitioning) {
      return;
    }

    event.preventDefault();
    isDragging = true;
    startPosY = getPosition(event);
    carouselTrack.style.transition = 'none';
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(animation);
  }

  function touchMove(event) {
    if (isDragging && !isTransitioning) {
      event.preventDefault();
      const currentPosition = getPosition(event);
      currentTranslate = prevTranslate + currentPosition - startPosY;
    }
  }

  function touchEnd() {
    if (!isDragging || isTransitioning) return;

    isDragging = false;
    cancelAnimationFrame(animationFrame);

    const movedBy = currentTranslate - prevTranslate;
    const containerHeight = carouselContainer.clientHeight;
    const threshold = containerHeight * 0.15;

    if (movedBy < -threshold && currentIndex < categories[currentCategory] - 1) {
      currentIndex += 1;
    } else if (movedBy > threshold && currentIndex > 0) {
      currentIndex -= 1;
    }

    carouselTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
    setPositionByIndex();
    updateArrows();
  }

  // ===== EVENT LISTENERS =====

  // Event Listeners para arrastre
  carouselContainer.addEventListener("mousedown", touchStart, { passive: false });
  carouselContainer.addEventListener("touchstart", touchStart, { passive: false });
  document.addEventListener("mouseup", touchEnd);
  document.addEventListener("touchend", touchEnd);
  document.addEventListener("mousemove", touchMove, { passive: false });
  document.addEventListener("touchmove", touchMove, { passive: false });

  // Event Listeners para las flechas
  if (arrowUp && arrowDown) {
    arrowUp.addEventListener("click", goToPrevious);
    arrowDown.addEventListener("click", goToNext);
  }

  // MODIFICADO: Event Listeners para los botones de categoría con transición lateral
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      if (isTransitioning) return; // Prevenir clics múltiples durante transición

      const newCategory = tab.dataset.category;

      // Actualizar estado visual de botones
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Usar transición lateral si es diferente categoría
      if (newCategory !== currentCategory) {
        switchCategoryWithTransition(newCategory);
      }
    });
  });

  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (isTransitioning) return;

    if (e.key === 'ArrowDown' && currentIndex < categories[currentCategory] - 1) {
      currentIndex += 1;
      setPositionByIndex();
      updateArrows();
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      currentIndex -= 1;
      setPositionByIndex();
      updateArrows();
    }
  });

  // Event listener para redimensionamiento
  window.addEventListener('resize', handleResize);

  // ===== INICIALIZACIÓN SÚPER RÁPIDA =====

  // Carga inicial inmediata
  loadCategoryImages(currentCategory);
  setTimeout(() => {
    updateSlideHeights();
    setPositionByIndex();
    updateArrows();
  }, 100);
});