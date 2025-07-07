const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD98TP15r2FOVSgeUsRA3nmZC7vzneI9kd6y4o_DRAUZD2alboBDdBsZWFjdmHdfKC/exec'; // ganti dengan URL web app Anda

function fetchData() {
  fetch(GAS_URL)
    .then(res => res.json())
    .then(data => renderReminders(data))
    .catch(err => console.error('Gagal ambil data:', err));
}

function renderReminders(data) {
  const list = document.getElementById('reminderList');
  list.innerHTML = '<li>⏳ Mengambil data...</li>';


  if (data.length === 0) {
    list.innerHTML = '<li>Tidak ada item EXP dalam waktu dekat.</li>';
    return;
  }

  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Room ${item.room}</strong><br>
      ${escapeHTML(item.issue)}<br>
      EXP: ${item.expDate}<br>
      <button onclick="sendToWA('${item.room}', '${item.nomorWA}', \`${item.issue}\`)">Kirim ke WA</button>
    `;

    list.appendChild(li);
  });
}

function sendToWA(room, nomor, pesan) {
  const msg = encodeURIComponent(`[Room ${room}]\n${pesan}`);
  if (!nomor) {
  alert("❗ Nomor WA tidak ditemukan untuk teknisi ini.");
  return;
  }

  window.open(`https://wa.me/${nomor}?text=${msg}`, '_blank');


  fetch(GAS_URL + `?action=update&room=${room}`)
    .then(res => res.text())
    .then(msg => console.log(msg));
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}


function startNotificationLoop() {
  if (!("Notification" in window)) return;
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      setInterval(() => {
        new Notification("🔔 Reminder RoomOO", {
          body: "Ada room yang mendekati EXP. Cek sekarang!",
        });
      }, 10000); // setiap jam
    }
  });
}

window.onload = () => {
  fetchData();
  startNotificationLoop();
};
