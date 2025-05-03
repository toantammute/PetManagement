import { API_URL } from '@env';
import axios from 'axios';
import { Platform } from 'react-native';

// Use the provided API URL from .env or default to calculated fallback based on platform
const getApiUrl = () => {
  // Use API_URL from .env if available (ensures we use the exact value from .env)
  if (API_URL) return API_URL;
  
  // Platform-specific fallbacks if .env value is not available
  return Platform.OS === 'android' ? 'http://10.0.2.2:8088/api/v1' : 'http://localhost:8088/api/v1';
};

// Updated interface to match the actual API response format
export interface InferenceResult {
  predictions: {
    class: string;
    confidence: number;
  }[];
  time: number;
  image?: {
    width?: number;
    height?: number;
  };
  // The top_predictions field might not be present in the actual API response
  top_predictions?: {
    breed: string;
    confidence: number;
    match_percentage: number;
  }[];
}

// Service for handling pet breed detection
export const detectPetBreed = async (
  imageUri: string,
  breedType: 'cat' | 'dog'
): Promise<InferenceResult> => {
  try {
    // Get the appropriate API URL
    const apiUrl = getApiUrl();
    console.log('[API] Using URL:', apiUrl);
    console.log('[API] Image URI:', imageUri);
    
    const formData = new FormData();

    // Create a proper file object that the backend can process
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Create file object with proper structure for multipart/form-data
    const fileToUpload = {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: 'image/jpeg',
      name: fileName || 'photo.jpg',
    };
    
    console.log('[API] Uploading file:', fileToUpload);
    
    // Append the file to form data
    formData.append('image', fileToUpload as any);
    
  

    try {
      // Try the detect-pet endpoint 
      const response = await axios.post(`${apiUrl}/inference/detect-base64?breed=${breedType}` , formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[API] Detection response received:', response.status);
      console.log('[API] Detection response data:', response.data);
      return response.data;
    } catch (petEndpointError) {
      console.log('Pet endpoint failed, trying base64 endpoint:', petEndpointError);
      
      // If the form upload fails, convert to base64 and try that endpoint
      try {
        // Convert the image to base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64data = reader.result?.toString().split(',')[1];
              if (!base64data) {
                throw new Error('Failed to convert image to base64');
              }
              
              const result = await detectPetBreedBase64(base64data, breedType);
              resolve(result);
            } catch (base64Error) {
              console.error('[API] Base64 detection failed:', base64Error);
              reject(base64Error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(blob);
        });
      } catch (fallbackError) {
        console.error('[API] Base64 fallback failed:', fallbackError);
        throw new Error(`Connection failed to backend server. Please check if the server is running.`);
      }
    }
  } catch (error: any) {
    console.error('[API] Error detecting pet breed:', error);
    throw error;
  }
};

// Alternative method using base64 data
export const detectPetBreedBase64 = async (
  base64Image: string,
  breedType: 'cat' | 'dog'
): Promise<InferenceResult> => {
  try {
    // Get the appropriate API URL
    const apiUrl = getApiUrl();
    
    // Send the base64 data to the proper endpoint
    // Note: The URL should match the @Router annotation in the Go code: "/inference/detect-base64"
    const response = await axios.post(
      `${apiUrl}/inference/detect-base64`,
      { image: base64Image },
      {
        params: { breed: breedType },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000, // Increased timeout for slow connections
      }
    );

    console.log('[API] Base64 detection response received:', response.status);
    return response.data;
  } catch (error) {
    throw error;
  }
};
