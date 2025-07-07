// Tambahkan prefix CORS proxy
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwV6kRGG1g7IODG2opzVtzA_wy29DfE6pdyNMpjHm8ss9IR4pZoxloi2BXd0p8GmeHr/exec';
let lastNotifiedAt = null;
// Fungsi fetch data reminder
function fetchData() {
  fetch(CORS_PROXY + GAS_URL)
    .then(res => res.json())
    .then(data => renderReminders(data))
    .catch(err => console.error('❌ Gagal ambil data:', err));
}

// Fungsi render list
function renderReminders(data) {
  const list = document.getElementById('reminderList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<li>Tidak ada item EXP dalam waktu dekat.</li>';
    return;
  }

  // Tampilkan list room
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

  // ✅ Notifikasi hanya kalau ada data
  triggerReminderNotification();
}

function triggerReminderNotification() {
  if (!("Notification" in window)) return;

  const now = Date.now();
  if (lastNotifiedAt && now - lastNotifiedAt < 3600000) return;

  if (Notification.permission === "granted") {
    new Notification("🔔 Reminder RoomOO", {
      body: "Ada room yang EXP besok. Segera follow-up.",
    });
    lastNotifiedAt = now;
  } else {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("🔔 Reminder RoomOO", {
          body: "Ada room yang EXP besok. Segera follow-up.",
        });
        lastNotifiedAt = now;
      }
    });
  }
}




// Fungsi kirim ke WhatsApp + update status
function sendToWA(room, nomor, pesan) {
  if (!nomor) {
    alert("❗ Nomor WA tidak ditemukan untuk teknisi ini.");
    return;
  }

  const msg = encodeURIComponent(`[Room ${room}]\n${pesan}`);
  window.open(`https://wa.me/${nomor}?text=${msg}`, '_blank');

  // Update reminder status
  fetch(CORS_PROXY + GAS_URL + `?action=update&room=${room}`)
    .then(res => res.text())
    .then(msg => {
      console.log(msg);
      if (Notification.permission === "granted") {
        new Notification("✅ Reminder dikirim ke WA");
      }
    });
}

// Escape HTML agar aman
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}




// uBah format tanggal
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}


window.onload = () => {
  fetchData();
  setInterval(fetchData, 10000); 
};
