import { PUBLIC_HOST_URL } from "$env/static/public";

export async function fetchData(url: string) {
    // Try to fetch from cache first
    const cache = await caches.open('my-cache'); // Replace 'my-cache' with your desired cache name
    const cachedResponse = await cache.match(url);
  
    // Return a clone to avoid modifying the cached copy
    if (cachedResponse) return cachedResponse.clone();
  
    // If not cached, attempt to fetch from the network (will fail offline)
    try {
      const response = await fetch(url);
  
      // Cache the response for future use
      await cache.put(url, response.clone()); // Cache a clone to avoid modifying the original
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Re-throw the error for handling in the calling code
    }
  }

export function requestToServer(endPoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body: string | FormData): Promise<Response | Error> | undefined {
  
  let headersList = {
    "Accept": "*/*",
    "Code-Authorization": ""
  }

  if (typeof body === 'string') {
    //@ts-ignore
    headersList["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const signal = controller.signal;

  return new Promise( async (resolve, reject) => {
    
    let timer: any;
    const requestInit: RequestInit = {
      signal,
      method,
      body,
      headers: headersList,
      credentials: "include"
    }

    if (method === 'GET') { delete requestInit['body'] }

    fetch(PUBLIC_HOST_URL + endPoint, requestInit)
      .then(response => resolve(response))
      .catch(error => { reject(error) })
      .finally(() => { clearTimeout(timer) })

    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timed out after ${8000}ms`));
    }, 8000);
  });
}

export function isResponseFromFetch(value: any): value is Response {
  return value instanceof Response;
}