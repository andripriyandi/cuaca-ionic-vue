<template>
  <ion-page>
    <ion-header class="app-header">
      <ion-toolbar>
        <div slot="start" class="brand-mark" aria-hidden="true"><span>✦</span></div>
        <ion-title>Cuaca<span class="brand-accent">.</span>Jakarta</ion-title>
        <span slot="end" class="header-zone">JAKARTA <b>·</b> WIB</span>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="container">
        <div class="intro">
          <div>
            <p class="eyebrow"><span class="eyebrow-line" /> DASHBOARD PRAKIRAAN</p>
            <h1>Cuaca dalam<br /><em>setiap jam.</em></h1>
            <p class="intro-copy">Lihat pergerakan suhu Jakarta dengan ringkas, lalu telusuri setiap pengukuran dalam WIB.</p>
          </div>
          <span class="intro-coordinate">6,2° LS <span>·</span> 106,8° BT</span>
        </div>

        <section class="hero" aria-label="Ringkasan prakiraan suhu">
          <div class="hero-orbit" aria-hidden="true" />
          <div class="hero-main">
            <div class="hero-reading">
              <span class="hero-kicker"><span class="signal-dot" /> PRAKIRAAN TERDEKAT</span>
              <div class="hero-temp">{{ highlight ? formatNumber(highlight.temperature) : '—' }}<span>°C</span></div>
              <p class="hero-time">{{ highlight ? formatTime(highlight.time) + ' WIB' : 'Mengambil data terbaru...' }}</p>
              <div class="hero-note">Data suhu per jam dari Open-Meteo</div>
            </div>
            <div class="chart-panel">
              <div class="chart-heading">
                <div><span>TREN TEMPERATUR</span><strong>24 jam ke depan</strong></div>
                <span class="chart-unit">°C</span>
              </div>
              <div v-if="chartRows.length > 1" class="chart-wrap" role="img" :aria-label="`Grafik suhu 24 jam, dari ${formatNumber(chartMin)} sampai ${formatNumber(chartMax)} derajat Celsius`">
                <span class="chart-max">{{ formatNumber(chartMax) }}°</span>
                <svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#d8ff95" stop-opacity=".3" /><stop offset="100%" stop-color="#d8ff95" stop-opacity="0" /></linearGradient>
                  </defs>
                  <path d="M 12 42 H 588 M 12 95 H 588 M 12 148 H 588" class="chart-grid" />
                  <path :d="chartArea" fill="url(#chart-fill)" />
                  <path :d="chartLine" class="chart-line" />
                </svg>
                <span class="chart-min">{{ formatNumber(chartMin) }}°</span>
              </div>
              <div v-else class="chart-placeholder">Grafik akan tampil setelah data tersedia.</div>
              <div class="chart-axis"><span>{{ chartRows[0] ? formatHour(chartRows[0].time) : '—' }}</span><span>{{ chartRows.length ? formatHour(chartRows[chartRows.length - 1].time) : '—' }}</span></div>
            </div>
          </div>
          <div class="hero-bottom"><span>JAKARTA, INDONESIA</span><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">SUMBER: OPEN-METEO ↗</a></div>
        </section>

        <div class="summary" aria-label="Ringkasan seluruh data">
          <div class="summary-card"><span class="summary-icon">01</span><div><p>Data tersedia</p><strong>{{ temperatures.length || '—' }} <small>jam</small></strong></div></div>
          <div class="summary-card"><span class="summary-icon purple">02</span><div><p>Cakupan prakiraan</p><strong>{{ groupedDays.length || '—' }} <small>hari</small></strong></div></div>
          <div class="summary-card"><span class="summary-icon peach">03</span><div><p>Rentang suhu</p><strong class="summary-range">{{ temperatureRange }}</strong></div></div>
        </div>

        <section class="forecast" aria-labelledby="forecast-title">
          <div class="forecast-head">
            <div><p class="eyebrow"><span class="eyebrow-line" /> DATA LENGKAP</p><h2 id="forecast-title">Prakiraan per jam</h2><p>Semua waktu pengukuran dan suhu disajikan dalam WIB.</p></div>
            <ion-button class="refresh" :disabled="loading" @click="loadWeather">{{ loading ? 'Memuat...' : '↻  Muat ulang' }}</ion-button>
          </div>

          <div v-if="loading" class="message" role="status"><ion-spinner name="crescent" /><strong>Sedang mengambil prakiraan</strong><span>Data akan muncul sebentar lagi.</span></div>
          <div v-else-if="error" class="message error" role="alert"><strong>Data belum dapat ditampilkan</strong><span>{{ error }}</span><ion-button fill="outline" @click="loadWeather">Coba lagi</ion-button></div>
          <div v-else-if="!temperatures.length" class="message" role="status">Tidak ada data suhu yang tersedia.</div>
          <template v-else>
            <nav class="day-filter" aria-label="Pilih hari prakiraan">
              <button type="button" :class="['day-chip', { active: selectedDay === 'all' }]" :aria-pressed="selectedDay === 'all'" @click="selectedDay = 'all'">Semua hari <span>{{ temperatures.length }}</span></button>
              <button v-for="day in groupedDays" :key="day.date" type="button" :class="['day-chip', { active: selectedDay === day.date }]" :aria-pressed="selectedDay === day.date" @click="selectedDay = day.date">{{ formatChipDate(day.date) }}</button>
            </nav>
            <div class="result-note">Menampilkan <strong>{{ visibleCount }}</strong> dari {{ temperatures.length }} data per jam</div>
            <div class="day-list">
              <section v-for="day in visibleDays" :key="day.date" class="day-panel" :aria-label="formatDay(day.date)">
                <div class="day-panel-head"><div><span class="day-index">{{ String(groupedDays.findIndex((item) => item.date === day.date) + 1).padStart(2, '0') }}</span><h3>{{ formatDay(day.date) }}</h3></div><span class="day-hours">{{ day.rows.length }} JAM</span></div>
                <div class="table-scroll"><table><caption class="sr-only">Waktu dan suhu pada {{ formatDay(day.date) }}</caption><thead><tr><th scope="col">WAKTU PENGUKURAN (WIB)</th><th scope="col">TEMPERATUR</th></tr></thead><tbody><tr v-for="row in day.rows" :key="row.time"><td><time :datetime="row.time">{{ formatTime(row.time) }}</time></td><td><span class="temp-value">{{ formatNumber(row.temperature) }}<small>°C</small></span></td></tr></tbody></table></div>
              </section>
            </div>
          </template>
        </section>

        <footer>Sumber data <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a><span>·</span> Koordinat Jakarta −6,2 / 106,8 <span>·</span> Zona waktu Asia/Jakarta</footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonButton, IonContent, IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/vue';
