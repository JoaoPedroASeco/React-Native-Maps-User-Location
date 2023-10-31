import { useEffect, useState, useRef } from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy,
  reverseGeocodeAsync,
} from "expo-location";
import MapView, { Marker } from "react-native-maps";

export default function App() {
  const mapRef = useRef<any>(null);
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [address, setAddress] = useState<any>(null);

  const requestLocationPermission = async () => {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);
  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
        mayShowUserSettingsDialog: true,
      },
      (response) => {
        setLocation(response);
        mapRef.current?.animateCamera({
          center: response.coords,
        });

        const handleGetAddressInfo = async () => {
          const addressInfo = await reverseGeocodeAsync({
            latitude: response.coords.latitude,
            longitude: response.coords.longitude,
          });
          setAddress(addressInfo);
        };
        handleGetAddressInfo();
      }
    );
  }, []);

  return (
    <View style={styles.container}>
      {location && mapRef && (
        <>
          <GooglePlacesAutocomplete
            placeholder="Search for a location"
            fetchDetails={true}
            onPress={(data, details: any) => {
              // Handle the selected location data here
              console.log(data, details);
              // Update the map region with the selected location
              // For example:
              const { lat, lng } = details.geometry.location;
              mapRef?.current.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              });
            }}
            query={{
              key: "YOUR_GOOGLE_PLACES_API_KEY",
              language: "pt-BR",
            }}
          />
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            />
          </MapView>
        </>
      )}
      <View>
        {address && (
          <>
            <Text>{address.city}</Text>
            <Text>{address.country}</Text>
          </>
        )}
      </View>
    </View>
  );
}
