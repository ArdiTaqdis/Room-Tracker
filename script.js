
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzDdegVOWLSfdGWF_v79W6D49nT_6Kn10moh4oU6Q_aeT3yqqmZfVvYkEcxS25qO0_8/exec';

function fetchData() {
  fetch(CORS_PROXY + GAS_URL)
    .then(res => res.json())
    .then(data => renderReminders(data))
    .catch(err => console.error('❌ Gagal ambil data:', err));
}

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
    `;

    if (!item.nomorWA) {
      li.innerHTML += `<em style="color:red">❌ WA teknisi tidak ditemukan</em>`;
    } else {
      li.innerHTML += `<button onclick="sendToWA('${item.room}', '${item.nomorWA}', \`${item.issue}\`)">Kirim ke WA</button>`;
    }

    list.appendChild(li);
  });

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

function sendToWA(room, nomor, pesan) {
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

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

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
  setInterval(fetchData, 60000); // setiap 1 menit refresh data
};
