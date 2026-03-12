document.addEventListener('DOMContentLoaded', function(){
  const cards = Array.from(document.querySelectorAll('.lamina-card'));
  const previewSurface = document.getElementById('previewSurface');
  const previewName = document.getElementById('previewName');
  const previewDesc = document.getElementById('previewDesc');
  const previewAddBtn = document.getElementById('previewAddBtn');

  function setSelectedCard(card){
    if(!card) return;
    cards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    const img = card.getAttribute('data-image');
    const name = card.getAttribute('data-name');
    const desc = card.getAttribute('data-desc');

    // update preview with smooth animation
    previewSurface.classList.remove('animate-in');
    // encode spaces/accents in path for url
    const safeUrl = encodeURI(img);
    previewSurface.style.backgroundImage = `url("${safeUrl}")`;
    // trigger reflow to restart animation
    void previewSurface.offsetWidth;
    previewSurface.classList.add('animate-in');

    previewName.textContent = name;
    previewDesc.textContent = desc;

    // enable add button and attach data attributes for adding to cart
    previewAddBtn.disabled = false;
    previewAddBtn.dataset.name = name;
    previewAddBtn.dataset.price = card.dataset.price || '';
    previewAddBtn.dataset.image = img;
  }

  // click handlers for cards
  cards.forEach(card => {
    card.addEventListener('click', () => setSelectedCard(card));
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') setSelectedCard(card); });
  });

  // default select first card
  if(cards.length) setSelectedCard(cards[0]);

  // Add to cart from preview (uses global addToCart if available)
  previewAddBtn.addEventListener('click', () => {
    const name = previewAddBtn.dataset.name || 'Lámina';
    const price = parseFloat(previewAddBtn.dataset.price) || 0;
    // call global addToCart if present, otherwise just flash animation
    if(typeof addToCart === 'function'){
      addToCart({name, price, color: 'Predeterminado', quantity: 1});
    } else {
      // small feedback if addToCart not available
      previewAddBtn.classList.add('flash');
      setTimeout(()=> previewAddBtn.classList.remove('flash'), 400);
    }
  });

  // optional zoom/detail - simple full-screen preview
  const zoomBtn = document.getElementById('previewZoomBtn');
  zoomBtn.addEventListener('click', ()=>{
    const url = previewAddBtn.dataset.image ? encodeURI(previewAddBtn.dataset.image) : '';
    if(!url) return;
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed'; overlay.style.inset = 0; overlay.style.background = 'rgba(0,0,0,0.7)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex=9999;
    const img = document.createElement('div'); img.style.backgroundImage = `url("${url}")`; img.style.width = '80%'; img.style.maxWidth = '900px'; img.style.height='70%'; img.style.backgroundSize='contain'; img.style.backgroundPosition='center'; img.style.backgroundRepeat='no-repeat'; img.style.boxShadow='0 20px 60px rgba(0,0,0,.6)'; img.style.borderRadius='8px';
    overlay.appendChild(img);
    overlay.addEventListener('click', ()=> document.body.removeChild(overlay));
    document.body.appendChild(overlay);
  });

  // ========== FUNCIONALIDAD COLOR PERSONALIZADO ==========
  // (Ya manejado en index.html con script inline para garantizar funcionamiento)
  // Este código aquí es respaldo
  try {
    const colorPickerCustom = document.getElementById('customColor');
    if (colorPickerCustom && typeof initColorPicker !== 'undefined') {
      // initColorPicker ya fue ejecutado en el HTML inline
    }
  } catch(e) {
    console.log('Color picker initialized in HTML');
  }
});

// Función para enviar color personalizado a WhatsApp
function sendColorToWhatsApp() {
  const colorCode = document.getElementById('colorCodeCustom').textContent;
  const colorPicker = document.getElementById('customColor');
  const colorRGB = colorPicker.value;
  
  // Número de WhatsApp (reemplaza con tu número)
  const phoneNumber = '573242104067'; // Formato: código país + número
  
  // Mensaje personalizado
  const message = `Hola! 👋 Me gustaría solicitar asesoría sobre láminas PVC personalizadas.\n\n` +
                  `Color deseado: ${colorCode}\n` +
                  `Quisiera conocer más detalles, disponibilidad y precios.\n\n` +
                  `¿Pueden ayudarme? 😊`;
  
  // Crear URL de WhatsApp
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  // Abrir WhatsApp
  window.open(whatsappURL, '_blank');
}
