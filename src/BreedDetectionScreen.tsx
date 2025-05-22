import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BreedDetector from '../component/BreedDetector';
import { COLORS } from '../theme/color';
import Header from '../component/header';

// Simple icon components
const PawIcon = ({ color }: { color: string }) => (
  <View style={{ marginRight: 6 }}>
    <Text style={{ fontSize: 18, color }}>🐾</Text>
  </View>
);

const InfoIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Text style={{ fontSize: 18 }}>ℹ️</Text>
  </View>
);

const CheckIcon = () => (
  <View style={{ marginRight: 8 }}>
    <Text style={{ fontSize: 16 }}>✅</Text>
  </View>
);

const BreedDetectionScreen = () => {
  const [selectedBreedType, setSelectedBreedType] = useState<'cat' | 'dog'>('dog');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header title="Breed Detection" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedBreedType === 'dog' && styles.selectedTypeButton,
              ]}
              onPress={() => setSelectedBreedType('dog')}
            >
              <PawIcon color={selectedBreedType === 'dog' ? '#FFFFFF' : '#9E9E9E'} />
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
              <PawIcon color={selectedBreedType === 'cat' ? '#FFFFFF' : '#9E9E9E'} />
              <Text style={[
                styles.typeButtonText,
                selectedBreedType === 'cat' && styles.selectedTypeButtonText,
              ]}>Cat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detectorContainer}>
            <BreedDetector breedType={selectedBreedType} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <InfoIcon />
            <Text style={styles.infoTitle}>How It Works</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Our AI-powered breed detector uses advanced machine learning to identify 
              your pet's breed from a photo. For the most accurate results:
            </Text>
            <View style={styles.tipContainer}>
              <CheckIcon />
              <Text style={styles.tipText}>Take a clear, well-lit photo of your pet</Text>
            </View>
            <View style={styles.tipContainer}>
              <CheckIcon />
              <Text style={styles.tipText}>Ensure your pet's face is visible</Text>
            </View>
            <View style={styles.tipContainer}>
              <CheckIcon />
              <Text style={styles.tipText}>Minimize background distractions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#F5F5F7',
    marginHorizontal: 8,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.button.choose,
  },
  typeButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#9E9E9E',
    marginLeft: 6,
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  detectorContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
  },
  infoContent: {
    paddingLeft: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#424242',
  },
});

export default BreedDetectionScreen; 