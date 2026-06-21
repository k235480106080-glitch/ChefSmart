const FALLBACK_RECIPES = [
  { id:1, img:'images/pho-bo.png', emoji:'🍜', title:'Phở Bò Hà Nội', cat:'Ẩm thực Việt', diff:'hard', timeMinutes:180, servings:4, cal:450, rating:4.9, reviews:1240, desc:'Tô phở truyền thống với nước dùng ninh từ xương bò.', ingredients:['500g xương bò','300g thịt bò','400g bánh phở','1 củ gừng','2 củ hành tây','3 cánh hoa hồi','1 thanh quế','100g rau thơm'], steps:['Hầm xương bò và hớt bọt','Nướng gừng, hành rồi cho vào nồi','Thêm quế, hồi và nêm gia vị','Trụng bánh phở, xếp thịt và chan nước dùng'] },
  { id:2, img:'images/goi-cuon.png', emoji:'🥗', title:'Gỏi Cuốn Tôm Thịt', cat:'Khai vị', diff:'easy', timeMinutes:20, servings:4, cal:180, rating:4.7, reviews:856, desc:'Gỏi cuốn thanh mát với tôm, thịt, bún và rau sống.', ingredients:['200g tôm','150g thịt heo','12 lá bánh tráng','200g bún tươi','100g xà lách','50g rau thơm','1 củ cà rốt'], steps:['Luộc tôm và thịt','Làm mềm bánh tráng','Xếp nguyên liệu rồi cuộn chặt'] },
  { id:3, img:'images/canh-chua-ca.png', emoji:'🍲', title:'Canh Chua Cá Lóc', cat:'Canh và súp', diff:'medium', timeMinutes:40, servings:4, cal:220, rating:4.8, reviews:692, desc:'Canh chua cá lóc vị miền Nam.', ingredients:['1 con cá lóc','100g me','1/2 quả dứa','2 quả cà chua','100g giá đỗ','50g rau thơm'], steps:['Làm sạch cá','Nấu nước me','Cho cá và rau củ vào nấu chín'] },
  { id:4, img:'images/ga-nuong.png', emoji:'🍗', title:'Gà Nướng Mật Ong', cat:'Món nướng', diff:'medium', timeMinutes:75, servings:4, cal:380, rating:4.6, reviews:445, desc:'Gà nướng vàng óng với mật ong và tỏi.', ingredients:['1kg gà','3 thìa mật ong','4 tép tỏi','3 thìa nước tương','1 củ gừng'], steps:['Ướp gà','Nướng 180°C','Phết mật ong và nướng vàng'] },
  { id:5, img:'images/bo-kho.png', emoji:'🥘', title:'Bò Kho Bánh Mì', cat:'Món chính', diff:'medium', timeMinutes:120, servings:5, cal:420, rating:4.9, reviews:983, desc:'Bò kho mềm thơm với cà rốt, sả và nước cốt dừa.', ingredients:['800g thịt bò','2 củ cà rốt','3 cây sả','400ml nước cốt dừa','2 củ khoai tây','3 cánh hoa hồi'], steps:['Ướp bò','Xào săn','Hầm mềm','Thêm rau củ'] },
  { id:6, img:'images/com-chien-duong-chau.png', emoji:'🍛', title:'Cơm Chiên Dương Châu', cat:'Cơm', diff:'easy', timeMinutes:25, servings:3, cal:350, rating:4.5, reviews:1102, desc:'Cơm chiên với trứng, tôm, lạp xưởng và rau củ.', ingredients:['3 bát cơm nguội','2 quả trứng','100g tôm','50g lạp xưởng','1 củ cà rốt','100g đậu Hà Lan','30g hành lá','2 tép tỏi'], steps:['Xào tôm và lạp xưởng','Cho trứng và cơm vào đảo','Thêm rau củ và nêm gia vị'] }
];

const FALLBACK_INTERNATIONAL = [
  { img:'images/ramen-tonkotsu.png', title:'Ramen Tonkotsu', desc:'Mì ramen nước dùng xương heo của Nhật.', time:240, cal:520, cuisine:'Nhật Bản', spoonacular:false },
  { img:'images/pasta-carbonara.png', title:'Pasta Carbonara', desc:'Mì Ý sốt trứng và phô mai.', time:20, cal:480, cuisine:'Ý', spoonacular:false },
  { img:'images/chicken-tikka-masala.png', title:'Chicken Tikka Masala', desc:'Gà sốt cà ri đỏ béo ngậy.', time:60, cal:390, cuisine:'Ấn Độ', spoonacular:false },
  { img:'images/tacos-al-pastor.png', title:'Tacos al Pastor', desc:'Taco thịt heo kiểu Mexico.', time:45, cal:310, cuisine:'Mexico', spoonacular:false }
];

