export async function fetchData(url: string) {
    // Try to fetch from cache first
    const cache = await caches.open('my-cache'); // Replace 'my-cache' with your desired cache name
    const cachedResponse = await cache.match(url);
  
    if (cachedResponse) {
      console.log('Using data from cache');
      return cachedResponse.clone(); // Return a clone to avoid modifying the cached copy
    }
  
    // If not cached, attempt to fetch from the network (will fail offline)
    try {
      const response = await fetch(url);
      console.log('Fetched data from network');
  
      // Cache the response for future use
      await cache.put(url, response.clone()); // Cache a clone to avoid modifying the original
  
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Re-throw the error for handling in the calling code
    }
  }
  
//   // Example usage
//   fetchData('https://api.example.com/data')
//     .then(response => response.json()) // Parse the JSON response
//     .then(data => {
//       console.log(data);
//       // Process the fetched data here
//     })
//     .catch(error => {
//       console.error('Error:', error);
//       // Handle errors, potentially display cached data or an offline message
//     });
  