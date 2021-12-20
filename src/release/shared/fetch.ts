/**
 * Module dependencies.
 */

import fetch, { RequestInit, Response } from 'node-fetch';

/**
 * Expose a wrapped fetch which handles network error.
 */

export function wfetch(url: string, options: RequestInit = {}) {
  return fetch(url, options).then(handleResponse, handleNetworkError);
}

/**
 * Response handler
 *
 * @param {Response} response
 * @returns {Promise<any>>|never}
 */

function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  }
  return response.json().then((error) => {
    throw error;
  });
}

/**
 * Network error handler
 *
 * @param {Error} error
 */

function handleNetworkError(error: Error) {
  throw error;
}
