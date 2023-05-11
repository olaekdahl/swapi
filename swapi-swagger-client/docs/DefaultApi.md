# StarWarsApiSwapi.DefaultApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**apiCharactersIdFilmsGet**](DefaultApi.md#apiCharactersIdFilmsGet) | **GET** /api/characters/{id}/films | Get a list of films for a specfic characters id.
[**apiFilmsIdCharactersGet**](DefaultApi.md#apiFilmsIdCharactersGet) | **GET** /api/films/{id}/characters | Get a list of characters for a specfic film id.
[**apiFilmsIdPlanetsGet**](DefaultApi.md#apiFilmsIdPlanetsGet) | **GET** /api/films/{id}/planets | Get a list of planets for a specfic film id.
[**apiFilmsIdSpeciesGet**](DefaultApi.md#apiFilmsIdSpeciesGet) | **GET** /api/films/{id}/species | Get a list of species for a specfic film id.
[**apiFilmsIdStarshipsGet**](DefaultApi.md#apiFilmsIdStarshipsGet) | **GET** /api/films/{id}/starships | Get a list of starships for a specfic film id.
[**apiFilmsIdVehiclesGet**](DefaultApi.md#apiFilmsIdVehiclesGet) | **GET** /api/films/{id}/vehicles | Get a list of vehicles for a specfic film id.
[**apiPlanetsIdCharactersGet**](DefaultApi.md#apiPlanetsIdCharactersGet) | **GET** /api/planets/{id}/characters | Get a list of characters for a specfic planet id.
[**apiPlanetsIdFilmsGet**](DefaultApi.md#apiPlanetsIdFilmsGet) | **GET** /api/planets/{id}/films | Get a list of films for a specfic planet id.
[**apiSpeciesIdCharactersGet**](DefaultApi.md#apiSpeciesIdCharactersGet) | **GET** /api/species/{id}/characters | Get a list of characters for a specfic species id.
[**apiStarshipsIdCharactersGet**](DefaultApi.md#apiStarshipsIdCharactersGet) | **GET** /api/starships/{id}/characters | Get a list of characters for a specfic starship id.

<a name="apiCharactersIdFilmsGet"></a>
# **apiCharactersIdFilmsGet**
> apiCharactersIdFilmsGet(id)

Get a list of films for a specfic characters id.

Returns a list of films

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the character to retrieve

apiInstance.apiCharactersIdFilmsGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the character to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiFilmsIdCharactersGet"></a>
# **apiFilmsIdCharactersGet**
> apiFilmsIdCharactersGet(id)

Get a list of characters for a specfic film id.

Returns a list of characters

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the film to retrieve

apiInstance.apiFilmsIdCharactersGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the film to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiFilmsIdPlanetsGet"></a>
# **apiFilmsIdPlanetsGet**
> apiFilmsIdPlanetsGet(id)

Get a list of planets for a specfic film id.

Returns a list of planets

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the film to retrieve

apiInstance.apiFilmsIdPlanetsGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the film to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiFilmsIdSpeciesGet"></a>
# **apiFilmsIdSpeciesGet**
> apiFilmsIdSpeciesGet(id)

Get a list of species for a specfic film id.

Returns a list of species

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the film to retrieve

apiInstance.apiFilmsIdSpeciesGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the film to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiFilmsIdStarshipsGet"></a>
# **apiFilmsIdStarshipsGet**
> apiFilmsIdStarshipsGet(id)

Get a list of starships for a specfic film id.

Returns a list of starships

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the film to retrieve

apiInstance.apiFilmsIdStarshipsGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the film to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiFilmsIdVehiclesGet"></a>
# **apiFilmsIdVehiclesGet**
> apiFilmsIdVehiclesGet(id)

Get a list of vehicles for a specfic film id.

Returns a list of vehicles

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the film to retrieve

apiInstance.apiFilmsIdVehiclesGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the film to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiPlanetsIdCharactersGet"></a>
# **apiPlanetsIdCharactersGet**
> apiPlanetsIdCharactersGet(id)

Get a list of characters for a specfic planet id.

Returns a list of characters

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the planet to retrieve

apiInstance.apiPlanetsIdCharactersGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the planet to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiPlanetsIdFilmsGet"></a>
# **apiPlanetsIdFilmsGet**
> apiPlanetsIdFilmsGet(id)

Get a list of films for a specfic planet id.

Returns a list of films

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the planet to retrieve

apiInstance.apiPlanetsIdFilmsGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the planet to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiSpeciesIdCharactersGet"></a>
# **apiSpeciesIdCharactersGet**
> apiSpeciesIdCharactersGet(id)

Get a list of characters for a specfic species id.

Returns a list of characters

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the species to retrieve

apiInstance.apiSpeciesIdCharactersGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the species to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="apiStarshipsIdCharactersGet"></a>
# **apiStarshipsIdCharactersGet**
> apiStarshipsIdCharactersGet(id)

Get a list of characters for a specfic starship id.

Returns a list of characters

### Example
```javascript
import {StarWarsApiSwapi} from 'star_wars_api__swapi';

let apiInstance = new StarWarsApiSwapi.DefaultApi();
let id = 1.2; // Number | The ID of the starship to retrieve

apiInstance.apiStarshipsIdCharactersGet(id, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| The ID of the starship to retrieve | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