import axios from 'axios';
import { WeatherService, type HourlyTemperature } from '../services/WeatherService';

interface DayGroup { date: string; rows: HourlyTemperature[] }
const weatherService = new WeatherService();
const temperatures = ref<HourlyTemperature[]>([]);
const loading = ref(false);
const error = ref('');
const selectedDay = ref('all');

const groupedDays = computed<DayGroup[]>(() => {
  const days = new Map<string, HourlyTemperature[]>();
  for (const row of temperatures.value) {
    const date = row.time.slice(0, 10);
    if (!days.has(date)) days.set(date, []);
    days.get(date)!.push(row);
  }
  return Array.from(days, ([date, rows]) => ({ date, rows }));
});
const visibleDays = computed(() => selectedDay.value === 'all' ? groupedDays.value : groupedDays.value.filter((day) => day.date === selectedDay.value));
const visibleCount = computed(() => visibleDays.value.reduce((sum, day) => sum + day.rows.length, 0));

function forecastMillis(time: string): number { return Date.parse(`${time}:00+07:00`); }
const highlight = computed(() => temperatures.value.find((row) => forecastMillis(row.time) >= Date.now()) ?? temperatures.value[0]);
const chartRows = computed(() => {
  const firstFuture = temperatures.value.findIndex((row) => forecastMillis(row.time) >= Date.now());
  return temperatures.value.slice(Math.max(firstFuture, 0), Math.max(firstFuture, 0) + 24);
});
const chartMin = computed(() => Math.min(...chartRows.value.map((row) => row.temperature)));
const chartMax = computed(() => Math.max(...chartRows.value.map((row) => row.temperature)));
const chartPoints = computed(() => chartRows.value.map((row, index) => {
  const x = 12 + index * (576 / Math.max(chartRows.value.length - 1, 1));
  const y = 132 - ((row.temperature - chartMin.value) / Math.max(chartMax.value - chartMin.value, 1)) * 100;
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}));
const chartLine = computed(() => chartPoints.value.map((point, index) => `${index ? 'L' : 'M'} ${point}`).join(' '));
const chartArea = computed(() => chartPoints.value.length ? `${chartLine.value} L 588 150 L 12 150 Z` : '');
const temperatureRange = computed(() => {
  if (!temperatures.value.length) return '—';
  const values = temperatures.value.map((row) => row.temperature);
  return `${formatNumber(Math.min(...values))}–${formatNumber(Math.max(...values))} °C`;
});

