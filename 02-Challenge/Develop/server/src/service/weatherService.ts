import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define an interface for the ForecastData object
interface ForecastData {
  dt: number;
  main: {
    temp: number;
  };
  weather: {
    description: string;
  }[];
}

// TODO: Define a class for the Weather object
class Weather {
  temperature: number;
  description: string;
  forecast: ForecastData[]; 

  constructor(temperature: number, description: string, forecast: ForecastData[]) {
    this.temperature = temperature;
    this.description = description;
    this.forecast = forecast;
  }
}

// TODO: Complete the WeatherService class
// TODO: Define the baseURL, API key, and city name properties
class WeatherService { 
  private baseURL: string = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={cdf4a963343b92aee646c8c4c8cea24c}';
  private apiKey: string = process.env.API_KEY || '';
  private cityName: string = '';

  constructor() {
    this.cityName = '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(): Promise<Coordinates> {
    const response = await fetch(this.buildGeocodeQuery());
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    const data = await response.json();
    if (!data.coord) {
      throw new Error('Invalid location data');
    }
    return {
      lat: data.coord.lat,
      lon: data.coord.lon,
    };
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `https://api.openweathermap.org/data/2.5/weather?q=${this.cityName}&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}&lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData();
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const weatherData = await response.json();
    if (!weatherData.list) {
      throw new Error('Invalid weather data');
    }
    return weatherData;
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(weatherData: any): Weather {
    const temperature = weatherData.list[0].main.temp;
    const description = weatherData.list[0].weather[0].description;
    const forecast = weatherData.list.map((item: any) => ({
      dt: item.dt,
      main: item.main,
      weather: item.weather,
    }));
    return new Weather(temperature, description, forecast);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather): any[] {
    const forecastArray: any[] = [];
    currentWeather.forecast.forEach((data) => {
      forecastArray.push({
        date: new Date(data.dt * 1000).toLocaleDateString(),
        temperature: data.main.temp,
        description: data.weather[0].description,
      });
    });
    return forecastArray;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    return this.parseCurrentWeather(weatherData);
  }
}

export default new WeatherService();
