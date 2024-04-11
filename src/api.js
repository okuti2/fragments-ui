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
///  console.log('Getting user fragments data from', { apiUrl });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      method: 'GET',
      headers: user.authorizationHeaders(),
      
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
 //   console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
  //  console.error('Unable to call GET /v1/fragment', { err });
      throw new Error(err);
  }
}

/**
 * Given an authenticated user, create a new fragment with the provided data.
 * We expect a user to have an `idToken` attached, so we can send that along
 * with the request.
 */
export async function createFragment(user, data) {
//  console.log('Creating a new fragment...');
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
  //  console.log('Successfully created a new fragment', { fragment });
    return fragment;
  } catch (err) {
   // console.error('Error creating fragment:', err);
    throw new Error(err);
  }
}

/**
 * Given an authenticated user, request the metadata for a specific fragment
 * We expect a user to have an `idToken` attached, so we can send that along with the request.
 */
export async function getFragmentById(user, fragmentId, contentType) {
  var res;
  try {
    if(!contentType) {
      res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
        method: 'GET',
        headers: user.authorizationHeaders(), 
      });
    }else{
      res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}${contentType}`, {
        method: 'GET',
        headers: user.authorizationHeaders(), 
      });
    }
    if (!res.ok) {
      alert("Unsupported fragment conversion");
      throw new Error(`${res.status} ${res.statusText}`);
    }

    // Check if the content type in the header starts with image
    const type = res.headers.get('content-type');
  //  console.log('Content type:', { type });
    if (type.startsWith('image/')) {
    //  console.log('Adding image to the fragment data');
      // Converts the binary blob to a base64 string
      const blob = await res.blob();
      const data = URL.createObjectURL(blob);
    //  console.log('Successfully got IMAGE fragment data', { data });
   //   console.log('Successfully got fragment data', { data });
      return data;
    }else{
      // Converts the binary blob to a string
      const data = await res.text();
     // console.log('Successfully got fragment data', { data });
      return data;
    }
  } catch (err) {
   // console.error('Unable to call GET /v1/fragment', { err });
    throw new Error(err);
  }
}

/**
 * Given an authenticated user, delete the metadata for a specific fragment
 * We expect a user to have an `idToken` attached, so we can send that along with the request.
 */
export async function deleteFragment(user, fragmentId) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
   // console.log('Successfully deleted fragment', { fragmentId });
  } catch (err) {
   // console.error('Unable to call DELETE /v1/fragment', { err });
    throw err;
  }
}

/**
 * Given an authenticated user, update a new fragment with the provided data.
 * We expect a user to have an `idToken` attached, so we can send that along
 * with the request.
 */
export async function updateFragment(user, fragmentId, data, contentType) {
  //console.log('Updating a fragment...');
  //console.log('Data:', { data });
  //console.log('Content Type:', { contentType });
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        "content-type": contentType,
      },
      body: data,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    //const fragment = await res.json();
   // console.log('Successfully updated a fragment', { fragmentId });
    //return fragment;
  } catch (err) {
   // console.error('Error updating fragment:', err);
    throw err;
  }
}


