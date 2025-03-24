import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Plus, X } from 'lucide-react-native';

interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  timestamp: Date;
}

declare global {
  interface Window {
    getMarkedSpots?: () => ParkingSpot[];
    onSpotsUpdate?: (spots: ParkingSpot[]) => void;
  }
}

const SEARCH_RADIUS = 1000; // 1km in meters

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Make spots available globally and notify listeners of updates
  useEffect(() => {
    window.getMarkedSpots = () => spots;
    window.onSpotsUpdate?.(spots);
  }, [spots]);

  const handleMapPress = (event: any) => {
    if (isAddingSpot) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      if (location) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          latitude,
          longitude
        );
        if (distance <= SEARCH_RADIUS) {
          setSelectedLocation({ latitude, longitude });
        } else {
          setErrorMsg('Location is outside the allowed radius');
          setTimeout(() => setErrorMsg(null), 3000);
        }
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const addParkingSpot = () => {
    if (selectedLocation && newSpotName.trim()) {
      const newSpot: ParkingSpot = {
        id: Date.now().toString(),
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        name: newSpotName.trim(),
        timestamp: new Date(),
      };
      setSpots([...spots, newSpot]);
      setNewSpotName('');
      setSelectedLocation(null);
      setIsAddingSpot(false);
    }
  };

  const cancelAddSpot = () => {
    setIsAddingSpot(false);
    setSelectedLocation(null);
    setNewSpotName('');
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          onPress={handleMapPress}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
          }}>
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={SEARCH_RADIUS}
            fillColor="rgba(8, 145, 178, 0.1)"
            strokeColor="rgba(8, 145, 178, 0.5)"
            strokeWidth={1}
          />
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.name}
              description={`Added ${spot.timestamp.toLocaleString()}`}
              pinColor="#0891b2"
            />
          ))}
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              pinColor="#ef4444"
              title="New spot location"
            />
          )}
        </MapView>
      )}
      
      <TouchableOpacity
        style={[styles.addButton, isAddingSpot && styles.activeButton]}
        onPress={() => setIsAddingSpot(!isAddingSpot)}>
        {isAddingSpot ? (
          <X color="#ffffff" size={24} />
        ) : (
          <Plus color="#ffffff" size={24} />
        )}
      </TouchableOpacity>

      <Modal
        visible={!!selectedLocation}
        transparent
        animationType="slide"
        onRequestClose={cancelAddSpot}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Parking Spot</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter spot name"
              value={newSpotName}
              onChangeText={setNewSpotName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelAddSpot}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !newSpotName.trim() && styles.disabledButton]}
                onPress={addParkingSpot}
                disabled={!newSpotName.trim()}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fee2e2',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#0891b2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#ef4444',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#64748b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});