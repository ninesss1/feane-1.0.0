// main.js - เวอร์ชันสมบูรณ์ล่าสุด (พร้อม avatar ทุกข้อความ + อ่านจังมาสคอต)

// const N8N_WEBHOOK = "http://localhost:5678/webhook-test/295ea8ef-c617-4bbe-a60c-abc457ac05e7"; /*ทดสอบ*/
const N8N_WEBHOOK = "http://localhost:5678/webhook/295ea8ef-c617-4bbe-a60c-abc457ac05e7"; /*จริง*/

document.addEventListener('DOMContentLoaded', function () {
    const msgBox = document.getElementById('messages');
    const input = document.getElementById('msg');
    const send = document.getElementById('send');
    const chatImageInput = document.getElementById('chatImageInput');
    const chatImageBtn = document.getElementById('chatImageBtn');
    const chatEmpty = document.getElementById('chatEmpty');

    if (!msgBox || !input || !send) {
        console.error('ไม่พบ elements ใน DOM: messages, msg, หรือ send - ตรวจสอบ HTML');
        return;
    }

    const sessionId = 'user-' + Math.random().toString(36).substr(2, 9);
    console.log("Current Session ID:", sessionId);

    // เมื่อผู้ใช้คลิกปุ่มแนบรูป
    if (chatImageBtn) {
        chatImageBtn.addEventListener('click', () => {
            chatImageInput.click();
        });
    }

    // เมื่อพิมพ์ข้อความ ให้ลบไฟล์ที่เลือกและซ่อน preview รูป
    input.addEventListener('input', function () {
        if (chatImageInput && chatImageInput.value) {
            chatImageInput.value = '';
        }
        // ถ้ามี preview รูปใน DOM ให้ลบออก (ถ้าต้องการ)
        var preview = document.getElementById('chatImagePreview');
        if (preview) preview.remove();
    });

    // ฟังก์ชันเพิ่มข้อความ (รองรับรูป)
    function addBubble(text, type, imageData) {
        const b = document.createElement('div');
        b.className = 'bubble ' + type;
        const formattedText = text ? text.replace(/\n/g, '<br>') : '';
        let avatar = type === 'bot'
            ? `<img class="avatar bot-avatar" src="images/หนอน.png" alt="อ่านจัง" onerror="this.style.display='none'">`
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
        msgBox.appendChild(b);
        msgBox.scrollTop = msgBox.scrollHeight;
        // ซ่อน chatEmpty เมื่อมีข้อความแรก
        if (chatEmpty && !chatEmpty.classList.contains('fade-out')) {
            chatEmpty.classList.add('fade-out');
        }
    }

    function setUIState(enabled) {
        send.disabled = !enabled;
        input.disabled = !enabled;
        input.placeholder = enabled ? "พิมพ์ข้อความ..." : "กำลังรอการตอบกลับ...";
        if (enabled) input.focus();
    }

    // แสดง/ซ่อนบับเบิล "กำลังคิด..." พร้อม spinner
    function showTyping() {
        if (document.getElementById('typing-bubble')) return;
        const tb = document.createElement('div');
        tb.id = 'typing-bubble';
        tb.className = 'bubble bot typing';
        tb.innerHTML = `
            <img class="avatar bot-avatar" src="images/หนอน.png" alt="อ่านจัง" onerror="this.style.display='none'">
            <div class="text"><span class="spinner" aria-hidden="true"></span><span class="dots">กำลังคิด</span></div>
        `;
        msgBox.appendChild(tb);
        msgBox.scrollTop = msgBox.scrollHeight;
    }

    function hideTyping() {
        const tb = document.getElementById('typing-bubble');
        if (tb) tb.remove();
    }

    send.onclick = async () => {
        const t = input.value.trim();
        const hasFile = chatImageInput && chatImageInput.files.length > 0;
        if (!t && !hasFile) return;

        let imageBase64 = null;
        if (hasFile) {
            const file = chatImageInput.files[0];
            imageBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }
        addBubble(t, 'user', imageBase64);
        input.value = '';
        if (chatImageInput) chatImageInput.value = '';
        setUIState(false);
        showTyping();

        try {
            const response = await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: t,
                    sessionId: sessionId,
                    imageBase64: imageBase64
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            let replyText = '';
            let replyImage = null;

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                replyText = data.reply || `อ่านจังได้ข้อมูลแต่ไม่มีข้อความตอบกลับค่ะ (${JSON.stringify(data)})`;
                if (data.imageBase64) replyImage = data.imageBase64;
                else if (data.imageUrl) replyImage = data.imageUrl;
            } else {
                const rawResponseText = await response.text();
                console.warn('Response ไม่ใช่ JSON. ได้รับข้อความดิบ:', rawResponseText);

                if (rawResponseText.length > 0 && rawResponseText.length < 200) {
                    replyText = `อืมม... อ่านจังเจอปัญหาบ้างค่ะ: ${rawResponseText}`;
                } else {
                    replyText = 'อ่านจังเสียใจค่ะ เกิดข้อผิดพลาดบ้างในการเชื่อมต่อ (ดู Console ด้วยนะคะ)';
                }
            }

            hideTyping();
            addBubble(replyText, 'bot', replyImage);

        } catch (error) {
            console.error('Error:', error);
            hideTyping();
            addBubble('อ่านจังเสียใจมากค่ะ 😢 ไม่สามารถเชื่อมต่อได้ขณะนี้ ลองใหม่ดูนะครับ', 'bot');
        } finally {
            hideTyping();
            setUIState(true);
        }
    };

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send.click();
        }
    });

    // ข้อความต้อนรับจากอ่านจัง (มี avatar ด้วย)
    if (msgBox.children.length === 0) {
        addBubble('สวัสดีค่ะ! 👋 ผมชื่ออ่านจัง มาสคอตศูนย์หนังสือจุฬาฯ<br><br>ยินดีต้อนรับมากค่ะ! 📚✨ พิมพ์ข้อความหรือถามเกี่ยวกับหนังสือ การอ่าน หรือสิ่งที่อ่านจังสามารถช่วยได้นะครับ~', 'bot');
    }

    setUIState(true);
});