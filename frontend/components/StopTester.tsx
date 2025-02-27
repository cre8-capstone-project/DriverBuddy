import React, {useEffect, useState} from 'react';
import {ScrollView, Alert} from 'react-native';
import {Button, Text, Card} from '@rneui/base';
import {StopsService} from '@/services/StopsService';
import {StopsType} from '@/types/StopsType';

const StopTester = () => {
  const [stops, setStops] = useState<StopsType[]>([]);

  // Fetch stops from the database
  const fetchStops = async () => {
    try {
      const data = await StopsService.getAllStops();
      console.log(data);
      setStops(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch stops');
    }
  };

  // Add a hardcoded stop
  const addStop = async () => {
    const newStop: StopsType = {
      journeyId: 'test-journey-123',
      latitude: 49.2827,
      longitude: -123.1207,
      address: '123 Test St, Vancouver, BC',
      name: 'Test Stop',
      priceLevel: 3,
      rating: 5,
      isOrigin: true,
      isDestination: false,
    };

    try {
      await StopsService.addStop(newStop);
      fetchStops(); // Refresh list
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add stop');
    }
  };

  // Clear all stops
  const clearStops = async () => {
    try {
      await StopsService.emptyStopTable();
      setStops([]); // Reset list
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to clear stops');
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  return (
    <ScrollView style={{flex: 1, padding: 10}}>
      <Text h4 style={{marginBottom: 10, textAlign: 'center'}}>
        Stops List
      </Text>

      {stops.length > 0 ? (
        stops.map((stop, index) => (
          <Card key={index}>
            <Card.Title>{stop.name}</Card.Title>
            <Card.Divider />
            <Text>📍 Address: {stop.address}</Text>
            <Text>
              🌍 Lat: {stop.latitude}, Lng: {stop.longitude}
            </Text>
            <Text>⭐ Rating: {stop.rating}</Text>
          </Card>
        ))
      ) : (
        <Text style={{textAlign: 'center', marginVertical: 10}}>No stops available</Text>
      )}

      <Button title="Add Stop" onPress={addStop} containerStyle={{marginTop: 20}} />
      <Button
        title="Clear Stops"
        onPress={clearStops}
        buttonStyle={{backgroundColor: 'red'}}
        containerStyle={{marginTop: 10}}
      />
    </ScrollView>
  );
};

export default StopTester;
