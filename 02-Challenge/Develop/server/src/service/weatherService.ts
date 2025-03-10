import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define an interface for the ForecastData object
interface ForecastData {
  list: {
    dt: number;
    dt_txt: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
    }
  }[];
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  temperature: number;
  description: string;
  forecast: {
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
    }
  }[];

  constructor(city: string, temperature: number, description: string, forecast: { dt: number; main: { temp: number,  humidity: number; }; weather: { description: string, icon: string; }[];  wind: { speed: number;} }[]) {
    this.city = city;
    this.temperature = temperature;
    this.description = description;
    this.forecast = forecast;
  }
}

// TODO: Complete the WeatherService class
// TODO: Define the baseURL, API key, and city name properties
class WeatherService { 
  private baseURL: string ;
  private apiKey: string ;
  private cityName: string ;

  constructor() {
    this.cityName = '';
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || ''; 
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(): Promise<Coordinates> {
    const response = await fetch(this.buildGeocodeQuery());
    console.log(response);
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    const data: any = await response.json();
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
    return `${this.baseURL}/weather?q=${this.cityName}&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(_coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?q=${this.cityName}&appid=${this.apiKey}&units=imperial`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData();
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<ForecastData> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data: unknown = await response.json();

    if (!this.isForecastData(data)) {
      throw new Error('Invalid weather data');
    }

    return data;
  }

  // TODO: Create isForecastData method
  private isForecastData(data: any): data is ForecastData {
    return data && typeof data === 'object' && Array.isArray(data.list) && data.list.every((item: any) =>
      typeof item.dt === 'number' &&
    typeof item.dt_txt === 'string' &&
      typeof item.main === 'object' &&
      typeof item.main.temp === 'number' &&
      Array.isArray(item.weather) &&
      item.weather.every((weather: any) => typeof weather.description === 'string')
    );
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(weatherData: ForecastData): Weather {
    const temperature = weatherData.list[0].main.temp;
    const description = weatherData.list[0].weather[0].description;
    const forecast = weatherData.list.map((item) => ({
      dt: item.dt,
      dt_txt: item.dt_txt,
      main: item.main,
      weather: item.weather,
      wind: item.wind
    }));

    
    const filteredData = forecast.filter((data) => {
      return data.dt_txt.includes("12:00:00")
    })

    filteredData.unshift(forecast[0])

    return new Weather(this.cityName, temperature, description, filteredData);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather): any[] {
    const forecastArray: any[] = [];

    currentWeather.forecast.forEach((data) => {
    //  city, date, icon, iconDescription, tempF, windSpeed, humidity
      forecastArray.push({
        city: this.cityName,
        date: new Date(data.dt * 1000).toLocaleDateString(),
        tempF: data.main.temp,
        iconDescription: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,

      });
    });
    return forecastArray;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather); 
    return forecastArray;
  }
}

export default new WeatherService();
