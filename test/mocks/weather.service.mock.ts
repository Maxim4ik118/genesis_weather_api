export const mockWeatherService = {
  getCurrentWeather: jest.fn().mockImplementation((city: string) => {
    if (city === 'NonExistentCity123') {
      throw new Error('City not found');
    }
    return Promise.resolve({
      temperature: 20.5,
      humidity: 65,
      description: 'Partly cloudy',
    });
  }),
};
