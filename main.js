import { detecIcon, detecType, setStorage } from "./helpers.js";

//! HTML'den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");
//! Olay İzleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);
//! Ortak Kullanım Alanı
let map;
let coords = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let layerGroup = [];
//* Kullanıcının konumunu öğrenme
navigator.geolocation.getCurrentPosition(
  loadMap,console.log("Kullanıcı izin vermedi")
);
//* Haritaya tıklanınca çalışır
function onMapClick(e) {
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];
  console.log(coords);
}

//* Kullanıcının konumuna göre ekrana haritayı gösterme
function loadMap(e) {
  // Haritanın kurulumu
  map = new L.map("map").setView([e.coords.latitude, e.coords.longitude], 10);
  L.control;
  // Haritanın nasıl gözükeceğini belirler
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Harita da ekrana basılacka imleçleri tutacağımız katman
  layerGroup = L.layerGroup().addTo(map);

  // localden gelen notesları listeleme
  renderNoteList(notes);
  // Harita bir tıklanma olduğunda çalışacak fonksiyon
  map.on("click", onMapClick);
}
//* Ekrana marker basma
function renderMarker(item) {
  console.log(item);
  // markerı oluşturur
  L.marker(item.coords, { icon: detecIcon(item.status) })
    // imleçlerin olduğu katmana ekler
    .addTo(layerGroup)
    // üzerine tıklanınca açılacak popup ekleme
    .bindPopup(`${item.desc}`);
}

//* Form gönderildiğinde çalışır
function handleSubmit(e) {
  e.preventDefault();
  console.log(e);
  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // notes dizisine eleman ekleme
  notes.push({ id: new Date().getTime(), desc, date, status, coords });
  console.log(notes);
  // localStorage güncelleme
  setStorage(notes);
  // Notları ekrana aktarabilmek için fonksiyone notes dizisini parametre olarak gönderdik.
  renderNoteList(notes);

  // Form gönderildiğinde kapanır
  form.style.display = "none";
}

function renderNoteList(item) {
  list.innerHTML = "";

  // markerları temizler
  layerGroup.clearLayers();
  item.forEach((item) => {
    const listElement = document.createElement("li");
    // datasına sahip olduğu idyi ekleme
    listElement.dataset.id = item.id;
    listElement.innerHTML = `
    
    <div>
        <p>${item.desc}</p>
        <p><span>Tarih:</span>${item.date}</p>
        <p><span>Durum:</span>${detecType(item.status)}</p>
    </div>
    <i class="bi bi-x" id="delete"></i>
    <i class="bi bi-airplane-fill" id="fly"></i>
    `;
    list.insertAdjacentElement("afterbegin", listElement);
    // Ekrana marker basma
    renderMarker(item);
  });
}

function handleClick(e) {
  console.log(e.target.id);
  // güncellenecek elemanın id'sini öğrenme
  const id = e.target.parentElement.dataset.id;
  console.log(notes);
  if (e.target.id === "delete") {
    console.log("tıklanıldı");
    // idsini bildiğimiz elemanı diziden kaldırma
    notes = notes.filter((note) => note.id != id);
    console.log(notes);

    // localStorageı güncelleme
    setStorage(notes);
    // ekranı güncelle
    renderNoteList(notes);
  }

  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == id);
    map.flyTo(note.coords);
  }
}
