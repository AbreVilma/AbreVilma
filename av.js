/*--------------------
Vars
--------------------*/
let progress = 30  // Cambio para empezar en la tercera foto
let startX = 0
let active = 2     // Índice 2 = tercera foto (contando desde 0)
let isDown = false

/*--------------------
Constants
--------------------*/
const speedWheel = 0.05
const speedDrag = -0.1

/*--------------------
Get Z
--------------------*/
const getZindex = (array, index) =>
  array.map((_, i) => (index === i ? array.length : array.length - Math.abs(index - i)))

/*--------------------
Items
--------------------*/
let $items = document.querySelectorAll('.carousel-item')

const displayItems = (item, index, active) => {
  const zIndex = getZindex([...$items], active)[index]
  item.style.setProperty('--zIndex', zIndex)
  item.style.setProperty('--active', (index - active) / $items.length)
}

/*--------------------
Animate
--------------------*/
const animate = () => {
  progress = Math.max(0, Math.min(progress, 100))
  active = Math.floor((progress / 100) * ($items.length - 1))
  $items.forEach((item, index) => displayItems(item, index, active))
}

/*--------------------
Navigation Functions
--------------------*/
const goToNext = () => {
  if (!$items || $items.length === 0) return
  const nextIndex = (active + 1) % $items.length
  progress = (nextIndex / $items.length) * 100 + 10
  animate()
}

const goToPrevious = () => {
  if (!$items || $items.length === 0) return
  const prevIndex = active === 0 ? $items.length - 1 : active - 1
  progress = (prevIndex / $items.length) * 100 + 10
  animate()
}

/*--------------------
Click on Items
--------------------*/
const addClickListeners = () => {
  $items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (!isDown) { // Solo navegar si no fue un drag/swipe
        progress = (i / $items.length) * 100 + 10
        animate()
      }
    })
  })
}

/*--------------------
Handlers
--------------------*/
const handleWheel = e => {
  // Solo afectar al carrusel si el mouse está sobre él
  const carousel = document.querySelector('.carousel:not(.hidden)')
  if (carousel && carousel.matches(':hover')) {
    e.preventDefault() // Prevenir el scroll de la página
    const wheelProgress = e.deltaY * speedWheel
    progress = progress + wheelProgress
    animate()
  }
}

const handleMouseMove = (e) => {
  if (!isDown) return
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0
  const mouseProgress = (x - startX) * speedDrag
  progress = progress + mouseProgress
  startX = x
  animate()
}

const handleMouseDown = e => {
  isDown = true
  startX = e.clientX || (e.touches && e.touches[0].clientX) || 0
}

const handleMouseUp = () => {
  isDown = false
}

/*--------------------
Smooth scrolling for navigation
--------------------*/
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/*--------------------
Logo navigation scroll effect
--------------------*/
const navLogo = document.querySelector('.nav-logo');
const header = document.querySelector('header');

if (navLogo && header) {
  let headerHeight = header.offsetHeight;
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    if (scrollY > headerHeight) {
      navLogo.classList.add('show');
    } else {
      navLogo.classList.remove('show');
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll);
  
  window.addEventListener('resize', () => {
    headerHeight = header.offsetHeight;
    handleScroll();
  });
}

/*--------------------
Tab Functionality
--------------------*/
const tabButtons = document.querySelectorAll('.tab-button')
const carousels = document.querySelectorAll('.carousel')

// Variables para manejar cada carrusel por separado
let carouselStates = {
  'novias': { progress: 30, active: 2, items: null },
  'madrinas': { progress: 30, active: 2, items: null },
  'invitadas': { progress: 30, active: 2, items: null }
}

// Función para mostrar/ocultar carruseles
const showCarousel = (targetTab) => {
  // Ocultar todos los carruseles
  carousels.forEach(carousel => {
    carousel.classList.add('hidden')
  })
  
  // Mostrar el carrusel seleccionado
  const targetCarousel = document.getElementById(`carousel-${targetTab}`)
  if (targetCarousel) {
    targetCarousel.classList.remove('hidden')
    
    // Actualizar variables globales para el carrusel activo
    const state = carouselStates[targetTab]
    if (!state.items) {
      state.items = targetCarousel.querySelectorAll('.carousel-item')
    }
    
    progress = state.progress
    active = state.active
    $items = state.items
    
    // Animar el carrusel activo
    animate()
    
    // Remover listeners anteriores y agregar nuevos
    removeEventListeners()
    addEventListeners()
    addClickListeners()
  }
}

// Función para cambiar pestaña activa
const setActiveTab = (activeButton) => {
  tabButtons.forEach(button => {
    button.classList.remove('active')
  })
  activeButton.classList.add('active')
}

// Event listeners para las pestañas
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab')
    
    // Guardar estado del carrusel actual antes de cambiar
    const currentActiveTab = document.querySelector('.tab-button.active')?.getAttribute('data-tab')
    if (currentActiveTab && carouselStates[currentActiveTab]) {
      carouselStates[currentActiveTab].progress = progress
      carouselStates[currentActiveTab].active = active
    }
    
    // Cambiar pestaña activa
    setActiveTab(button)
    
    // Mostrar carrusel correspondiente
    showCarousel(targetTab)
  })
})

/*--------------------
Event Listeners Management
--------------------*/
const addEventListeners = () => {
  document.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchstart', handleMouseDown, { passive: true })
  document.addEventListener('touchmove', handleMouseMove, { passive: false })
  document.addEventListener('touchend', handleMouseUp, { passive: true })
}

const removeEventListeners = () => {
  document.removeEventListener('wheel', handleWheel)
  document.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchstart', handleMouseDown)
  document.removeEventListener('touchmove', handleMouseMove)
  document.removeEventListener('touchend', handleMouseUp)
}

/*--------------------
Initialize
--------------------*/
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar items para cada carrusel
  carouselStates.novias.items = document.querySelectorAll('#carousel-novias .carousel-item')
  carouselStates.madrinas.items = document.querySelectorAll('#carousel-madrinas .carousel-item')
  carouselStates.invitadas.items = document.querySelectorAll('#carousel-invitadas .carousel-item')
  
  // Inicializar con la primera pestaña
  const firstTab = document.querySelector('.tab-button.active')
  if (firstTab) {
    const targetTab = firstTab.getAttribute('data-tab')
    showCarousel(targetTab)
  } else {
    // Si no hay pestaña activa, activar la primera
    if (tabButtons.length > 0) {
      tabButtons[0].classList.add('active')
      showCarousel(tabButtons[0].getAttribute('data-tab'))
    }
  }
})

// Exponer funciones globalmente si es necesario
window.goToNext = goToNext
window.goToPrevious = goToPrevious

const form = document.getElementById('miFormulario');
form.action = "https://formsubmit.co/info@abrevilma.com";