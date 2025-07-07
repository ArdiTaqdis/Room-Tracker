const GAS_URL = 'https://script.google.com/macros/s/AKfycbzDdegVOWLSfdGWF_v79W6D49nT_6Kn10moh4oU6Q_aeT3yqqmZfVvYkEcxS25qO0_8/exec';
let lastNotifiedAt = null;

function fetchData() {
  const list = document.getElementById('reminderList');

  // Tampilkan indikator loading sementara
  list.innerHTML = '<li>⏳ Memuat data...</li>';

  fetch(GAS_URL)
    .then(res => {
      if (!res.ok) throw new Error("❌ Network error " + res.status);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("❌ Format data tidak valid");
      if (data.length === 0) {
        list.innerHTML = '<li>Tidak ada reminder aktif.</li>';
      } else {
        renderReminders(data);
        triggerReminderNotification();
      }
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = '<li style="color:red">❌ Gagal memuat data. Silakan cek koneksi atau console.</li>';
    });
}


function renderReminders(data) {
  const list = document.getElementById('reminderList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<li>Tidak ada item EXP dalam waktu dekat.</li>';
    return;
  }

  data.forEach(item => {
    const tgl = formatDate(item.expDate);
    const pesan = `Room: ${item.room} | Task: ${item.issue}
    Lokasi: ${item.lokasi}, Building: ${item.building}
    📅 Tanggal Expired: ${tgl}
    🧑‍🔧 Follow Up By: ${item.fuBy}
    Harap segera diselesaikan.`;

    const li = document.createElement('li');
    li.innerHTML = `
      <pre style="white-space: pre-wrap;">${escapeHTML(pesan)}</pre>
      ${item.nomorWA
        ? `<button onclick="sendToWA('${item.room}', '${item.nomorWA}', \`${pesan}\`)">Kirim ke WA</button>`
        : `<em style="color:red">❌ WA teknisi tidak ditemukan</em>`
      }
    `;
    list.appendChild(li);
  });

  triggerReminderNotification();
}

function sendToWA(room, nomor, pesan) {
  const msg = encodeURIComponent(pesan);
  window.open(`https://wa.me/${nomor}?text=${msg}`, '_blank');

  fetch(`${GAS_URL}?action=update&room=${room}`)
    .then(res => res.text())
    .then(msg => {
      console.log(msg);
      if (Notification.permission === "granted") {
        new Notification("✅ Reminder dikirim ke WA");
      }
    });
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
  setTimeout(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, 360000);

  setInterval(fetchData, 360000);
};