let recipes = [...FALLBACK_RECIPES];
let internationalRecipes = [...FALLBACK_INTERNATIONAL];

function formatTime(minutes) {
  const value = Number(minutes || 0);
  if (value >= 60 && value % 60 === 0) return `${value / 60} giờ`;
  if (value >= 60) return `${Math.floor(value / 60)} giờ ${value % 60} phút`;
  return `${value} phút`;
}

function normalizeRecipe(r) {
  return {
    ...r,
    timeMinutes: Number(r.timeMinutes ?? r.time ?? 0),
    img: r.img || 'images/pho-bo.png',
    emoji: r.emoji || '🍽️',
    diff: r.diff || 'easy',
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps) ? r.steps : []
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.error || `HTTP ${response.status}`);
  return data;
}

async function loadRecipesFromDatabase() {
  try {
    const data = await requestJson('/api/recipes');
    recipes = data.map(normalizeRecipe);
    renderRecipes(recipes);
    setBackendStatus('database', true, `SQL Server: ${recipes.length} công thức`);
  } catch (error) {
    recipes = [...FALLBACK_RECIPES];
    renderRecipes(recipes);
    setBackendStatus('database', false, `Chưa kết nối SQL Server: ${error.message}`);
  }
}

function setBackendStatus(type, ok, text) {
  const id = type === 'database' ? 'databaseStatus' : 'apiStatus';
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = `${ok ? '✅' : '⚠️'} ${text}`;
  element.className = `integration-status ${ok ? 'ok' : 'error'}`;
}

function renderRecipes(list) {
  const grid = document.getElementById('recipeGrid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<div class="empty-state">Không tìm thấy công thức phù hợp.</div>';
    return;
  }
  grid.innerHTML = list.map(r => `
    <div class="recipe-card" onclick="openModal(${r.id})">
      <div class="recipe-thumbnail">
        <img class="recipe-img" src="${r.img}" alt="${r.title}" loading="lazy">
        <span class="badge-difficulty badge-${r.diff === 'easy' ? 'easy' : r.diff === 'medium' ? 'medium' : 'hard'}">${r.diff === 'easy' ? 'Dễ' : r.diff === 'medium' ? 'Vừa' : 'Khó'}</span>
        <button class="btn-save" onclick="event.stopPropagation(); toggleSave(this)" aria-label="Lưu công thức">♡</button>
      </div>
      <div class="recipe-body">
        <div class="recipe-meta-top"><span class="recipe-category">${r.cat}</span></div>
        <h3 class="recipe-title">${r.title}</h3>
        <p class="recipe-desc">${r.desc || ''}</p>
        <div class="recipe-stats">
          <div class="recipe-stat"><span class="recipe-stat-val">⭐ ${Number(r.rating || 0).toFixed(1)}</span><span class="recipe-stat-label">${Number(r.reviews || 0).toLocaleString('vi-VN')} đánh giá</span></div>
          <div class="recipe-stat"><span class="recipe-stat-val">🕐 ${formatTime(r.timeMinutes)}</span><span class="recipe-stat-label">Thời gian</span></div>
          <div class="recipe-stat"><span class="recipe-stat-val">${r.cal || 0} kcal</span><span class="recipe-stat-label">${r.servings || 1} khẩu phần</span></div>
        </div>
      </div>
    </div>`).join('');
}

function renderApiGrid(list = internationalRecipes) {
  const grid = document.getElementById('apiGrid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<div class="api-empty">Không có kết quả từ Spoonacular.</div>';
    return;
  }
  grid.innerHTML = list.map(r => `
    <article class="api-card" ${r.sourceUrl ? `onclick="window.open('${r.sourceUrl}', '_blank')"` : ''}>
      <div class="api-card-image-wrap">
        <img class="api-card-image" src="${r.img || 'images/ramen-tonkotsu.png'}" alt="${r.title}" loading="lazy">
        <span class="api-badge-source">${r.spoonacular ? 'SPOONACULAR LIVE' : 'ẢNH MẪU'}</span>
      </div>
      <div class="api-card-content">
        <h4>${r.title}</h4>
        <p>${r.desc || 'Công thức quốc tế được gợi ý.'}</p>
        <div class="api-card-stats">
          <span class="api-stat-badge">🕐 ${r.time ? formatTime(r.time) : 'N/A'}</span>
          <span class="api-stat-badge">🔥 ${r.cal ?? 'N/A'} kcal</span>
          <span class="api-stat-badge">🌍 ${r.cuisine || 'Quốc tế'}</span>
        </div>
      </div>
    </article>`).join('');
}

