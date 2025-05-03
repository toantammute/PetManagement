import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BreedDetector from '../../component/BreedDetector';
import { COLORS } from '../../theme/color';

const BreedDetectionScreen = () => {
  const [selectedBreedType, setSelectedBreedType] = useState<'cat' | 'dog'>('dog');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Pet Breed Detector</Text>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedBreedType === 'dog' && styles.selectedTypeButton,
            ]}
            onPress={() => setSelectedBreedType('dog')}
          >
            <Text style={[
              styles.typeButtonText,
              selectedBreedType === 'dog' && styles.selectedTypeButtonText,
            ]}>Dog</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedBreedType === 'cat' && styles.selectedTypeButton,
            ]}
            onPress={() => setSelectedBreedType('cat')}
          >
            <Text style={[
              styles.typeButtonText,
              selectedBreedType === 'cat' && styles.selectedTypeButtonText,
            ]}>Cat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detectorContainer}>
          <BreedDetector breedType={selectedBreedType} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.background.mint,
  },
  typeButtonText: {
    fontWeight: 'bold',
    color: '#666',
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  detectorContainer: {
    width: '100%',
  },
});

export default BreedDetectionScreen; 