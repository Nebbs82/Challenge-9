// TODO: Define a City class with name and id properties
import fs from 'fs/promises';
import path from 'node:path';

class City {
  constructor(public name: string, public id: string) {}
}
// TODO: Complete the HistoryService class
class HistoryService { 
  private filePath: string;

  constructor() {
      this.filePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'searchHistory.json');
  }
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read(): Promise<any[]> {
    try {
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}
  // private async read() {}
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
        await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
        console.error('Error writing file:', error);
    }
}
  // private async write(cities: City[]) {}
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    const citiesData = await this.read();
    return citiesData.map(city => new City(city.name, city.id));
}
  // async getCities() {}
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string): Promise<void> {
    const cities = await this.getCities();
    const newCity = new City(cityName, this.generateId());
    cities.push(newCity);
    await this.write(cities);
}
  // async addCity(city: string) {}
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    const updatedCities = cities.filter(city => city.id !== id);
    await this.write(updatedCities);
}
  // async removeCity(id: string) {}


  private generateId(): string {
    return (Math.random() * 1000000).toFixed(0);
}
}


export default new HistoryService();
