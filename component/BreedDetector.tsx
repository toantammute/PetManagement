import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import { detectPetBreed, detectPetBreedBase64, InferenceResult } from '../services/roboflowService';
import { DEFAULT_IMAGE_PLACEHOLDER } from '../utils/constants';
import { COLORS } from '../theme/color';

interface BreedDetectorProps {
  breedType: 'cat' | 'dog';
  onDetectionComplete?: (result: InferenceResult) => void;
  displayMode?: 'full' | 'compact';
}

const BreedDetector: React.FC<BreedDetectorProps> = ({ 
  breedType, 
  onDetectionComplete,
  displayMode = 'full'
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<InferenceResult | null>(null);
  const [showDetailedResponse, setShowDetailedResponse] = useState(false);

  // Function to handle image selection
  const handleImageSelection = async (type: 'camera' | 'gallery') => {
    setErrorMessage(null);
    const options: ImageLibraryOptions & CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.7,
    };

    try {
      const response = type === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        setErrorMessage(response.errorMessage || 'Unknown error occurred');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
        setDetectionResult(null); // Reset previous results
        
        // If auto-detect is enabled for compact mode, detect immediately
        if (displayMode === 'compact' && response.assets[0].uri) {
          detectBreed(response.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image selection error:', error);
      setErrorMessage('Failed to select image');
    }
  };

  // Function to handle breed detection
  const detectBreed = async (uri?: string) => {
    // Check if we have a valid image URI
    const imageToUse = uri || imageUri;
    
    if (!imageToUse) {
      setErrorMessage('No image selected');
      return;
    }
    
    setErrorMessage(null);
    setIsLoading(true);

    try {
      console.log('Attempting to detect breed with image:', imageToUse);
      
      try {
        // Try the direct file upload approach first
        const result = await detectPetBreed(imageToUse, breedType);
        setDetectionResult(result);
        
        if (onDetectionComplete) {
          onDetectionComplete(result);
        }
      } catch (uploadError) {
        console.log('File upload failed, trying base64 approach:', uploadError);
        
        // If file upload fails, try converting to base64 and use the base64 endpoint
        const response = await fetch(imageToUse);
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
              setDetectionResult(result);
              
              if (onDetectionComplete) {
                onDetectionComplete(result);
              }
              
              resolve(result);
            } catch (base64Error) {
              console.error('Base64 detection failed:', base64Error);
              reject(base64Error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (error: any) {
      console.error('Breed detection error:', error);
      if (error.message?.includes('Network Error')) {
        setErrorMessage('Network error: Cannot connect to the server. Please check your connection.');
        Alert.alert(
          'Connection Error',
          'Could not connect to the breed detection server. Please check if the backend server is running and accessible.',
          [{ text: 'OK' }]
        );
      } else {
        setErrorMessage(
          error.response?.data?.error || 
          error.message || 
          'Failed to detect breed. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Process breed name from class string (e.g. "n02085620-Chihuahua" -> "Chihuahua")
  const getBreedNameFromClass = (classString: string): string => {
    // If format is like "n02085620-Chihuahua"
    if (classString.includes('-')) {
      return classString.split('-')[1];
    }
    // If format is just the breed name
    return classString;
  };

  // Function to render detection results
  const renderResults = () => {
    if (!detectionResult || !detectionResult.predictions || detectionResult.predictions.length === 0) {
      return null;
    }

    // Get the top prediction from the predictions array
    const topPrediction = detectionResult.predictions[0];
    const breedName = getBreedNameFromClass(topPrediction.class);
    const confidence = topPrediction.confidence;
    
    if (displayMode === 'compact') {
      return (
        <View style={styles.compactResultsContainer}>
          <Text style={styles.compactBreedName}>{breedName}</Text>
          <Text style={styles.compactMatchPercentage}>
            {`${(confidence * 100).toFixed(1)}%`}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.breedName}>{breedName}</Text>
        <Text style={styles.matchPercentage}>{`${(confidence * 100).toFixed(1)}% Match`}</Text>
        
        {/* New button to show detailed API response
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => setShowDetailedResponse(true)}
        >
          <Text style={styles.viewDetailsText}>View API Response Details</Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  // New function to render detailed API response
  const renderDetailedResponse = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailedResponse}
        onRequestClose={() => setShowDetailedResponse(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>API Response Details</Text>
            
            <ScrollView style={styles.responseScrollView}>
              {detectionResult && (
                <>
                  <View style={styles.responseSection}>
                    <Text style={styles.sectionTitle}>Breed Prediction:</Text>
                    {detectionResult.predictions?.map((prediction, index) => {
                      const breedName = getBreedNameFromClass(prediction.class);
                      return (
                        <View key={index} style={styles.predictionItem}>
                          <Text style={styles.predictionText}>
                            <Text style={styles.labelText}>Breed: </Text>
                            <Text style={styles.valueText}>{breedName}</Text>
                          </Text>
                          <Text style={styles.predictionText}>
                            <Text style={styles.labelText}>Confidence: </Text>
                            <Text style={styles.valueText}>{(prediction.confidence * 100).toFixed(2)}%</Text>
                          </Text>
                          <Text style={styles.predictionText}>
                            <Text style={styles.labelText}>Class Name: </Text>
                            <Text style={styles.valueText}>{prediction.class}</Text>
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  
                  <View style={styles.responseSection}>
                    <Text style={styles.sectionTitle}>Performance:</Text>
                    <Text style={styles.predictionText}>
                      <Text style={styles.labelText}>Processing Time: </Text>
                      <Text style={styles.valueText}>{detectionResult.time?.toFixed(4) || 'N/A'} seconds</Text>
                    </Text>
                  </View>
                  
                  <View style={styles.responseSection}>
                    <Text style={styles.sectionTitle}>Complete JSON Response:</Text>
                    <Text style={styles.jsonText}>
                      {JSON.stringify(detectionResult, null, 2)}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailedResponse(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (displayMode === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity 
          style={styles.compactImageContainer}
          onPress={() => handleImageSelection('gallery')}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.background.mint} />
          ) : (
            <Image
              source={{ uri: imageUri || DEFAULT_IMAGE_PLACEHOLDER }}
              style={styles.compactImage}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
        
        {detectionResult && renderResults()}
        {errorMessage && <Text style={styles.compactErrorText}>{errorMessage}</Text>}
        
        {!imageUri && !errorMessage && (
          <Text style={styles.compactHint}>Tap to identify {breedType}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageFrame}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Text style={styles.imageTitle}>
              {imageUri ? 'Identifying Pet Breed...' : 'Upload a pet photo'}
            </Text>
            <Image
              source={{ uri: imageUri || DEFAULT_IMAGE_PLACEHOLDER }}
              style={styles.image}
              resizeMode="contain"
            />
          </>
        )}
      </View>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {!isLoading && renderResults()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleImageSelection('gallery')}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleImageSelection('camera')}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        
        {imageUri && (
          <TouchableOpacity
            style={[styles.detectButton, isLoading && styles.disabledButton]}
            onPress={() => detectBreed()}
            disabled={!imageUri || isLoading}
          >
            <Text style={styles.buttonText}>Detect Breed</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Render the detailed API response modal */}
      {renderDetailedResponse()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageFrame: {
    width: '100%',
    height: 350,
    backgroundColor: '#8BC34A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  image: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  detectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  breedName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  matchPercentage: {
    fontSize: 18,
    color: '#388E3C',
    marginBottom: 15,
  },
  mixedBreedText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  breedHighlight: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  // Compact mode styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9FBE7',
    borderRadius: 10,
    width: '100%',
  },
  compactImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  compactImage: {
    width: 60,
    height: 60,
  },
  compactResultsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  compactBreedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  compactMatchPercentage: {
    fontSize: 14,
    color: '#388E3C',
  },
  compactHint: {
    flex: 1,
    marginLeft: 15,
    color: '#9E9E9E',
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFEBE9',
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compactErrorText: {
    flex: 1,
    marginLeft: 15,
    color: '#D32F2F',
    fontSize: 14,
  },
  viewDetailsButton: {
    marginTop: 15,
    backgroundColor: '#3F51B5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  responseScrollView: {
    width: '100%',
    maxHeight: 400,
  },
  responseSection: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  predictionItem: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    marginBottom: 8,
  },
  predictionText: {
    marginBottom: 5,
    fontSize: 14,
  },
  labelText: {
    fontWeight: 'bold',
    color: '#555',
  },
  valueText: {
    color: '#2E7D32',
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  closeButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '50%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BreedDetector;