async function loadRandomInternational() {
  const grid = document.getElementById('apiGrid');
  if (grid) grid.innerHTML = '<div class="api-loading"><i class="fas fa-spinner fa-spin"></i> Đang gọi Spoonacular API...</div>';
  try {
    const data = await requestJson('/api/international/random?number=4');
    internationalRecipes = data;
    renderApiGrid(data);
    setBackendStatus('api', true, 'Spoonacular API đang hoạt động');
  } catch (error) {
    internationalRecipes = [...FALLBACK_INTERNATIONAL];
    renderApiGrid(internationalRecipes);
    setBackendStatus('api', false, `Chưa gọi được Spoonacular: ${error.message}`);
  }
}

async function searchInternational() {
  const input = document.getElementById('internationalSearchInput');
  const query = input ? input.value.trim() : '';
  if (!query) {
    showToast('Nhập tên món quốc tế cần tra cứu.', 'warning');
    input?.focus();
    return;
  }
  const grid = document.getElementById('apiGrid');
  if (grid) grid.innerHTML = '<div class="api-loading"><i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm trên Spoonacular...</div>';
  try {
    const data = await requestJson(`/api/international/search?q=${encodeURIComponent(query)}&number=8`);
    internationalRecipes = data;
    renderApiGrid(data);
    setBackendStatus('api', true, `Tìm thấy ${data.length} công thức cho “${query}”`);
  } catch (error) {
    renderApiGrid(FALLBACK_INTERNATIONAL);
    setBackendStatus('api', false, error.message);
  }
}

