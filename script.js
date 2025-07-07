
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxddwmOfO3Pfk2QOfzqElhY49wYhuuJ7ClLhaZXqUbUSuW8RnBtxZeXTcyvfXg8yT__/exec';
let lastNotifiedAt = null;

// Ambil data reminder dari GAS
function fetchData() {
  fetch(CORS_PROXY + GAS_URL)
    .then(res => res.json())
    .then(data => renderReminders(data))
    .catch(err => console.error('❌ Gagal ambil data:', err));
}

// Tampilkan data ke HTML
function renderReminders(data) {
  const list = document.getElementById('reminderList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<li>Tidak ada item EXP dalam waktu dekat.</li>';
    return;
  }

  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Room ${item.room}</strong><br>
      ${escapeHTML(item.issue)}<br>
      EXP: ${formatDate(item.expDate)}<br>
      <button onclick="sendToWA('${item.room}', '${item.nomorWA}', \`${item.issue}\`)">Kirim ke WA</button>
    `;
    list.appendChild(li);
  });

  triggerReminderNotification();
}

// Tampilkan notifikasi (hanya jika ada data & tidak spam)
function triggerReminderNotification() {
  if (!("Notification" in window)) return;
  const now = Date.now();
  if (lastNotifiedAt && now - lastNotifiedAt < 3600000) return;

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      new Notification("🔔 Reminder RoomOO", {
        body: "Ada room yang EXP besok. Segera follow-up.",
      });
      lastNotifiedAt = now;
    }
  });
}

// Kirim pesan ke WA + update status
function sendToWA(room, nomor, pesan) {
  if (!nomor) {
    alert("❗ Nomor WA tidak ditemukan untuk teknisi ini.");
    return;
  }

  const msg = encodeURIComponent(`[Room ${room}]\n${pesan}`);
  window.open(`https://wa.me/${nomor}?text=${msg}`, '_blank');

  fetch(CORS_PROXY + GAS_URL + `?action=update&room=${room}`)
    .then(res => res.text())
    .then(msg => {
      console.log(msg);
      if (Notification.permission === "granted") {
        new Notification("✅ Reminder dikirim ke WA");
      }
    });
}

// Escape HTML aman
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

// Format tanggal Indo
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Load saat halaman dibuka
window.onload = () => {
  fetchData();
  setInterval(fetchData, 60000); // refresh tiap 1 menit
};
