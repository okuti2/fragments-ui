// src/api.js

import { log } from "console";
//import logger from "../../fragments/src/logger";

// fragments microservice API to use, defaults to localhost:8080 if not set in env

export const apiUrl = process.env.API_URL || 'http://localhost:8080';


/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Getting user fragments data from', { apiUrl });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'GET',
      headers: user.authorizationHeaders(),
      
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}

/**
 * Given an authenticated user, create a new fragment with the provided data.
 * We expect a user to have an `idToken` attached, so we can send that along
 * with the request.
 */
export async function createFragment(user, data) {
  console.log('Creating a new fragment...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        "content-type": data.get('contentType'),
      },
      body: data.get('body'),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const fragment = await res.json();
    console.log('Successfully created a new fragment', { fragment });
    return fragment;
  } catch (err) {
    console.error('Error creating fragment:', err);
  }
}

/**
 * Given an authenticated user, request the metadata for a specific fragment
 * We expect a user to have an `idToken` attached, so we can send that along with the request.
 */
export async function getFragmentById(user, fragmentId) {
  console.log('Getting fragment metadata from', { apiUrl });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}/info`, {
      method: 'GET',
      headers: user.authorizationHeaders(),
      
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got fragment metadata', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
  }
}