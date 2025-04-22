import IPMAApiClient from './api-client'
import {
	DistrictType,
	ForecastType,
	WeatherTypeDescription,
	WindSpeedType,
	WeatherDataType,
	LocationFetchOptions,
	WeatherResult,
	ForecastResult,
	LocationResult,
	WeatherTypeResult,
	WindSpeedResult,
	LocationType,
} from './types'

class IPMA {
	private apiClient: IPMAApiClient
	private weatherTypes: WeatherTypeDescription[] | null = null
	private windSpeedClasses: WindSpeedType[] | null = null
	private districts: DistrictType[] | null = null
	private islands: DistrictType[] | null = null

	constructor() {
		this.apiClient = new IPMAApiClient()
	}

	/**
	 * Initializes the IPMA client by fetching reference data
	 */
	async initialize() {
		try {
			// Fetch reference data in parallel
			const [weatherTypes, windSpeedClasses, districts, islands] =
				await Promise.all([
					this.apiClient.fetchWeatherTypes(),
					this.apiClient.fetchWindSpeedClasses(),
					this.apiClient.fetchDistricts(),
					this.apiClient.fetchIslands(),
				])

			this.weatherTypes = weatherTypes
			this.windSpeedClasses = windSpeedClasses
			this.districts = districts
			this.islands = islands
			
			return {
				weatherTypes: weatherTypes.length,
				windSpeedClasses: windSpeedClasses.length,
				districts: districts.length,
				islands: islands.length,
			}
		} catch (error) {
			console.error('Failed to initialize IPMA client:', error)
			throw error
		}
	}

	/**
	 * Gets all available locations (districts and islands)
	 */
	async getLocations(): Promise<LocationResult[]> {
		if (!this.districts || !this.islands) {
			await this.initialize()
		}

		const locations: LocationResult[] = []

		// Add districts
		if (this.districts) {
			this.districts.forEach((district) => {
				locations.push({
					id: district.idDistrito,
					name: district.local,
					type: 'district' as LocationType,
					latitude: district.latitude,
					longitude: district.longitude,
				})
			})
		}

		// Add islands
		if (this.islands) {
			this.islands.forEach((island) => {
				locations.push({
					id: island.idDistrito,
					name: island.local,
					type: 'island' as LocationType,
					latitude: island.latitude,
					longitude: island.longitude,
				})
			})
		}

		return locations
	}

	/**
	 * Gets weather forecast for a specific location
	 */
	async getForecast(
		options: LocationFetchOptions
	): Promise<ForecastResult[]> {
		if (!this.weatherTypes || !this.windSpeedClasses) {
			await this.initialize()
		}

		const forecast = await this.apiClient.fetchForecast(options)
		let locationName = 'Unknown'

		// Get location name
		if (options.districtId && this.districts) {
			const district = this.districts.find(
				(d) => d.idDistrito === options.districtId
			)
			if (district) locationName = district.local
		} else if (options.islandId && this.islands) {
			const island = this.islands.find(
				(i) => i.idDistrito === options.islandId
			)
			if (island) locationName = island.local
		}

		return forecast.map((day) => {
			const weatherType = this.weatherTypes?.find(
				(w) => w.idWeatherType === day.idWeatherType
			)
			const windSpeed = this.windSpeedClasses?.find(
				(w) => w.classWindSpeed === day.classWindSpeed
			)

			return {
				location: locationName,
				date: day.forecastDate,
				minTemperature: day.tMin,
				maxTemperature: day.tMax,
				precipitationProbability: day.precipitaProb,
				weatherType: weatherType?.descIdWeatherTypeEN || 'Unknown',
				windDirection: day.predWindDir,
				windSpeed: windSpeed?.descClassWindSpeedDailyEN || 'Unknown',
			}
		})
	}

	/**
	 * Gets current weather for mainland Portugal
	 */
	async getCurrentWeather(): Promise<WeatherResult[]> {
		const weatherData = await this.apiClient.fetchCurrentWeatherData()
		
		return weatherData.data.map((station) => {
			return {
				location: station.local,
				temperature: station.temp,
				weatherType: station.descIdWeatherTypeEN,
				humidity: station.humidade,
				windDirection: station.direcVento,
				windIntensity: station.intensidadeVento,
				rainIntensity: station.intensidadePrecipita,
				pressure: station.pressao,
				sunrise: null, // IPMA API doesn't provide sunrise/sunset info
				sunset: null,
				updatedAt: station.dataUpdate,
			}
		})
	}

	/**
	 * Gets all weather types
	 */
	async getWeatherTypes(): Promise<WeatherTypeResult[]> {
		if (!this.weatherTypes) {
			await this.initialize()
		}

		if (!this.weatherTypes) {
			return []
		}

		return this.weatherTypes.map((type) => ({
			id: type.idWeatherType,
			descriptionPT: type.descIdWeatherTypePT,
			descriptionEN: type.descIdWeatherTypeEN,
		}))
	}

	/**
	 * Gets all wind speed classes
	 */
	async getWindSpeedClasses(): Promise<WindSpeedResult[]> {
		if (!this.windSpeedClasses) {
			await this.initialize()
		}

		if (!this.windSpeedClasses) {
			return []
		}

		return this.windSpeedClasses.map((speed) => ({
			id: speed.classWindSpeed,
			descriptionPT: speed.descClassWindSpeedDailyPT,
			descriptionEN: speed.descClassWindSpeedDailyEN,
		}))
	}
}

export default IPMA
