// ===== 狀態 =====
const booking = {
  service: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  note: '',
  source: ''
};

// ===== 服務卡點擊 =====
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    booking.service = card.querySelector('input').value;
  });
});

// ===== 日期最小值設定 =====
const dateInput = document.getElementById('booking-date');
const today = new Date();
today.setDate(today.getDate() + 1);
dateInput.min = today.toISOString().split('T')[0];

// ===== 時間選擇 =====
function selectTime(btn) {
  if (btn.classList.contains('disabled')) return;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  btn.classList.add('selected');
  booking.time = btn.textContent;
}

// ===== 步驟切換 =====
function nextStep(current) {
  if (!validateStep(current)) return;
  collectStep(current);
  goToStep(current + 1);
}

function prevStep(current) {
  goToStep(current - 1);
}

function goToStep(target) {
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  const id = target === 5 ? 'step-done' : `step-${target}`;
  document.getElementById(id).classList.add('active');
  updateProgress(target);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 進度條 =====
function updateProgress(step) {
  document.querySelectorAll('.step').forEach((el, i) => {
    const n = i + 1;
    el.classList.remove('active', 'done');
    if (n < step) el.classList.add('done');
    else if (n === step) el.classList.add('active');
  });
}

// ===== 驗證 =====
function validateStep(step) {
  if (step === 1) {
    if (!booking.service) {
      alert('請選擇一項服務');
      return false;
    }
  }
  if (step === 2) {
    if (!dateInput.value) {
      alert('請選擇預約日期');
      return false;
    }
    if (!booking.time) {
      alert('請選擇預約時段');
      return false;
    }
  }
  if (step === 3) {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    if (!name) { alert('請填寫姓名'); return false; }
    if (!phone || !/^09\d{8}$/.test(phone)) {
      alert('請填寫正確的手機號碼（09 開頭，共 10 碼）');
      return false;
    }
  }
  return true;
}

// ===== 收集資料 =====
function collectStep(step) {
  if (step === 2) {
    booking.date = dateInput.value;
  }
  if (step === 3) {
    booking.name = document.getElementById('customer-name').value.trim();
    booking.phone = document.getElementById('customer-phone').value.trim();
    booking.note = document.getElementById('customer-note').value.trim();
    booking.source = document.getElementById('customer-source').value;
    fillConfirm();
  }
}

// ===== 填入確認頁 =====
function fillConfirm() {
  const dateObj = new Date(booking.date);
  const formatted = dateObj.toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  });
  document.getElementById('confirm-service').textContent = booking.service;
  document.getElementById('confirm-date').textContent = formatted;
  document.getElementById('confirm-time').textContent = booking.time;
  document.getElementById('confirm-name').textContent = booking.name;
  document.getElementById('confirm-phone').textContent = booking.phone;
  const noteRow = document.getElementById('confirm-note-row');
  if (booking.note) {
    document.getElementById('confirm-note').textContent = booking.note;
    noteRow.style.display = 'flex';
  } else {
    noteRow.style.display = 'none';
  }
}

// ===== 送出預約 =====
async function submitBooking() {
  const btn = document.getElementById('btn-submit');
  btn.textContent = '送出中...';
  btn.disabled = true;

  // Google Apps Script URL（部署後填入）
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhcmOHejauJUOnauHgMuXW1gLBgwPlWznTk09nWAWw1cr2MDfJiEP4TGJPNRdjUL0/exec';

  const payload = {
    service: booking.service,
    date: booking.date,
    time: booking.time,
    name: booking.name,
    phone: booking.phone,
    note: booking.note,
    source: booking.source,
    submittedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
  };

  try {
    if (SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    goToStep(5);
  } catch (e) {
    goToStep(5);
  }
}

// ===== 重設表單 =====
function resetForm() {
  Object.keys(booking).forEach(k => booking[k] = '');
  document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  dateInput.value = '';
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('customer-note').value = '';
  document.getElementById('customer-source').value = '';
  goToStep(1);
}
