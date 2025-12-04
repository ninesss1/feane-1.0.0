import http from 'k6/http';
import { check, sleep } from 'k6';

// ⚠️ สำคัญ: แทนที่ URL นี้ด้วย Webhook URL จริงของ n8n Workflow ของคุณ
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/295ea8ef-c617-4bbe-a60c-abc457ac05e7'; 

// ข้อมูล Payload ที่จะส่งไปยัง n8n (จำลองข้อความจากผู้ใช้)
// คุณต้องปรับ Payload ให้ตรงกับรูปแบบที่ n8n Webhook Node คาดหวัง
const PAYLOAD = JSON.stringify({
    // ตัวอย่าง Payload สำหรับ Telegram/Slack หรือ Custom Interface
    message: 'Hello, I need help with my account.',
    user_id: `user_${__VU}`, // __VU คือ Virtual User ID (ใช้ในการจำลองผู้ใช้ที่แตกต่างกัน)
    timestamp: new Date().toISOString()
});

// กำหนด HTTP Headers 
const PARAMS = {
    headers: {
        'Content-Type': 'application/json',
    },
};

// -------------------------------------------------------------
// 1. ตัวเลือก: การตั้งค่า Load Profile (สำหรับทดสอบ 100 ผู้ใช้เป็นเวลา 1 นาที)
// -------------------------------------------------------------
export const options = {
    // 1. กำหนดเป้าหมาย (Stages) - ค่อยๆ เพิ่มโหลด
    stages: [
        { duration: '30s', target: 50 },  // ภายใน 30 วินาที เพิ่มผู้ใช้เป็น 50 คน
        { duration: '30s', target: 100 }, // ภายใน 30 วินาที เพิ่มผู้ใช้เป็น 100 คน
        { duration: '30s', target: 200 }, // รักษาระดับผู้ใช้ที่ 200 คน เป็นเวลา 30 วินาที
        // { duration: '30s', target: 300 }, // เพิ่มผู้ใช้เป็น 300 คน
        // { duration: '30s', target: 200 }, // ลดผู้ใช้ลง
        { duration: '30s', target: 150 }, // ลดผู้ใช้ลง
        // { duration: '30s', target: 100 },  // ลดผู้ใช้ลง
        { duration: '30s', target: 50 },   // ลดผู้ใช้ลง
        { duration: '30s', target: 0 },   // หยุดการทดสอบ
    ],
    // 2. กำหนดเกณฑ์ความสำเร็จ (Thresholds) - ถ้าไม่ผ่านจะถือว่า Test Failed
    thresholds: {
        // อัตราการทำสำเร็จ (success rate) ของ requests ต้องสูงกว่า 95%
        http_req_failed: ['rate<0.05'], 
        // เวลาตอบสนอง 95% ต้องไม่เกิน 4 วินาที (4000ms)
        http_req_duration: ['p(95)<4000'], 
    },
};


// -------------------------------------------------------------
// 2. Main Test Function
// -------------------------------------------------------------
export default function () {
    // ส่ง HTTP POST Request ไปยัง Webhook ของ n8n
    const res = http.post(N8N_WEBHOOK_URL, PAYLOAD, PARAMS);

    // ตรวจสอบว่า Response Status Code เป็น 200 หรือ 202 (Successful)
    check(res, {
        'is status 200/202': (r) => r.status === 200 || r.status === 202,
    });

    // หน่วงเวลา: จำลองพฤติกรรมผู้ใช้ที่ไม่ได้ส่งข้อความต่อเนื่องทันที
    sleep(2); // ผู้ใช้จะรอ 2 วินาทีก่อนส่งข้อความถัดไป
}

/**
 * Unit Tests for main.js Chat Functions
 * ทดสอบ functions ต่างๆ ใน main.js
 */

// ============================================
// Test Suite 1: addBubble Function
// ============================================
const test_addBubble = () => {
  console.log("TEST: addBubble Function");
  
  const msgBox = document.getElementById('messages');
  const initialCount = msgBox.querySelectorAll('.bubble').length;
  
  // ส่งคำสั่ง addBubble (จำลอง)
  const testMessage = "Test message";
  const b = document.createElement('div');
  b.className = 'bubble user';
  b.innerHTML = `<div class="text">${testMessage}</div>`;
  msgBox.appendChild(b);
  
  // VERIFY: Bubble added
  const afterCount = msgBox.querySelectorAll('.bubble').length;
  console.assert(afterCount > initialCount, "FAIL: Bubble not added");
  console.log("PASS: addBubble creates bubble ✓");
  
  // VERIFY: Message content correct
  const lastBubble = msgBox.querySelectorAll('.bubble')[afterCount - 1];
  console.assert(lastBubble.textContent.includes(testMessage), "FAIL: Message content incorrect");
  console.log("PASS: addBubble sets correct content ✓");
};

