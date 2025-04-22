import { z } from 'zod'

// District & Island schema
export const DistrictSchema = z.object({
	idDistrito: z.number(),
	idRegiao: z.number(),
	idAreaAviso: z.string(),
	idConcelho: z.number().optional(),
	globalIdLocal: z.number(),
	latitude: z.string(),
	idTipoLocal: z.string(),
	local: z.string(),
	longitude: z.string(),
})

export type DistrictType = z.infer<typeof DistrictSchema>

// Forecast schema
export const ForecastSchema = z.object({
	precipitaProb: z.string().nullable(),
	tMin: z.string(),
	tMax: z.string(),
	predWindDir: z.string(),
	idWeatherType: z.number(),
	classWindSpeed: z.number(),
	longitude: z.string(),
	idArea: z.number().optional(),
	globIdLocal: z.number(),
	latitude: z.string(),
	forecastDate: z.string(),
})

export type ForecastType = z.infer<typeof ForecastSchema>

// Weather types schema
export const WeatherTypeSchema = z.object({
	idWeatherType: z.number(),
	descIdWeatherTypeEN: z.string(),
	descIdWeatherTypePT: z.string(),
})

export type WeatherTypeDescription = z.infer<typeof WeatherTypeSchema>

// Wind speed types schema
export const WindSpeedSchema = z.object({
	classWindSpeed: z.number(),
	descClassWindSpeedDailyEN: z.string(),
	descClassWindSpeedDailyPT: z.string(),
})

export type WindSpeedType = z.infer<typeof WindSpeedSchema>

// Weather data schema
export const WeatherDataSchema = z.object({
	owner: z.string(),
	country: z.string(),
	data: z.array(
		z.object({
			idRegiao: z.number(),
			idAreaAviso: z.string(),
			idConcelho: z.number(),
			globalIdLocal: z.number(),
			latitude: z.string(),
			idTipoLocal: z.string(),
			local: z.string(),
			longitude: z.string(),
			temp: z.string(),
			intensidadeVento: z.string(),
			idIntensidadeVento: z.number(),
			intensidadePrecipita: z.string(),
			idIntensidadePrecipita: z.number(),
			idWeatherType: z.number(),
			descIdWeatherTypePT: z.string(),
			descIdWeatherTypeEN: z.string(),
			idWeatherTypeHumid: z.number().optional(),
			dataUpdate: z.string(),
			tempAtualizacao: z.string(),
			direcVento: z.string(),
			idDirecVento: z.number(),
			humidade: z.string(),
			pressao: z.string(),
			tMin5min: z.string().optional(),
			tMax5min: z.string().optional(),
			tMed5min: z.string().optional(),
			precQuant: z.string().optional(),
		})
	),
})

export type WeatherDataType = z.infer<typeof WeatherDataSchema>

// Options for district and island fetch
export type LocationFetchOptions = {
	districtId?: number
	islandId?: number
}

// Common errors
export enum ErrorCodes {
	NETWORK_ERROR = 'NETWORK_ERROR',
	INVALID_RESPONSE = 'INVALID_RESPONSE',
	NOT_FOUND = 'NOT_FOUND',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export type ApiError = {
	code: ErrorCodes
	message: string
	originalError?: unknown
}

// Locations
export type LocationType = 'district' | 'island'

// Return types for class methods
export type WeatherResult = {
	location: string
	temperature: string
	weatherType: string
	humidity: string
	windDirection: string
	windIntensity: string
	rainIntensity: string | null
	pressure: string
	sunrise: string | null
	sunset: string | null
	updatedAt: string
}

export type ForecastResult = {
	location: string
	date: string
	minTemperature: string
	maxTemperature: string
	precipitationProbability: string | null
	weatherType: string
	windDirection: string
	windSpeed: string
}

export type LocationResult = {
	id: number
	name: string
	type: LocationType
	latitude: string
	longitude: string
}

export type WeatherTypeResult = {
	id: number
	descriptionPT: string
	descriptionEN: string
}

export type WindSpeedResult = {
	id: number
	descriptionPT: string
	descriptionEN: string
}
