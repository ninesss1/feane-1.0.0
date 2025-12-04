// stye.js - เอฟเฟคสตรีมหาลัยจุฬา 🎓💙

document.addEventListener('DOMContentLoaded', function () {
    const messages = document.getElementById('messages');
    const input = document.getElementById('msg');
    const sendBtn = document.getElementById('send');
    const chatBox = document.querySelector('.chat-box');
    const header = document.querySelector('.header');

    // 1. Input shake effect เมื่อพิมพ์
    input.addEventListener('input', function () {
        this.style.animation = 'inputShake 0.15s ease-in-out';
        setTimeout(() => {
            this.style.animation = 'inputGlow 0.3s ease forwards';
        }, 150);
    });

    // 2. Button rotate + ติ๊ง เมื่อส่ง
    sendBtn.addEventListener('click', function () {
        this.style.animation = 'buttonRotate 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        setTimeout(() => {
            this.style.animation = 'none';
        }, 600);

        // เสียง Chula ติ๊ง
        playChulaTing();
    });

    // 3. Chula colors floating elements
    const chulaEmojis = ['🎓', '💙', '🏛️', '⭐', '📚', '✨', '🌟', '💛', '🎉'];
    const chulaBlue = '#003366';
    const chulaGold = '#daa520';

    function addBubbleChula(text, type, imageData) {
        const b = document.createElement('div');
        b.className = 'bubble ' + type;
        const formattedText = text ? text.replace(/\n/g, '<br>') : '';
        
        let avatar = type === 'bot'
            ? `<img class="avatar bot-avatar" src="images/หนอน.png" alt="สตรีมหาลัยจุฬา" onerror="this.style.display='none'">`
            : `<img class="avatar user-avatar" src="images/pic.png" alt="คุณ" onerror="this.style.display='none'">`;
        
        let imgHtml = '';
        if (imageData) {
            if (imageData.startsWith('data:image')) {
                imgHtml = `<img class="img-show-box-chat" src="${imageData}" alt="รูปที่แนบ">`;
            } else if (imageData.match(/^https?:\/\//)) {
                imgHtml = `<img class="img-show-box-chat" src="${imageData}" alt="รูปที่แนบ">`;
            }
        }
        
        b.innerHTML = `${avatar}<div class="text">${formattedText}${imgHtml}</div>`;
        messages.appendChild(b);
        messages.scrollTop = messages.scrollHeight;

        // Floating Chula symbols
        if (type === 'bot' && Math.random() < 0.5) {
            setTimeout(() => {
                const emoji = chulaEmojis[Math.floor(Math.random() * chulaEmojis.length)];
                const floating = document.createElement('div');
                floating.textContent = emoji;
                floating.style.position = 'fixed';
                floating.style.pointerEvents = 'none';
                floating.style.fontSize = '18px';
                floating.style.zIndex = '9998';
                floating.style.animation = 'chulaFloatUp 3s ease-out forwards';
                floating.style.left = (Math.random() * 30 + 60) + '%';
                floating.style.top = '60%';
                floating.style.opacity = '0.8';
                chatBox.appendChild(floating);
                setTimeout(() => floating.remove(), 3000);
            }, 300);
        }
    }

    // 4. Chula sound effect
    function playChulaTing() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // Note: C (Chula) - ทำนอต สูงสดใส
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // 5. Header breathing Chula colors
    let colorIdx = 0;
    const chulaGradients = [
        'linear-gradient(135deg, #e794e7ff 0%, #e1c0e7ff 50%, #eea2dbff 100%)',
        'linear-gradient(135deg, #cf6bd8ff 0%, #e2a1ddff 50%, #ecececff 100%)',
        'linear-gradient(135deg, #f085eaff 0%, #ab27afff 50%, #e63ee6ff 100%)',
    ];
    setInterval(() => {
        header.style.background = chulaGradients[colorIdx];
        colorIdx = (colorIdx + 1) % chulaGradients.length;
    }, 3000);

    // 6. CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes inputShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }
        @keyframes inputGlow {
            from { box-shadow: none; }
            to { box-shadow: 0 0 0 2px rgba(0,51,102,0.1); }
        }
        @keyframes buttonRotate {
            0% { transform: rotateY(0) scale(1); }
            50% { transform: rotateY(180deg) scale(1.1); }
            100% { transform: rotateY(360deg) scale(1); }
        }
        @keyframes chulaFloatUp {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
            50% { transform: translateY(-100px) translateX(20px) scale(1.2); opacity: 0.9; }
            100% { transform: translateY(-300px) translateX(40px) scale(0.5); opacity: 0; }
        }
        @keyframes headerShine {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
        }
        .bubble { position: relative; overflow: visible; }
        .text { position: relative; z-index: 2; }
    `;
    document.head.appendChild(style);

    console.log("🎓 สตรีมหาลัยจุฬา Chat ✨ พร้อมให้บริการค่ะ!");
});