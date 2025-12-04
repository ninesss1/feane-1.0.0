var box = document.querySelector('.chat-box');
var header = box.querySelector('.header');
var msgBox = document.getElementById('messages');
var empty = document.getElementById('chatEmpty');
var storageKey = 'feane_chat_history_v1';

function setCollapsed(v) {
  if (v) {
    box.classList.add('collapsed');
    box.setAttribute('aria-hidden', 'true');
  } else {
    box.classList.remove('collapsed');
    box.setAttribute('aria-hidden', 'false');
  }
}

function toggle() {
  setCollapsed(!box.classList.contains('collapsed'));
  if (!box.classList.contains('collapsed')) { 
    // ซ่อน empty image ถ้ามีข้อความแล้ว
    if (empty && msgBox && msgBox.children.length > 1) {
      empty.classList.add('fade-out');
    }
    loadHistory(); 
    var input = document.getElementById('msg');
    if (input) input.focus(); 
  }
}

header.addEventListener('click', toggle);
header.addEventListener('keydown', function (e) { 
  if (e.key === 'Enter' || e.key === ' ') toggle(); 
});

function saveHistory() {
  var nodes = msgBox.querySelectorAll('.bubble');
  var data = Array.prototype.map.call(nodes, function (n) {
    return { who: n.classList.contains('user') ? 'user' : 'bot', text: n.textContent };
  });
  try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch (e) { }
}

function loadHistory() {
  try {
    var raw = localStorage.getItem(storageKey);
    if (!raw) return;
    var data = JSON.parse(raw);
    if (!data || !data.length) return;

    // Clear existing bubbles first (except empty state)
    var bubbles = msgBox.querySelectorAll('.bubble');
    bubbles.forEach(function(b) { b.remove(); });

    data.forEach(function (item) {
      var el = document.createElement('div');
      el.className = 'bubble ' + (item.who === 'user' ? 'user' : 'bot');
      el.innerHTML = item.text; // ใช้ innerHTML เพื่อรองรับ HTML (avatar, text, etc)
      msgBox.appendChild(el);
    });

    msgBox.scrollTop = msgBox.scrollHeight;

  } catch (e) { }
}

// start collapsed
setCollapsed(true);