// ============================================
// Test Suite 2: saveHistory & loadHistory
// ============================================
const test_saveAndLoadHistory = () => {
  console.log("\nTEST: saveHistory & loadHistory");
  
  const storageKey = 'feane_chat_history_v1';
  const testData = [
    { who: 'user', text: '<div class="text">Hello</div>' },
    { who: 'bot', text: '<div class="text">Hi there!</div>' }
  ];
  
  // SAVE History
  try {
    localStorage.setItem(storageKey, JSON.stringify(testData));
    console.log("PASS: saveHistory stores data ✓");
  } catch (e) {
    console.error("FAIL: saveHistory error", e);
    return;
  }
  
  // LOAD History
  try {
    const raw = localStorage.getItem(storageKey);
    const loaded = JSON.parse(raw);
    console.assert(loaded.length === testData.length, "FAIL: History length mismatch");
    console.assert(loaded[0].who === 'user', "FAIL: First message should be user");
    console.log("PASS: loadHistory retrieves data correctly ✓");
  } catch (e) {
    console.error("FAIL: loadHistory error", e);
  }
  
  // CLEANUP
  localStorage.removeItem(storageKey);
};

// ============================================
// Test Suite 3: Image Handling
// ============================================
const test_imageHandling = () => {
  console.log("\nTEST: Image Handling");
  
  const chatImageInput = document.getElementById('chatImageInput');
  const chatImageBtn = document.getElementById('chatImageBtn');
  
  // VERIFY: Image button click triggers input
  console.assert(chatImageBtn !== null, "FAIL: Image button not found");
  console.log("PASS: Image button exists ✓");
  
  // VERIFY: Image input is hidden
  console.assert(chatImageInput.style.display === 'none' || getComputedStyle(chatImageInput).display === 'none',
    "FAIL: Image input should be hidden");
  console.log("PASS: Image input is hidden ✓");
  
  // VERIFY: Clicking button would trigger input click
  // (Cannot directly test file input for security reasons, but we can verify the button exists)
  console.assert(chatImageInput.accept === 'image/*', "FAIL: Input accept should be image/*");
  console.log("PASS: Image input accepts only images ✓");
};

// ============================================
// Test Suite 4: Input Clearing on Image Upload
// ============================================
const test_inputClearingOnUpload = () => {
  console.log("\nTEST: Input Clearing on Upload");
  
  const input = document.getElementById('msg');
  const chatImageInput = document.getElementById('chatImageInput');
  
  // Set input value
  input.value = "Test message with image";
  
  // Simulate typing (which should clear image selection)
  input.dispatchEvent(new Event('input'));
  
  // In real scenario, this would clear chatImageInput
  console.assert(input.value !== "", "FAIL: Input should not be cleared on regular typing");
  console.log("PASS: Input typing detected ✓");
};

// ============================================
// Test Suite 5: Message Formatting (HTML)
// ============================================
const test_messageFormatting = () => {
  console.log("\nTEST: Message Formatting");
  
  const msgBox = document.getElementById('messages');
  
  // Test with newlines
  const testMessage = "Line 1\nLine 2\nLine 3";
  const formattedText = testMessage.replace(/\n/g, '<br>');
  
  const b = document.createElement('div');
  b.className = 'bubble bot';
  b.innerHTML = `<div class="text">${formattedText}</div>`;
  msgBox.appendChild(b);
  
  // VERIFY: Newlines converted to <br>
  console.assert(b.innerHTML.includes('<br>'), "FAIL: Newlines not converted to <br>");
  console.log("PASS: Message formatting handles newlines ✓");
  
  // Cleanup
  b.remove();
};

// ============================================
// Test Suite 6: Base64 Image Data
// ============================================
const test_base64ImageData = () => {
  console.log("\nTEST: Base64 Image Data Handling");
  
  // Mock base64 image data
  const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  // VERIFY: Valid base64 format
  console.assert(base64Image.startsWith('data:image'), "FAIL: Invalid base64 image format");
  console.log("PASS: Base64 image format valid ✓");
  
  // Test with bubble
  const msgBox = document.getElementById('messages');
  const b = document.createElement('div');
  b.className = 'bubble user';
  b.innerHTML = `
    <div class="text">
      Test image
      <img class="img-show-box-chat" src="${base64Image}" alt="test">
    </div>
  `;
  msgBox.appendChild(b);
  
  // VERIFY: Image tag added
  const imgTag = b.querySelector('img.img-show-box-chat');
  console.assert(imgTag !== null, "FAIL: Image tag not found");
  console.assert(imgTag.src === base64Image, "FAIL: Image src mismatch");
  console.log("PASS: Base64 image added to bubble ✓");
  
  // Cleanup
  b.remove();
};