function openModal(id) {
  const r = recipes.find(x => Number(x.id) === Number(id));
  if (!r) return;
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-hero" style="position:relative"><img class="modal-img" src="${r.img}" alt="${r.title}"><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <span class="recipe-category">${r.cat}</span><h3 style="margin-top:8px">${r.title}</h3><p style="color:var(--text-muted);margin-top:6px">${r.desc || ''}</p>
      <div class="modal-stats-row"><div class="modal-stat"><i class="fas fa-clock"></i><span><strong>${formatTime(r.timeMinutes)}</strong></span></div><div class="modal-stat"><i class="fas fa-users"></i><span><strong>${r.servings} người</strong></span></div><div class="modal-stat"><i class="fas fa-fire"></i><span><strong>${r.cal} kcal</strong></span></div><div class="modal-stat"><i class="fas fa-star"></i><span><strong>${r.rating}/5</strong></span></div></div>
      <h4>🛒 Nguyên liệu</h4><div class="ingredients-grid">${r.ingredients.map(i => `<div class="ingredient-item">${i}</div>`).join('')}</div>
      <h4>📋 Cách làm</h4><ol class="steps-list">${r.steps.map((s,i) => `<li><span class="step-num">${i+1}</span><span class="step-text">${s}</span></li>`).join('')}</ol>
    </div>`;
  document.getElementById('recipeModal').classList.add('open');
}

function closeModal() { document.getElementById('recipeModal')?.classList.remove('open'); }
function toggleSave(btn) { btn.classList.toggle('saved'); btn.textContent = btn.classList.contains('saved') ? '♥' : '♡'; }

function addIngredient() {
  const input = document.getElementById('fridgeInput');
  const value = input.value.trim();
  if (!value) return;
  const chip = document.createElement('div');
  chip.className = 'ingredient-chip';
  chip.dataset.name = value;
  chip.innerHTML = `${value} <span class="remove">✕</span>`;
  chip.onclick = () => chip.remove();
  document.getElementById('ingredientsList').appendChild(chip);
  input.value = '';
}

function removeIngredient(chip) { chip.remove(); }

function ingredientNamesFromChips() {
  return Array.from(document.querySelectorAll('#ingredientsList .ingredient-chip')).map(chip => {
    const stored = chip.dataset.name;
    if (stored) return stored.trim();
    return chip.textContent.replace('✕', '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
  }).filter(Boolean);
}

async function searchFridge() {
  const ingredients = ingredientNamesFromChips();
  if (!ingredients.length) {
    showToast('Vui lòng thêm ít nhất một nguyên liệu.', 'warning');
    return;
  }
  const maxTimeElement = document.getElementById('fridgeMaxTime');
  const maxTime = maxTimeElement?.value || null;
  const resultsArea = document.getElementById('fridgeResults');
  resultsArea.innerHTML = '<div class="fridge-loading"><i class="fas fa-database fa-spin"></i> Đang chạy truy vấn JOIN, GROUP BY và COUNT trên SQL Server...</div>';
  try {
    const result = await requestJson('/api/fridge', {
      method: 'POST',
      body: JSON.stringify({ ingredients, maxTime })
    });
    if (!result.recipes.length) {
      resultsArea.innerHTML = '<div class="empty-state">Chưa tìm thấy món có nguyên liệu trùng khớp.</div>';
      return;
    }
    resultsArea.innerHTML = result.recipes.map(r => {
      const status = r.canCook ? '✅ Có thể nấu ngay' : `🛒 Thiếu ${r.missingIngredients} nguyên liệu`;
      return `<div class="recipe-card fridge-match-card" onclick="openModal(${r.id})">
        <div class="recipe-thumbnail" style="height:150px"><img class="recipe-img" src="${r.img}" alt="${r.title}"><span class="match-percent">${r.matchPercent}% phù hợp</span></div>
        <div class="recipe-body"><h4 class="recipe-title">${r.title}</h4><p class="fridge-match-count">Khớp ${r.matchedIngredients}/${r.totalIngredients} nguyên liệu</p><p class="${r.canCook ? 'can-cook' : 'missing-food'}">${status}</p><p class="fridge-time">🕐 ${formatTime(r.timeMinutes)}</p></div>
      </div>`;
    }).join('');
    showToast(`Tìm thấy ${result.count} món từ SQL Server.`, 'success');
  } catch (error) {
    resultsArea.innerHTML = `<div class="integration-error"><strong>Không truy vấn được SQL Server.</strong><br>${error.message}<br><small>Hãy chạy database/setup.sql và kiểm tra file .env.</small></div>`;
  }
}

function filterCategory(el, cat) {
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  let filtered = [...recipes];
  if (cat === 'main') filtered = recipes.filter(r => ['Món chính','Món nướng','Cơm'].includes(r.cat));
  if (cat === 'soup') filtered = recipes.filter(r => r.cat === 'Canh và súp');
  if (cat === 'vn') filtered = recipes.filter(r => ['Ẩm thực Việt','Khai vị','Canh và súp','Món chính','Món nướng','Cơm'].includes(r.cat));
  if (cat === 'quick') filtered = recipes.filter(r => r.timeMinutes <= 30);
  if (['dessert','veg','drink'].includes(cat)) filtered = [];
  renderRecipes(filtered);
  scrollToSection('#recipes');
}

function setFilter(el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const label = el.textContent.trim().toLowerCase();
  let sorted = [...recipes];
  if (label.includes('mới nhất')) sorted.reverse();
  if (label.includes('đánh giá')) sorted.sort((a,b) => b.rating - a.rating);
  if (label.includes('nhanh')) sorted.sort((a,b) => a.timeMinutes - b.timeMinutes);
  if (label.includes('calories')) sorted.sort((a,b) => a.cal - b.cal);
  if (label.includes('quốc tế')) { scrollToSection('#international'); return; }
  renderRecipes(sorted);
}

function toggleAddForm() { const form = document.getElementById('addForm'); form?.classList.toggle('open'); form?.scrollIntoView({behavior:'smooth'}); }
function submitRecipe() { showToast('CRUD sẽ được nối vào API quản trị ở bước phát triển tiếp theo.', 'warning'); }

function openAuth() { document.getElementById('authModal')?.classList.add('open'); }
function closeAuth() { document.getElementById('authModal')?.classList.remove('open'); }
function switchAuth(btn, formId) { document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active')); btn.classList.add('active'); document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active')); document.getElementById(formId)?.classList.add('active'); }
function login() {
  const username = document.getElementById('loginUsername')?.value.trim();
  const password = document.getElementById('loginPassword')?.value.trim();
  const errorBox = document.getElementById('loginError');
  if (username === 'admin' && password === '123456') {
    localStorage.setItem('chefSmartLogin', JSON.stringify({username, role:'admin'}));
    window.location.href = 'dashboard.html';
  } else if (errorBox) { errorBox.textContent = 'Sai tên đăng nhập hoặc mật khẩu.'; errorBox.style.display = 'block'; }
}

function scrollToSection(selector) { document.querySelector(selector)?.scrollIntoView({behavior:'smooth'}); }
window.scrollTo = scrollToSection;

let toastTimer;
function showToast(message, type='') { const toast = document.getElementById('toast'); if (!toast) return; toast.textContent = message; toast.className = `toast ${type} show`; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3000); }

(function setupActiveNavigation() {
  document.addEventListener('DOMContentLoaded', () => {
    const links = Array.from(document.querySelectorAll('header nav a'));
    links.forEach(link => link.addEventListener('click', () => { links.forEach(x => x.classList.remove('active')); link.classList.add('active'); }));
  });
})();

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('#ingredientsList .ingredient-chip').forEach(chip => {
    chip.dataset.name = chip.textContent.replace('✕','').replace(/^[^\p{L}\p{N}]+/u,'').trim();
  });
  renderRecipes(recipes);
  renderApiGrid(internationalRecipes);
  await Promise.allSettled([loadRecipesFromDatabase(), loadRandomInternational()]);
});

function scrollTo(selector) {
  scrollToSection(selector);
}

function fakeAuth(message) {
  showToast(message, 'success');
  closeAuth();
}
