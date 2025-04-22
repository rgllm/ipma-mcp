import { IPMA } from '../src'

// Mock the API client
jest.mock('../src/api-client', () => {
	return jest.fn().mockImplementation(() => {
		return {
			fetchDistricts: jest.fn().mockResolvedValue([
				{
					idDistrito: 1,
					idRegiao: 1,
					idAreaAviso: 'BGC',
					idConcelho: 1,
					globalIdLocal: 1010500,
					latitude: '41.5503',
					idTipoLocal: 'D',
					local: 'Braga',
					longitude: '-8.42'
				},
				{
					idDistrito: 2,
					idRegiao: 2,
					idAreaAviso: 'LSB',
					idConcelho: 2,
					globalIdLocal: 1110600,
					latitude: '38.7167',
					idTipoLocal: 'D',
					local: 'Lisboa',
					longitude: '-9.1333'
				}
			]),
			fetchIslands: jest.fn().mockResolvedValue([
				{
					idDistrito: 41,
					idRegiao: 3,
					idAreaAviso: 'AZR',
					globalIdLocal: 3420300,
					latitude: '37.74',
					idTipoLocal: 'I',
					local: 'Ponta Delgada',
					longitude: '-25.67'
				}
			]),
			fetchWeatherTypes: jest.fn().mockResolvedValue([
				{
					idWeatherType: 1,
					descIdWeatherTypeEN: 'Clear sky',
					descIdWeatherTypePT: 'Céu limpo'
				},
				{
					idWeatherType: 2,
					descIdWeatherTypeEN: 'Partly cloudy',
					descIdWeatherTypePT: 'Céu parcialmente nublado'
				}
			]),
			fetchWindSpeedClasses: jest.fn().mockResolvedValue([
				{
					classWindSpeed: 1,
					descClassWindSpeedDailyEN: 'Weak',
					descClassWindSpeedDailyPT: 'Fraco'
				}
			]),
			fetchForecast: jest.fn().mockResolvedValue([
				{
					precipitaProb: '0.0',
					tMin: '10',
					tMax: '20',
					predWindDir: 'NW',
					idWeatherType: 1,
					classWindSpeed: 1,
					longitude: '-8.42',
					globIdLocal: 1010500,
					latitude: '41.5503',
					forecastDate: '2023-11-15'
				}
			]),
			fetchCurrentWeatherData: jest.fn().mockResolvedValue({
				owner: 'IPMA',
				country: 'PT',
				data: [
					{
						idRegiao: 1,
						idAreaAviso: 'BGC',
						idConcelho: 1,
						globalIdLocal: 1010500,
						latitude: '41.5503',
						idTipoLocal: 'D',
						local: 'Braga',
						longitude: '-8.42',
						temp: '15',
						intensidadeVento: 'Fraco',
						idIntensidadeVento: 1,
						intensidadePrecipita: '',
						idIntensidadePrecipita: 0,
						idWeatherType: 1,
						descIdWeatherTypePT: 'Céu limpo',
						descIdWeatherTypeEN: 'Clear sky',
						dataUpdate: '2023-11-15 12:00',
						tempAtualizacao: '12:00',
						direcVento: 'NW',
						idDirecVento: 1,
						humidade: '70',
						pressao: '1020'
					}
				]
			})
		}
	})
})

describe('IPMA', () => {
	let ipma: IPMA

	beforeEach(() => {
		ipma = new IPMA()
	})

	test('should initialize correctly', async () => {
		const result = await ipma.initialize()
		expect(result).toEqual({
			weatherTypes: 2,
			windSpeedClasses: 1,
			districts: 2,
			islands: 1
		})
	})

	test('should get locations', async () => {
		await ipma.initialize()
		const locations = await ipma.getLocations()
		expect(locations).toHaveLength(3)
		expect(locations[0].name).toBe('Braga')
		expect(locations[0].type).toBe('district')
	})

	test('should get forecast for a district', async () => {
		await ipma.initialize()
		const forecast = await ipma.getForecast({ districtId: 1 })
		expect(forecast).toHaveLength(1)
		expect(forecast[0].location).toBe('Braga')
		expect(forecast[0].minTemperature).toBe('10')
		expect(forecast[0].maxTemperature).toBe('20')
		expect(forecast[0].weatherType).toBe('Clear sky')
	})

	test('should get current weather', async () => {
		await ipma.initialize()
		const weather = await ipma.getCurrentWeather()
		expect(weather).toHaveLength(1)
		expect(weather[0].location).toBe('Braga')
		expect(weather[0].temperature).toBe('15')
		expect(weather[0].weatherType).toBe('Clear sky')
	})

	test('should get weather types', async () => {
		await ipma.initialize()
		const types = await ipma.getWeatherTypes()
		expect(types).toHaveLength(2)
		expect(types[0].id).toBe(1)
		expect(types[0].descriptionEN).toBe('Clear sky')
	})

	test('should get wind speed classes', async () => {
		await ipma.initialize()
		const speeds = await ipma.getWindSpeedClasses()
		expect(speeds).toHaveLength(1)
		expect(speeds[0].id).toBe(1)
		expect(speeds[0].descriptionEN).toBe('Weak')
	})
})
