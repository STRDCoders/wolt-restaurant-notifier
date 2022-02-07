import { Constants } from "../utils/constants";
import Axios, { AxiosRequestConfig } from "axios";
import { Logger } from "winston";
import { LoggerFactory } from "../utils/logger-factory";
import { GeoDTO } from "../model/user-model";

const logger: Logger = LoggerFactory.getLogger("wolt-web-client");

export class WoltWebClient {
  private static readonly settings: AxiosRequestConfig = Object.freeze({ responseType: "json", timeout: 10 * 1000 });

  static async searchAddress(address: string): Promise<Array<WoltAddressSearchResult>> {
    const response = await Axios.get(
      `${Constants.woltApi.endpoints.addressSearch}${encodeURI(address)}`,
      WoltWebClient.settings
    ).catch((error) => {
      logger.error("Error while searching for address");
      throw error;
    });
    return Promise.resolve(response?.data.predictions as Array<WoltAddressSearchResult>);
  }

  static async getAddressGeo(placeId: string): Promise<WoltAddressGeoResult> {
    const response = await Axios.get(
      `${Constants.woltApi.endpoints.addressGeoLocation}${encodeURI(placeId)}`,
      WoltWebClient.settings
    ).catch((error) => {
      logger.error(`Error while searching GEO location for address: ${placeId}`);
      throw error;
    });
    if (response?.data.status !== "OK") {
      throw Error(`Error while searching GEO location for address: ${placeId}`);
    }
    return Promise.resolve(response?.data.results[0] as WoltAddressGeoResult);
  }

  static async restaurantSearch(name: string, geo: GeoDTO): Promise<Array<WoltRestaurantSearchResult>> {
    logger.info(
      `sending request to Wolt API for restaurant search: ${name} with location ${geo.coordinates[0].toString()}, ${geo.coordinates[1].toString()}`
    );
    const response = await Axios.get(
      Constants.woltApi.endpoints.searchRestaurant(name, geo.coordinates[0].toString(), geo.coordinates[1].toString()),
      WoltWebClient.settings
    ).catch((error) => {
      logger.error(`Error while searching restaurant: ${name}`);
      throw error;
    });

    return Promise.resolve(response?.data.sections[0].items as Array<WoltRestaurantSearchResult>);
  }

  static async restaurantInfo(name: string): Promise<WoltRestaurantInfoResult> {
    logger.info(`sending request to Wolt API for restaurant info: ${name}`);
    const response = await Axios.get(Constants.woltApi.endpoints.restaurantInfo(name), WoltWebClient.settings).catch(
      (error) => {
        logger.error(`Error while fetching restaurant info: ${name}`);
        throw error;
      }
    );
    if (!response.data.results || response.data.results.length !== 1) {
      throw Error(`The result for restaurant info: ${name} either dont exist or is not unique`);
    }
    return Promise.resolve(response?.data.results[0] as WoltRestaurantInfoResult);
  }
}

export interface WoltAddressSearchResult {
  description: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  place_id: string;
}

export interface WoltAddressGeoResult {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface WoltRestaurantSearchResult {
  venue: {
    slug: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    short_description: string;
  };
}
/* build object that will represent the result of the search of: https://restaurant-api.wolt.com/v3/venues/slug/fat-cow, the first object of the results array
The following properties will be taken from the response::
alive, delivery_enabled, online
 */
export interface WoltRestaurantInfoResult {
  slug: string;
  alive: number;
  online: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  delivery_specs: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    delivery_enabled: boolean;
  };
}