async function loadWeather() {
  loading.value = true;
  error.value = '';
  try {
    temperatures.value = await weatherService.getHourlyTemperatures();
    if (selectedDay.value !== 'all' && !groupedDays.value.some((day) => day.date === selectedDay.value)) selectedDay.value = 'all';
  } catch (cause) {
    temperatures.value = [];
    error.value = axios.isAxiosError(cause)
      ? 'Periksa koneksi internet, lalu tekan Coba lagi.'
      : cause instanceof Error ? cause.message : 'Terjadi kesalahan yang tidak diketahui.';
  } finally { loading.value = false; }
}

function formatNumber(value: number): string { return value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
function formatHour(value: string): string { return value.slice(11, 16); }
function formatTime(value: string): string {
  const [date, time] = value.split('T');
  if (!date || !time) return value;
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} · ${time.slice(0, 5)}`;
}
function dateFromApi(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
function formatDay(value: string): string { return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(dateFromApi(value)); }
function formatChipDate(value: string): string { return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(dateFromApi(value)); }
onMounted(loadWeather);
</script>

<style scoped>
ion-toolbar { --background: #fff; --color: #211a3e; --min-height: 72px; --padding-start: max(20px, calc((100vw - 1160px) / 2)); --padding-end: max(20px, calc((100vw - 1160px) / 2)); }
ion-title { padding-inline: 12px; font-size: 18px; font-weight: 800; letter-spacing: -.04em; }
.brand-accent { color: #8058ef; }
.brand-mark { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 11px; background: #25194d; color: #d9ff8d; font-size: 24px; }
.header-zone { align-self: center; color: #6b6581; font-size: 11px; font-weight: 800; letter-spacing: .13em; }
.header-zone b { color: #9f87e2; padding-inline: 5px; }
.container { max-width: 1160px; margin: 0 auto; padding: 48px 24px 60px; }
.intro { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 32px; }
.eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 15px; color: #7157bd; font-size: 11px; font-weight: 850; letter-spacing: .18em; }
.eyebrow-line { display: inline-block; width: 19px; height: 2px; background: #8d6be4; }
h1 { margin: 0; color: #241b43; font-size: clamp(43px, 5vw, 67px); line-height: 1.02; font-weight: 850; letter-spacing: -.07em; }
h1 em { color: #8b68e5; font-style: normal; }
.intro-copy { max-width: 590px; margin: 18px 0 0; color: #787389; font-size: 15px; line-height: 1.65; }
.intro-coordinate { border: 1px solid #e9e5f1; border-radius: 999px; padding: 10px 14px; background: #fff; color: #777084; font-size: 11px; font-weight: 750; white-space: nowrap; }
.intro-coordinate span { color: #ad9cca; padding-inline: 4px; }
.hero { position: relative; overflow: hidden; border-radius: 30px; color: #fff; background: radial-gradient(circle at 83% -20%, #49317e 0, transparent 42%), linear-gradient(120deg, #251a4d, #171334 72%); box-shadow: 0 28px 55px rgba(39, 25, 83, .2); }
.hero-orbit { position: absolute; width: 420px; height: 420px; top: -245px; right: -95px; border: 1px solid rgba(255,255,255,.11); border-radius: 50%; box-shadow: 0 0 0 58px rgba(255,255,255,.025), 0 0 0 116px rgba(255,255,255,.02); }
.hero-main { position: relative; display: grid; grid-template-columns: minmax(265px, .8fr) minmax(0, 1.2fr); gap: 34px; min-height: 330px; padding: 42px 44px 34px; }
.hero-reading { display: flex; flex-direction: column; align-items: flex-start; }
.hero-kicker { display: flex; align-items: center; gap: 9px; color: #cbc2eb; font-size: 11px; font-weight: 850; letter-spacing: .16em; }
.signal-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #d9ff91; box-shadow: 0 0 0 5px rgba(217,255,145,.11); }
.hero-temp { margin-top: 22px; font-size: clamp(72px, 8vw, 104px); line-height: 1; font-weight: 700; letter-spacing: -.08em; }
.hero-temp span { margin-left: 7px; color: #d8ff91; font-size: 32px; letter-spacing: 0; vertical-align: top; }
.hero-time { margin: 10px 0 0; color: #fff; font-size: 15px; font-weight: 650; }
.hero-note { margin-top: auto; color: #a69cc8; font-size: 12px; }
.chart-panel { align-self: center; min-width: 0; border: 1px solid rgba(255,255,255,.13); border-radius: 22px; padding: 22px 24px 18px; background: rgba(255,255,255,.06); backdrop-filter: blur(12px); }
.chart-heading { display: flex; justify-content: space-between; align-items: start; }
.chart-heading div { display: flex; flex-direction: column; gap: 5px; }
.chart-heading div span { color: #b7acd8; font-size: 10px; font-weight: 850; letter-spacing: .16em; }
.chart-heading strong { font-size: 17px; font-weight: 750; }
.chart-unit { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: rgba(216,255,145,.14); color: #d8ff91; font-size: 13px; font-weight: 800; }
.chart-wrap { position: relative; height: 168px; margin-top: 10px; }
.chart-wrap svg { width: 100%; height: 100%; overflow: visible; }
.chart-grid { fill: none; stroke: rgba(255,255,255,.11); stroke-width: 1; stroke-dasharray: 4 6; }
.chart-line { fill: none; stroke: #d8ff91; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.chart-max, .chart-min { position: absolute; right: 0; color: #c6bddf; font-size: 10px; }
.chart-max { top: 10px; }.chart-min { bottom: 3px; }
.chart-placeholder { display: grid; place-items: center; height: 168px; color: #b7acd8; font-size: 12px; }
.chart-axis { display: flex; justify-content: space-between; padding: 0 6px; color: #b7acd8; font-size: 11px; }
.hero-bottom { position: relative; display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid rgba(255,255,255,.12); padding: 18px 44px; color: #afa6d0; font-size: 10px; font-weight: 800; letter-spacing: .15em; }
.hero-bottom a { color: inherit; text-decoration: none; }
.summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 20px 0 60px; }
.summary-card { display: flex; align-items: center; gap: 18px; min-height: 114px; border: 1px solid #ebe8f1; border-radius: 20px; padding: 20px; background: #fff; box-shadow: 0 8px 24px rgba(35,28,71,.035); }
.summary-icon { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 13px; background: #e7f5d4; color: #546b21; font-size: 12px; font-weight: 900; }
.summary-icon.purple { background: #eee6ff; color: #704ac4; }.summary-icon.peach { background: #fff0e3; color: #a8653b; }
.summary-card p { margin: 0 0 5px; color: #817b91; font-size: 12px; }
.summary-card strong { color: #292145; font-size: 27px; font-weight: 800; letter-spacing: -.05em; white-space: nowrap; }
.summary-card strong small { color: #9791a5; font-size: 13px; font-weight: 550; letter-spacing: 0; }
.summary-card .summary-range { font-size: clamp(17px, 2.1vw, 24px); }
.forecast-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 28px; }
.forecast-head .eyebrow { margin-bottom: 10px; }
h2 { margin: 0; color: #241b43; font-size: clamp(30px, 3vw, 40px); font-weight: 800; letter-spacing: -.055em; }
.forecast-head p:last-child { margin: 9px 0 0; color: #827c91; font-size: 13px; }
.refresh { --background: #251a4d; --background-hover: #3c2b73; --color: #fff; --border-radius: 12px; --padding-start: 20px; --padding-end: 20px; flex: none; margin: 0; font-size: 12px; font-weight: 750; text-transform: none; }
.day-filter { display: flex; gap: 9px; overflow-x: auto; padding: 0 0 12px; scrollbar-width: thin; }
.day-chip { flex: none; border: 1px solid #e4dfed; border-radius: 11px; padding: 11px 14px; background: #fff; color: #6d6682; font: inherit; font-size: 12px; font-weight: 750; cursor: pointer; transition: background .2s, color .2s, transform .2s; }
.day-chip:hover { transform: translateY(-2px); }.day-chip.active { border-color: #291d53; background: #291d53; color: #fff; }
.day-chip span { margin-left: 6px; color: #d8ff91; }
.result-note { margin: 6px 0 19px; color: #8b8499; font-size: 12px; }.result-note strong { color: #533aa4; }
.day-list { display: grid; gap: 18px; }
.day-panel { overflow: hidden; border: 1px solid #eae6f1; border-radius: 19px; background: #fff; box-shadow: 0 9px 30px rgba(35,28,71,.035); }
.day-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 19px 24px; }
.day-panel-head > div { display: flex; align-items: center; gap: 14px; }
.day-index { color: #9d8fc2; font-size: 12px; font-weight: 800; }.day-panel h3 { margin: 0; color: #30284f; font-size: 16px; font-weight: 780; text-transform: capitalize; }
.day-hours { border-radius: 999px; padding: 7px 10px; background: #f2ecff; color: #7054b7; font-size: 10px; font-weight: 850; letter-spacing: .08em; white-space: nowrap; }
.table-scroll { overflow-x: auto; }table { width: 100%; border-collapse: collapse; text-align: left; }th,td { padding: 13px 24px; }
th { background: #f8f6fb; color: #968da9; font-size: 10px; font-weight: 850; letter-spacing: .12em; }
th:last-child,td:last-child { text-align: right; }td { border-top: 1px solid #f0edf5; color: #554e68; font-size: 13px; }tbody tr:hover { background: #fbf9ff; }
time { font-variant-numeric: tabular-nums; }.temp-value { color: #30235b; font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }.temp-value small { margin-left: 3px; color: #9e8ccc; font-size: 11px; }
.message { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 190px; border: 1px solid #eae6f1; border-radius: 19px; padding: 24px; background: #fff; color: #827c91; text-align: center; font-size: 13px; }
.message strong { color: #30284f; font-size: 15px; }.message.error strong { color: #a93f59; }.message ion-spinner { color: #7f5cd2; }
footer { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 30px; color: #8d879d; font-size: 11px; }footer a { color: #6c4bc2; font-weight: 750; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 800px) {
  .container { padding: 34px 18px 48px; }.intro-coordinate { display: none; }
  .hero-main { grid-template-columns: 1fr; gap: 24px; padding: 34px 28px 30px; }.hero-reading { min-height: 220px; }.hero-note { margin-top: 18px; }.hero-bottom { padding: 16px 28px; }
  .summary { gap: 10px; margin-bottom: 50px; }.summary-card { gap: 10px; padding: 15px; }.summary-icon { width: 36px; height: 36px; }.summary-card strong { font-size: 23px; }.summary-card .summary-range { font-size: 16px; }
}
@media (max-width: 560px) {
  ion-toolbar { --min-height: 64px; }.header-zone { font-size: 9px; }.container { padding: 30px 16px 42px; }
  h1 { font-size: clamp(40px, 11vw, 54px); }.intro-copy { font-size: 13px; }.hero { border-radius: 23px; }.hero-main { padding: 30px 22px 25px; }.hero-reading { min-height: 190px; }.hero-temp { font-size: 80px; }.chart-panel { padding: 18px 16px 16px; }.hero-bottom { padding: 15px 22px; font-size: 9px; }
  .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }.summary-card:last-child { grid-column: 1 / -1; }.summary-card { min-height: 100px; }
  .forecast-head { align-items: flex-start; flex-direction: column; }.day-panel-head { padding: 16px; }.day-panel h3 { font-size: 13px; }th,td { padding: 12px 16px; }th { font-size: 9px; }
}
@media (max-width: 360px) { .header-zone { display: none; }.hero-bottom { letter-spacing: .07em; }.day-panel-head > div { gap: 8px; } }
</style>
