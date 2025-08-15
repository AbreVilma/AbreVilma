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
      const header = document.querySelector('.header');
      const headerHeight = header.classList.contains('scrolled') ? header.offsetHeight : 0;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ===== HEADER SCROLL TRANSITION =====
const header = document.getElementById('header');
const headerSpacer = document.getElementById('headerSpacer');
let hasScrolled = false;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 100 && !hasScrolled) {
    header.classList.add('scrolled');
    headerSpacer.classList.add('active');
    hasScrolled = true;
  } else if (scrollY <= 100 && hasScrolled) {
    header.classList.remove('scrolled');
    headerSpacer.classList.remove('active');
    hasScrolled = false;
  }
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
  // Setup animations for sections
  document.querySelectorAll('.section').forEach(section => {
    if (!section.classList.contains('carousel-section')) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(50px)';
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(section);
    }
  });

  // ===== CARRUSEL DESLIZABLE CORREGIDO =====
  const categories = {
    novias: [
      "img\\novias\\1.jpg", 
      "img\\novias\\2.jpg",
      "img\\novias\\3.jpg",
      "img\\novias\\4.jpg", 
      "img\\novias\\5.jpg", 
      "img\\novias\\6.jpg", 
      "img\\novias\\7.jpg", 
      "img\\novias\\8.jpg", 
      "img\\novias\\9.jpg", 
      "img\\novias\\10.jpg", 
      "img\\novias\\11.jpg", 
      "img\\novias\\12.jpg", 
      "img\\novias\\13.jpg", 
      "img\\novias\\14.jpg", 
      "img\\novias\\15.jpg", 
      "img\\novias\\16.jpg", 
      "img\\novias\\17.jpg", 
      "img\\novias\\18.jpg", 
      "img\\novias\\19.jpg", 
      "img\\novias\\20.jpg", 
      "img\\novias\\21.jpg", 
      "img\\novias\\22.jpg", 
      "img\\novias\\23.jpg", 
      "img\\novias\\24.jpg", 
      "img\\novias\\25.jpg", 
      "img\\novias\\26.jpg", 
      "img\\novias\\27.jpg", 
      "img\\novias\\28.jpg"
      ],
    madrinas: ["img/madrina1.jpg", "img/madrina2.jpg", "img/madrina3.jpg", "img/madrina4.jpg"],
    invitadas: ["img/invitada1.jpg", "img/invitada2.jpg", "img/invitada3.jpg", "img/invitada4.jpg"]
  };

  let currentCategory = "novias";
  let currentIndex = 0;
  let isDragging = false;
  let startPosY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  const tabs = document.querySelectorAll(".tab-button");
  const carouselContainer = document.getElementById("carouselContainer");
  const carouselTrack = document.getElementById("carouselTrack");

  function loadCategoryImages(category) {
    if (!carouselTrack) return;
    
    carouselTrack.innerHTML = '';
    const images = categories[category];
    
    images.forEach((src, index) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      slide.style.transform = `translateY(${index * 100}%)`;
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = category.slice(0, -1);
      img.loading = 'lazy'; // Carga perezosa para mejor rendimiento
      
      slide.appendChild(img);
      carouselTrack.appendChild(slide);
    });
  }

  function setPositionByIndex() {
    if (!carouselContainer) return;
    
    const maxIndex = categories[currentCategory].length - 1;
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
    
    currentTranslate = currentIndex * -carouselContainer.clientHeight;
    prevTranslate = currentTranslate;
    setSliderPosition();
  }
  
  function setSliderPosition() {
    if (carouselTrack) {
      carouselTrack.style.transform = `translateY(${currentTranslate}px)`;
    }
  }
  
  function animation() {
    setSliderPosition();
    if (isDragging) {
      animationID = requestAnimationFrame(animation);
    }
  }

  function getPositionY(event) {
    return event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
  }

  function dragStart(event) {
    event.preventDefault(); // Previene comportamientos por defecto
    isDragging = true;
    startPosY = getPositionY(event);
    animationID = requestAnimationFrame(animation);
    
    if (carouselTrack) {
      carouselTrack.style.transition = 'none';
    }
  }

  function dragMove(event) {
    if (isDragging) {
      const currentPosition = getPositionY(event);
      currentTranslate = prevTranslate + currentPosition - startPosY;
      
      // Límites para evitar que se deslice infinitamente
      const maxTranslate = 0;
      const minTranslate = -(categories[currentCategory].length - 1) * carouselContainer.clientHeight;
      currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, currentTranslate));
    }
  }

  function dragEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    if (!carouselContainer) return;
    
    const movedBy = currentTranslate - prevTranslate;
    const threshold = carouselContainer.clientHeight * 0.2; // 20% de la altura como threshold
    
    // Determinar el nuevo índice basado en el movimiento
    if (movedBy < -threshold && currentIndex < categories[currentCategory].length - 1) {
      currentIndex += 1;
    } else if (movedBy > threshold && currentIndex > 0) {
      currentIndex -= 1;
    }
    
    // Activar transición suave y establecer posición final
    if (carouselTrack) {
      carouselTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    
    setPositionByIndex();
  }

  function setupEventListeners() {
    if (!carouselContainer) return;

    // Touch events (móvil)
    carouselContainer.addEventListener('touchstart', dragStart, { passive: false });
    carouselContainer.addEventListener('touchmove', dragMove, { passive: false });
    carouselContainer.addEventListener('touchend', dragEnd);

    // Mouse events (escritorio)
    carouselContainer.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    // Prevenir selección de texto mientras se arrastra
    carouselContainer.addEventListener('selectstart', (e) => e.preventDefault());
  }

  function setupTabButtons() {
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        // Remover clase active de todos los tabs
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        
        // Cambiar categoría y resetear índice
        currentCategory = tab.dataset.category;
        currentIndex = 0;
        
        // Cargar nuevas imágenes y resetear posición
        loadCategoryImages(currentCategory);
        
        // Pequeño delay para asegurar que las imágenes se carguen
        setTimeout(() => {
          setPositionByIndex();
        }, 50);
      });
    });
  }

  // Manejar cambios de tamaño de ventana
  function handleResize() {
    if (carouselTrack) {
      carouselTrack.style.transition = 'none';
      setPositionByIndex();
      // Restaurar transición después de un frame
      requestAnimationFrame(() => {
        if (carouselTrack) {
          carouselTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
      });
    }
  }

  // Inicialización
  function init() {
    if (carouselContainer && carouselTrack) {
      loadCategoryImages(currentCategory);
      setupTabButtons();
      setupEventListeners();
      
      // Configurar posición inicial después de un pequeño delay
      setTimeout(() => {
        setPositionByIndex();
      }, 100);
      
      // Listener para cambios de tamaño
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
      });
    } else {
      console.error('Elementos del carrusel no encontrados');
    }
  }

  // Ejecutar inicialización
  init();
});