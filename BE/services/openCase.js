import axios from 'axios';

async function getCoordinatesFromAddress(address) {
    const apiKey = process.env.OPEN_CAGE_API_KEY;
    const encodedAddress = encodeURIComponent(address).replace(/%20/g, '+');
    
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${apiKey}`;
    
    try {
      const response = await axios.get(url);
      const location = response.data.results[0].geometry;
  
      return {
        lat: location.lat,
        lng: location.lng
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }


export default getCoordinatesFromAddress;