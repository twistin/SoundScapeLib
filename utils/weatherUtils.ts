
import { WeatherInfo } from '../types';

export const getMockWeather = (lat: number, lng: number): WeatherInfo => {
  // In a real app, this would fetch from OpenWeatherMap or similar.
  // We simulate based on randomness and latitude for demo purposes.
  
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Overcast', 'Windy', 'Foggy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Rough temp simulation based on lat (closer to 0 is hotter)
  const baseTemp = 30 - (Math.abs(lat) / 3); 
  const randomTemp = Math.floor(baseTemp + (Math.random() * 10 - 5));

  return {
    temperature: randomTemp,
    condition: randomCondition,
    windSpeed: Math.floor(Math.random() * 20),
    humidity: Math.floor(Math.random() * 100),
  };
};
