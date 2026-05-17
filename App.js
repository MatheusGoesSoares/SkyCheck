import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

const WMO_CODES = {
  0:  { label: 'Céu limpo',            icon: '☀️' },
  1:  { label: 'Principalmente limpo', icon: '🌤️' },
  2:  { label: 'Parcialmente nublado', icon: '⛅' },
  3:  { label: 'Encoberto',            icon: '☁️' },
  45: { label: 'Névoa',                icon: '🌫️' },
  48: { label: 'Névoa com geada',      icon: '🌫️' },
  51: { label: 'Garoa leve',           icon: '🌦️' },
  53: { label: 'Garoa moderada',       icon: '🌦️' },
  55: { label: 'Garoa intensa',        icon: '🌧️' },
  61: { label: 'Chuva leve',           icon: '🌧️' },
  63: { label: 'Chuva moderada',       icon: '🌧️' },
  65: { label: 'Chuva forte',          icon: '⛈️' },
  71: { label: 'Neve leve',            icon: '🌨️' },
  73: { label: 'Neve moderada',        icon: '❄️' },
  75: { label: 'Neve forte',           icon: '❄️' },
  80: { label: 'Pancadas leves',       icon: '🌦️' },
  81: { label: 'Pancadas moderadas',   icon: '🌧️' },
  82: { label: 'Pancadas fortes',      icon: '⛈️' },
  95: { label: 'Tempestade',           icon: '⛈️' },
  99: { label: 'Tempestade c/ granizo',icon: '🌩️' },
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

async function searchCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=pt&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  return res.json();
}

export default function App() {
  const [query, setQuery]               = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [searching, setSearching]       = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    loadCity({
      name: 'Recife',
      admin1: 'PE',
      country: 'Brasil',
      latitude: -8.0539,
      longitude: -34.8811,
    });
  }, []);

  async function loadCity(city) {
    setSelectedCity(city);
    setSuggestions([]);
    setQuery('');
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(city.latitude, city.longitude);
      setWeather(data);
    } catch {
      setError('Não foi possível carregar o clima. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(text) {
    setQuery(text);
    if (text.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const results = await searchCity(text);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  const current = weather?.current;
  const daily   = weather?.daily;
  const wmo     = current ? (WMO_CODES[current.weather_code] || { label: 'Desconhecido', icon: '🌡️' }) : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>🌤️</Text>
          <Text style={styles.logoText}>
            SKY<Text style={styles.logoAccent}>CHECK</Text>
          </Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cidade..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color="#22d3ee" />}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggestionItem, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => loadCity(item)}
              >
                <Text style={styles.suggestionText}>
                  {item.name}{item.admin1 ? `, ${item.admin1}` : ''} — {item.country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#22d3ee" />
            <Text style={styles.loadingText}>Carregando clima...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && current && (
          <>
            <Text style={styles.cityName}>
              {selectedCity?.name}
              {selectedCity?.admin1
                ? <Text style={styles.cityState}>, {selectedCity.admin1}</Text>
                : null}
            </Text>
            <Text style={styles.countryName}>{selectedCity?.country}</Text>

            {/* Main card */}
            <View style={styles.mainCard}>
              <Text style={styles.weatherIcon}>{wmo.icon}</Text>
              <Text style={styles.temperature}>{Math.round(current.temperature_2m)}°</Text>
              <Text style={styles.weatherLabel}>{wmo.label}</Text>
              <Text style={styles.feelsLike}>Sensação {Math.round(current.apparent_temperature)}°C</Text>
            </View>

            {/* Detail cards */}
            <View style={styles.detailsRow}>
              {[
                { icon: '💧', value: `${current.relative_humidity_2m}%`, label: 'Umidade' },
                { icon: '💨', value: `${Math.round(current.wind_speed_10m)} km/h`, label: 'Vento' },
                { icon: '🌧️', value: `${current.precipitation} mm`, label: 'Precip.' },
              ].map((item, i) => (
                <View key={i} style={styles.detailCard}>
                  <Text style={styles.detailEmoji}>{item.icon}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* 7-day forecast */}
            <Text style={styles.sectionTitle}>PREVISÃO 7 DIAS</Text>
            <View style={styles.forecastBox}>
              {daily.time.map((dateStr, i) => {
                const d = new Date(dateStr + 'T12:00:00');
                const dayName = i === 0 ? 'Hoje' : WEEK_DAYS[d.getDay()];
                const info = WMO_CODES[daily.weather_code[i]] || { icon: '🌡️', label: '' };
                const isLast = i === daily.time.length - 1;
                return (
                  <View key={i} style={[styles.forecastRow, !isLast && styles.forecastBorder]}>
                    <Text style={styles.forecastDay}>{dayName}</Text>
                    <Text style={styles.forecastEmoji}>{info.icon}</Text>
                    <Text style={styles.forecastDesc}>{info.label}</Text>
                    {daily.precipitation_sum[i] > 0 && (
                      <Text style={styles.forecastRain}>💧{daily.precipitation_sum[i]}mm</Text>
                    )}
                    <Text style={styles.forecastMax}>{Math.round(daily.temperature_2m_max[i])}°</Text>
                    <Text style={styles.forecastMin}>{Math.round(daily.temperature_2m_min[i])}°</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.footer}>Dados: Open-Meteo.com · Gratuito e sem rastreamento</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  logoAccent: { color: '#22d3ee' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },

  suggestions: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  suggestionItem: { paddingVertical: 11, paddingHorizontal: 14 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  suggestionText: { color: '#22d3ee', fontSize: 13 },

  scroll: { padding: 20, paddingBottom: 48 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },
  errorText: { color: '#f87171', fontSize: 15, textAlign: 'center' },

  cityName: { fontSize: 30, fontWeight: '900', color: '#fff', marginTop: 4, letterSpacing: -0.5 },
  cityState: { fontSize: 20, fontWeight: '400', color: '#64748b' },
  countryName: { fontSize: 13, color: '#475569', marginBottom: 18, marginTop: 2 },

  mainCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#164e63',
  },
  weatherIcon: { fontSize: 64, marginBottom: 6 },
  temperature: { fontSize: 80, fontWeight: '900', color: '#fff', lineHeight: 88 },
  weatherLabel: { fontSize: 18, color: '#22d3ee', fontWeight: '600', marginTop: 2 },
  feelsLike: { fontSize: 13, color: '#475569', marginTop: 6 },

  detailsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  detailCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  detailEmoji: { fontSize: 22, marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '700', color: '#a5f3fc' },
  detailLabel: { fontSize: 11, color: '#475569', marginTop: 2 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22d3ee',
    letterSpacing: 2,
    marginBottom: 10,
  },
  forecastBox: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    marginBottom: 24,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  forecastBorder: { borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  forecastDay: { color: '#94a3b8', fontWeight: '600', fontSize: 13, width: 36 },
  forecastEmoji: { fontSize: 20, marginHorizontal: 10 },
  forecastDesc: { color: '#475569', fontSize: 11, flex: 1 },
  forecastRain: { color: '#0e7490', fontSize: 11, marginRight: 8 },
  forecastMax: { color: '#fff', fontWeight: '700', fontSize: 14, width: 32, textAlign: 'right' },
  forecastMin: { color: '#475569', fontSize: 13, width: 32, textAlign: 'right' },

  footer: { textAlign: 'center', color: '#1e293b', fontSize: 11 },
});
