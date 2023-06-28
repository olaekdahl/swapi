/*
 * Star Wars API (SWAPI)
 * API documentation for SWAPI
 *
 * OpenAPI spec version: 1.0.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 3.0.42
 *
 * Do not edit the class manually.
 *
 */
import {ApiClient} from "../ApiClient";

/**
* Default service.
* @module api/DefaultApi
* @version 1.0.0
*/
export class DefaultApi {

    /**
    * Constructs a new DefaultApi. 
    * @alias module:api/DefaultApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instanc
    e} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }

    /**
     * Callback function to receive the result of the apiCharactersIdFilmsGet operation.
     * @callback moduleapi/DefaultApi~apiCharactersIdFilmsGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of films for a specfic characters id.
     * Returns a list of films
     * @param {Number} id The ID of the character to retrieve
     * @param {module:api/DefaultApi~apiCharactersIdFilmsGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiCharactersIdFilmsGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiCharactersIdFilmsGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/characters/{id}/films', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiFilmsIdCharactersGet operation.
     * @callback moduleapi/DefaultApi~apiFilmsIdCharactersGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of characters for a specfic film id.
     * Returns a list of characters
     * @param {Number} id The ID of the film to retrieve
     * @param {module:api/DefaultApi~apiFilmsIdCharactersGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiFilmsIdCharactersGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiFilmsIdCharactersGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/films/{id}/characters', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiFilmsIdPlanetsGet operation.
     * @callback moduleapi/DefaultApi~apiFilmsIdPlanetsGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of planets for a specfic film id.
     * Returns a list of planets
     * @param {Number} id The ID of the film to retrieve
     * @param {module:api/DefaultApi~apiFilmsIdPlanetsGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiFilmsIdPlanetsGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiFilmsIdPlanetsGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/films/{id}/planets', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiFilmsIdSpeciesGet operation.
     * @callback moduleapi/DefaultApi~apiFilmsIdSpeciesGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of species for a specfic film id.
     * Returns a list of species
     * @param {Number} id The ID of the film to retrieve
     * @param {module:api/DefaultApi~apiFilmsIdSpeciesGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiFilmsIdSpeciesGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiFilmsIdSpeciesGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/films/{id}/species', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiFilmsIdStarshipsGet operation.
     * @callback moduleapi/DefaultApi~apiFilmsIdStarshipsGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of starships for a specfic film id.
     * Returns a list of starships
     * @param {Number} id The ID of the film to retrieve
     * @param {module:api/DefaultApi~apiFilmsIdStarshipsGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiFilmsIdStarshipsGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiFilmsIdStarshipsGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/films/{id}/starships', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiFilmsIdVehiclesGet operation.
     * @callback moduleapi/DefaultApi~apiFilmsIdVehiclesGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of vehicles for a specfic film id.
     * Returns a list of vehicles
     * @param {Number} id The ID of the film to retrieve
     * @param {module:api/DefaultApi~apiFilmsIdVehiclesGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiFilmsIdVehiclesGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiFilmsIdVehiclesGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/films/{id}/vehicles', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiPlanetsIdCharactersGet operation.
     * @callback moduleapi/DefaultApi~apiPlanetsIdCharactersGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of characters for a specfic planet id.
     * Returns a list of characters
     * @param {Number} id The ID of the planet to retrieve
     * @param {module:api/DefaultApi~apiPlanetsIdCharactersGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiPlanetsIdCharactersGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiPlanetsIdCharactersGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/planets/{id}/characters', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiPlanetsIdFilmsGet operation.
     * @callback moduleapi/DefaultApi~apiPlanetsIdFilmsGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of films for a specfic planet id.
     * Returns a list of films
     * @param {Number} id The ID of the planet to retrieve
     * @param {module:api/DefaultApi~apiPlanetsIdFilmsGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiPlanetsIdFilmsGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiPlanetsIdFilmsGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/planets/{id}/films', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiSpeciesIdCharactersGet operation.
     * @callback moduleapi/DefaultApi~apiSpeciesIdCharactersGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of characters for a specfic species id.
     * Returns a list of characters
     * @param {Number} id The ID of the species to retrieve
     * @param {module:api/DefaultApi~apiSpeciesIdCharactersGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiSpeciesIdCharactersGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiSpeciesIdCharactersGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/species/{id}/characters', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
    /**
     * Callback function to receive the result of the apiStarshipsIdCharactersGet operation.
     * @callback moduleapi/DefaultApi~apiStarshipsIdCharactersGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get a list of characters for a specfic starship id.
     * Returns a list of characters
     * @param {Number} id The ID of the starship to retrieve
     * @param {module:api/DefaultApi~apiStarshipsIdCharactersGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiStarshipsIdCharactersGet(id, callback) {
      
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiStarshipsIdCharactersGet");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/api/starships/{id}/characters', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

}