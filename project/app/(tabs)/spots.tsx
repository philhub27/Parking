import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MapPin, Clock, Navigation, Search } from 'lucide-react-native';
import * as Location from 'expo-location';

interface ParkingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  distance?: number;
}

export default function SpotsScreen() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const updateSpots = () => {
    if (userLocation) {
      const spotsFromMap = window.getMarkedSpots?.() || [];
      const spotsWithDistance = spotsFromMap.map(spot => ({
        ...spot,
        distance: calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          spot.latitude,
          spot.longitude
        )
      }));
      setSpots(spotsWithDistance);
    }
  };

  // Initial spots load
  useEffect(() => {
    if (userLocation) {
      updateSpots();
    }
  }, [userLocation]);

  // Listen for spots updates
  useEffect(() => {
    window.onSpotsUpdate = () => {
      updateSpots();
    };
    return () => {
      window.onSpotsUpdate = undefined;
    };
  }, [userLocation]);

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const filteredSpots = spots.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parking Spots</Text>
      
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search spots..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No parking spots found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Mark some spots on the map'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.spotItem}>
            <View style={styles.spotInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{item.name}</Text>
                {item.distance !== undefined && (
                  <View style={styles.distanceContainer}>
                    <Navigation size={14} color="#64748b" />
                    <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#0891b2" />
                <Text style={styles.coordinates}>
                  {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={16} color="#64748b" />
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  spotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  spotInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distance: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinates: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});