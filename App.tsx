import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

async function requestLocationPermission() {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      return true;
    }
  } catch (error) {
    console.error('Failed to request location permission:', error);
    return false;
  }
}

function App(): JSX.Element {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 37.785834,
    longitude: -122.406417,
  });
  const [startLocation, setStartLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 37.785834,
    longitude: -122.406417,
  });
  const [pathCoordinates, setPathCoordinates] = useState<
    Array<{latitude: number; longitude: number}>
  >([]);

  const startRecordingPath = async () => {
    const permissionGranted = await requestLocationPermission();

    if (permissionGranted) {
      Geolocation.watchPosition(
        pos => {
          console.log(pos, 'pos');
          const {latitude, longitude} = pos.coords;
          setCurrentLocation({latitude, longitude});

          if (pathCoordinates.length === 0) {
            setStartLocation({latitude, longitude});
          }

          setPathCoordinates(prevCoordinates => [
            ...prevCoordinates,
            {latitude, longitude},
          ]);
        },
        error => console.error('Error getting location:', error),
        {enableHighAccuracy: true, distanceFilter: 10},
      );
    } else {
      console.log('Location permission denied.');
    }
  };

  useEffect(() => {
    return () => {
      Geolocation.stopObserving();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {currentLocation.latitude && currentLocation.longitude ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            {pathCoordinates.length > 0 && (
              <Polyline
                coordinates={pathCoordinates}
                strokeColor="#FF0000"
                strokeWidth={3}
              />
            )}
            <Marker coordinate={startLocation} />
          </MapView>
        ) : (
          <Text>No location data.</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Text style={styles.title}>Start position:</Text>
        <Text style={styles.coordinates}>
          Latitude: {startLocation.latitude}
        </Text>
        <Text style={styles.coordinates}>
          Longitude: {startLocation.longitude}
        </Text>
        <Text style={styles.title}>Current position:</Text>
        <Text style={styles.coordinates}>
          Latitude: {currentLocation.latitude}
        </Text>
        <Text style={styles.coordinates}>
          Longitude: {currentLocation.longitude}
        </Text>
        <Button title="Start Recording Path" onPress={startRecordingPath} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  coordinates: {
    fontSize: 16,
    marginTop: 8,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
});

export default App;