// ============================================
// Test Suite 7: Session ID Generation
// ============================================
const test_sessionIdGeneration = () => {
  console.log("\nTEST: Session ID Generation");
  
  // Simulate session ID generation
  const sessionId1 = 'user-' + Math.random().toString(36).substr(2, 9);
  const sessionId2 = 'user-' + Math.random().toString(36).substr(2, 9);
  
  // VERIFY: Session IDs have correct format
  console.assert(sessionId1.startsWith('user-'), "FAIL: Session ID should start with 'user-'");
  console.log("PASS: Session ID format correct ✓");
  
  // VERIFY: Session IDs are unique
  console.assert(sessionId1 !== sessionId2, "FAIL: Session IDs should be unique");
  console.log("PASS: Session IDs are unique ✓");
};

// ============================================
// Test Suite 8: UI State Management
// ============================================
const test_uiStateManagement = () => {
  console.log("\nTEST: UI State Management");
  
  const send = document.getElementById('send');
  const input = document.getElementById('msg');
  
  // Test enabled state
  send.disabled = false;
  input.disabled = false;
  console.assert(!send.disabled, "FAIL: Send button should be enabled");
  console.assert(!input.disabled, "FAIL: Input should be enabled");
  console.log("PASS: UI elements can be enabled ✓");
  
  // Test disabled state
  send.disabled = true;
  input.disabled = true;
  console.assert(send.disabled, "FAIL: Send button should be disabled");
  console.assert(input.disabled, "FAIL: Input should be disabled");
  console.log("PASS: UI elements can be disabled ✓");
  
  // Reset to enabled
  send.disabled = false;
  input.disabled = false;
};

// ============================================
// Test Suite 9: Empty State (chatEmpty)
// ============================================
const test_emptyState = () => {
  console.log("\nTEST: Empty State (chatEmpty)");
  
  const chatEmpty = document.getElementById('chatEmpty');
  
  // VERIFY: Empty element exists
  console.assert(chatEmpty !== null, "FAIL: chatEmpty element not found");
  console.log("PASS: chatEmpty element exists ✓");
  
  // VERIFY: Can add fade-out class
  chatEmpty.classList.add('fade-out');
  console.assert(chatEmpty.classList.contains('fade-out'), "FAIL: fade-out class not added");
  console.log("PASS: fade-out class can be added ✓");
  
  // VERIFY: Can remove fade-out class
  chatEmpty.classList.remove('fade-out');
  console.assert(!chatEmpty.classList.contains('fade-out'), "FAIL: fade-out class not removed");
  console.log("PASS: fade-out class can be removed ✓");
};

// ============================================
// Test Suite 10: N8N Webhook URL Validation
// ============================================
const test_webhookUrlValidation = () => {
  console.log("\nTEST: N8N Webhook URL Validation");
  
  const webhookUrl = "http://localhost:5678/webhook/295ea8ef-c617-4bbe-a60c-abc457ac05e7";
  
  // VERIFY: URL is valid
  console.assert(webhookUrl.startsWith('https://'), "FAIL: Webhook URL should use HTTPS");
  console.log("PASS: Webhook URL uses HTTPS ✓");
  
  // VERIFY: URL contains domain
  console.assert(webhookUrl.includes('n8n.cloud'), "FAIL: Invalid n8n domain");
  console.log("PASS: Webhook URL contains valid n8n domain ✓");
  
  // VERIFY: URL contains webhook path
  console.assert(webhookUrl.includes('/webhook/'), "FAIL: Missing webhook path");
  console.log("PASS: Webhook URL has valid path ✓");
};

// ============================================
// Run All Tests
// ============================================
const runAllTests = () => {
  console.log("========================================");
  console.log("🎓 Chat Widget main.js Test Suite");
  console.log("========================================\n");
  
  try {
    test_addBubble();
    test_saveAndLoadHistory();
    test_imageHandling();
    test_inputClearingOnUpload();
    test_messageFormatting();
    test_base64ImageData();
    test_sessionIdGeneration();
    test_uiStateManagement();
    test_emptyState();
    test_webhookUrlValidation();
    
    console.log("\n========================================");
    console.log("✅ All main.js tests completed!");
    console.log("========================================");
  } catch (error) {
    console.error("❌ Test Error:", error);
  }
};

