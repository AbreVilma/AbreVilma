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

// ===== CAROUSEL FUNCTIONALITY CON CARGA AUTOMÁTICA =====
document.addEventListener("DOMContentLoaded", async () => {
  // Variables globales
  let categories = {};
  let currentCategory = "novias";
  let currentIndex = 0;
  let isDragging = false;
  let startPosY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationFrame = 0;

  const tabs = document.querySelectorAll(".tab-button");
  const carouselContainer = document.getElementById("carouselContainer");
  const carouselTrack = document.getElementById("carouselTrack");
  const arrowUp = document.getElementById("arrowUp");
  const arrowDown = document.getElementById("arrowDown");

  // Función para cargar la configuración de imágenes automáticamente
  async function loadImageConfig() {
    try {
      const response = await fetch('get_images.php');
      if (!response.ok) {
        throw new Error('No se pudo cargar la configuración de imágenes');
      }
      
      const data = await response.json();
      
      // Convertir la estructura de datos
      categories = {};
      for (const [category, info] of Object.entries(data)) {
        categories[category] = {
          count: info.count,
          images: info.images
        };
      }
      
      console.log('Configuración de imágenes cargada:', categories);
      return true;
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      
      // Fallback: intentar método de detección por intentos
      console.log('Usando método de detección por intentos...');
      return await loadImagesByDetection();
    }
  }

  // Método alternativo: detección por intentos (menos eficiente pero funciona sin PHP)
  async function loadImagesByDetection() {
    const categoryNames = ['novias', 'madrinas', 'invitadas'];
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    categories = {};
    
    for (const category of categoryNames) {
      categories[category] = {
        count: 0,
        images: []
      };
      
      let imageIndex = 1;
      let consecutiveFailures = 0;
      const maxConsecutiveFailures = 5; // Si fallan 5 seguidas, parar
      
      while (consecutiveFailures < maxConsecutiveFailures) {
        let imageFound = false;
        
        // Intentar diferentes extensiones
        for (const ext of extensions) {
          const imagePath = `img/${category}/${imageIndex}.${ext}`;
          
          try {
            const imageExists = await checkImageExists(imagePath);
            if (imageExists) {
              categories[category].images.push(`${imageIndex}.${ext}`);
              categories[category].count++;
              imageFound = true;
              consecutiveFailures = 0;
              break;
            }
          } catch (e) {
            // Continuar con la siguiente extensión
          }
        }
        
        if (!imageFound) {
          consecutiveFailures++;
        }
        
        imageIndex++;
        
        // Límite de seguridad para evitar bucles infinitos
        if (imageIndex > 200) break;
      }
      
      console.log(`${category}: ${categories[category].count} imágenes encontradas`);
    }
    
    return Object.keys(categories).length > 0;
  }

  // Función para verificar si una imagen existe
  function checkImageExists(imagePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imagePath;
      
      // Timeout después de 2 segundos
      setTimeout(() => resolve(false), 2000);
    });
  }

  // Función para cargar imágenes dinámicamente
  function loadCategoryImages(category) {
    carouselTrack.innerHTML = '';
    
    if (!categories[category] || categories[category].count === 0) {
      console.warn(`No se encontraron imágenes para la categoría: ${category}`);
      return;
    }
    
    const categoryData = categories[category];
    
    categoryData.images.forEach((imageName, index) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      
      const img = document.createElement('img');
      img.src = `img/${category}/${imageName}`;
      img.alt = `${category.slice(0, -1)} ${index + 1}`;
      img.loading = index <= 3 ? 'eager' : 'lazy';
      
      // Manejo de errores de carga de imagen
      img.onerror = function() {
        console.warn(`No se pudo cargar: img/${category}/${imageName}`);
        this.style.display = 'none';
      };
      
      slide.appendChild(img);
      carouselTrack.appendChild(slide);
    });
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
    if (arrowUp && arrowDown && categories[currentCategory]) {
      arrowUp.disabled = currentIndex === 0;
      arrowDown.disabled = currentIndex === categories[currentCategory].count - 1;
    }
  }

  // Función para actualizar dots (si existe)
  function updateDots() {
    const dots = document.querySelectorAll('.dot');
    if (dots.length > 0) {
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
  }

  // Funciones para navegación con flechas
  function goToPrevious() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      setPositionByIndex();
      updateDots();
      updateArrows();
    }
  }

  function goToNext() {
    if (categories[currentCategory] && currentIndex < categories[currentCategory].count - 1) {
      currentIndex += 1;
      setPositionByIndex();
      updateDots();
      updateArrows();
    }
  }

  // Función para ir a un slide específico
  function goToSlide(index) {
    currentIndex = index;
    setPositionByIndex();
    updateDots();
    updateArrows();
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
    if(isDragging) {
      animationFrame = requestAnimationFrame(animation);
    }
  }

  function touchStart(event) {
    if (event.target.closest('.carousel-arrow')) {
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
    if (isDragging) {
      event.preventDefault();
      const currentPosition = getPosition(event);
      currentTranslate = prevTranslate + currentPosition - startPosY;
    }
  }

  function touchEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    cancelAnimationFrame(animationFrame);
    
    const movedBy = currentTranslate - prevTranslate;
    const containerHeight = carouselContainer.clientHeight;
    const threshold = containerHeight * 0.15;

    if (movedBy < -threshold && categories[currentCategory] && currentIndex < categories[currentCategory].count - 1) {
      currentIndex += 1;
    }
    else if (movedBy > threshold && currentIndex > 0) {
      currentIndex -= 1;
    }
    
    carouselTrack.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    setPositionByIndex();
    updateDots();
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

  // Event Listeners para los botones de categoría
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category;
      currentIndex = 0;
      loadCategoryImages(currentCategory);
      setTimeout(() => {
        updateSlideHeights();
        setPositionByIndex();
        updateDots();
        updateArrows();
      }, 100);
    });
  });

  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (!categories[currentCategory]) return;
    
    if (e.key === 'ArrowDown' && currentIndex < categories[currentCategory].count - 1) {
      currentIndex += 1;
      setPositionByIndex();
      updateDots();
      updateArrows();
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      currentIndex -= 1;
      setPositionByIndex();
      updateDots();
      updateArrows();
    }
  });

  // Event listener para redimensionamiento
  window.addEventListener('resize', handleResize);

  // ===== INICIALIZACIÓN =====
  
  // Mostrar loading mientras se cargan las imágenes
  if (carouselTrack) {
    carouselTrack.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">Cargando imágenes...</div>';
  }
  
  // Cargar configuración y inicializar
  const configLoaded = await loadImageConfig();
  
  if (configLoaded && categories[currentCategory]) {
    loadCategoryImages(currentCategory);
    setTimeout(() => {
      updateSlideHeights();
      setPositionByIndex();
      updateDots();
      updateArrows();
    }, 150);
  } else {
    console.error('No se pudieron cargar las imágenes');
    if (carouselTrack) {
      carouselTrack.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ff6b6b;">Error: No se pudieron cargar las imágenes</div>';
    }
  }
});