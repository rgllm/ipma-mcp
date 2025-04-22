import axios, { AxiosInstance, AxiosError } from 'axios'
import { z } from 'zod'

import {
	DistrictSchema,
	ForecastSchema,
	WeatherTypeSchema,
	WindSpeedSchema,
	WeatherDataSchema,
	ApiError,
	ErrorCodes,
	LocationFetchOptions,
} from './types'

class IPMAApiClient {
	private readonly client: AxiosInstance
	private readonly baseUrl = 'https://api.ipma.pt/open-data'

	constructor() {
		this.client = axios.create({
			baseURL: this.baseUrl,
			timeout: 10000,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		})
	}

	/**
	 * Fetches all districts from IPMA API
	 */
	async fetchDistricts() {
		try {
			const response = await this.client.get('/distrits-islands.json')
			const data = response.data.data
			
			// Filter only districts (idTipoLocal: 'D')
			const districts = data.filter((item: any) => item.idTipoLocal === 'D')
			
			return z.array(DistrictSchema).parse(districts)
		} catch (error) {
			throw this.handleApiError(error, 'Failed to fetch districts')
		}
	}

	/**
	 * Fetches all islands from IPMA API
	 */
	async fetchIslands() {
		try {
			const response = await this.client.get('/distrits-islands.json')
			const data = response.data.data
			
			// Filter only islands (idTipoLocal: 'I')
			const islands = data.filter((item: any) => item.idTipoLocal === 'I')
			
			return z.array(DistrictSchema).parse(islands)
		} catch (error) {
			throw this.handleApiError(error, 'Failed to fetch islands')
		}
	}

	/**
	 * Fetches weather forecast for a specific district or island
	 */
	async fetchForecast(options: LocationFetchOptions = {}) {
		try {
			let globalIdLocal: number | undefined

			if (options.districtId) {
				const districts = await this.fetchDistricts()
				const district = districts.find(
					(d) => d.idDistrito === options.districtId
				)
				globalIdLocal = district?.globalIdLocal
			} else if (options.islandId) {
				const islands = await this.fetchIslands()
				const island = islands.find((i) => i.idDistrito === options.islandId)
				globalIdLocal = island?.globalIdLocal
			}

			if (!globalIdLocal) {
				throw {
					code: ErrorCodes.NOT_FOUND,
					message: 'Location not found',
				} as ApiError
			}

			const response = await this.client.get(
				`/forecast/meteorology/cities/daily/${globalIdLocal}.json`
			)
			
			return z.array(ForecastSchema).parse(response.data.data)
		} catch (error) {
			throw this.handleApiError(error, 'Failed to fetch forecast')
		}
	}

	/**
	 * Fetches weather types and their descriptions
	 */
	async fetchWeatherTypes() {
		try {
			const response = await this.client.get('/weather-type-classe.json')
			return z.array(WeatherTypeSchema).parse(response.data.data)
		} catch (error) {
			throw this.handleApiError(error, 'Failed to fetch weather types')
		}
	}

	/**
	 * Fetches wind speed classes and their descriptions
	 */
	async fetchWindSpeedClasses() {
		try {
			const response = await this.client.get('/wind-speed-daily-classe.json')
			return z.array(WindSpeedSchema).parse(response.data.data)
		} catch (error) {
			throw this.handleApiError(error, 'Failed to fetch wind speed classes')
		}
	}

	/**
	 * Fetches current weather data for Portugal mainland
	 */
	async fetchCurrentWeatherData() {
		try {
			const response = await this.client.get('/observation/meteorology/stations/observations.json')
			return WeatherDataSchema.parse(response.data)
		} catch (error) {
			throw this.handleApiError(error, 'Failed to fetch current weather data')
		}
	}

	/**
	 * Handles API errors and provides consistent error messages
	 */
	private handleApiError(error: unknown, defaultMessage: string): ApiError {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError
			
			if (!axiosError.response) {
				return {
					code: ErrorCodes.NETWORK_ERROR,
					message: 'Network error occurred',
					originalError: error,
				}
			}
			
			if (axiosError.response.status === 404) {
				return {
					code: ErrorCodes.NOT_FOUND,
					message: 'Resource not found',
					originalError: error,
				}
			}
			
			return {
				code: ErrorCodes.INVALID_RESPONSE,
				message: `API error: ${axiosError.message}`,
				originalError: error,
			}
		}
		
		if (error instanceof z.ZodError) {
			return {
				code: ErrorCodes.VALIDATION_ERROR,
				message: 'Invalid data received from API',
				originalError: error,
			}
		}
		
		if ((error as ApiError).code) {
			return error as ApiError
		}
		
		return {
			code: ErrorCodes.INVALID_RESPONSE,
			message: defaultMessage,
			originalError: error,
		}
	}
}

export default IPMAApiClient
