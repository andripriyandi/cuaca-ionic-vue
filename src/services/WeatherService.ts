import axios from 'axios';

export interface HourlyTemperature {
  time: string;
  temperature: number;
}

interface ForecastResponse {
  timezone?: string;
  hourly?: {
    time?: unknown;
    temperature_2m?: unknown;
  };
  hourly_units?: {
    temperature_2m?: string;
  };
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherService {
  async getHourlyTemperatures(): Promise<HourlyTemperature[]> {
    const { data } = await axios.get<ForecastResponse>(FORECAST_URL, {
      params: {
        latitude: -6.2,
        longitude: 106.8,
        hourly: 'temperature_2m',
        timezone: 'Asia/Jakarta',
      },
      timeout: 10000,
    });

    const times = data.hourly?.time;
    const temperatures = data.hourly?.temperature_2m;
    if (!Array.isArray(times) || !Array.isArray(temperatures) || times.length !== temperatures.length) {
      throw new Error('Format data cuaca dari API tidak sesuai.');
    }

    const rows = times.map((time, index) => ({
      time,
      temperature: temperatures[index],
    }));
    if (rows.some((row) => typeof row.time !== 'string' || typeof row.temperature !== 'number')) {
      throw new Error('Data waktu atau suhu dari API tidak valid.');
    }

    return rows as HourlyTemperature[];
  }
}
