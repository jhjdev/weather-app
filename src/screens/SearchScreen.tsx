import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as Icon from 'react-native-feather';

import { RootState } from '../store';
import Header from '../components/common/Header';
import {
  setSearchTerm,
  setSearchResults,
  addToSearchHistory,
  clearSearchResults,
  SearchResult,
  SearchHistoryItem,
  setSearchLoading,
  setSearchError,
} from '../store/slices/searchSlice';
import { searchLocations } from '../services/weatherApi';
import { getCurrentWeather } from '../services/weatherApi';

const SearchScreen: React.FC = () => {
  // Log the actual data we're working with
  const searchState = useSelector((state: RootState) => state.search);
  console.log('Search History Data:', JSON.stringify(searchState.searchHistory, null, 2));
  console.log('CURRENT REDUX STATE:', useSelector((state: RootState) => state.search));
  const dispatch = useDispatch();
  const {
    searchResults,
    searchHistory,
    isLoading,
    error,
    currentSearchTerm,
  } = useSelector((state: RootState) => state.search);
  const { currentWeather } = useSelector((state: RootState) => state.weather);

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchHistoryItem | null>(null);
  const [selectedLocationWeather, setSelectedLocationWeather] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Use the real API for location search
  useEffect(() => {
    const fetchLocations = async () => {
      if (currentSearchTerm.length > 2) {
        dispatch(setSearchLoading(true));
        try {
          console.log('Searching with term:', currentSearchTerm);
          const results = await searchLocations(currentSearchTerm);
          console.log('Raw API results:', JSON.stringify(results));
          
          dispatch(setSearchResults(results.map(item => ({
            id: item.id,
            name: item.name || 'Unknown',
            country: item.country || 'Unknown',
            lat: item.lat,
            lon: item.lon,
          }))));
          
          console.log('Dispatched results to Redux');
        } catch (error) {
          console.error('Search failed:', error);
          dispatch(setSearchError('Failed to search locations'));
        } finally {
          dispatch(setSearchLoading(false));
        }
      } else {
        dispatch(clearSearchResults());
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchLocations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentSearchTerm, dispatch]);

  const handleSearch = (text: string) => {
    dispatch(setSearchTerm(text));
  };

  // Fetch weather data for a selected location
  const fetchWeatherForLocation = useCallback(async (lat: number, lon: number) => {
    setIsLoadingWeather(true);
    setWeatherError(null);

    try {
      const weatherData = await getCurrentWeather(lat, lon);
      setSelectedLocationWeather(weatherData);
    } catch (error) {
      console.error('Error fetching weather for location:', error);
      setWeatherError('Failed to load weather data');
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Handle selecting a location from search results
  const handleSelectLocation = useCallback((location: SearchResult) => {
    console.log('Selected location details:', {
      name: location.name,
      country: location.country,
      id: location.id,
      lat: location.lat,
      lon: location.lon,
    });
    
    // Validate location data before creating history item
    if (!location.name || !location.country) {
      console.error('Invalid location data:', location);
      return;
    }

    // Add to search history with timestamp
    const historyItem: SearchHistoryItem = {
      ...location,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    console.log('Creating history item with data:', {
      name: historyItem.name,
      country: historyItem.country,
      id: historyItem.id,
      timestamp: historyItem.timestamp,
    });
    
    setSelectedLocation(historyItem);
    dispatch(addToSearchHistory(historyItem));
    dispatch(setSearchTerm(''));
    dispatch(clearSearchResults());
    Keyboard.dismiss();

    // Fetch weather for the selected location
    fetchWeatherForLocation(location.lat, location.lon);
  }, [dispatch, fetchWeatherForLocation]);

  const handleClearSearch = () => {
    dispatch(setSearchTerm(''));
    dispatch(clearSearchResults());
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectLocation(item)}
    >
      <Icon.MapPin stroke="#1565C0" width={20} height={20} />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultCountry}>{item.country}</Text>
      </View>
      <Icon.ChevronRight stroke="#C7C7CC" width={20} height={20} />
    </TouchableOpacity>
  );
  // Using direct inline styles for consistent rendering
  const LocationItem = ({ item, onPress }: { item: SearchHistoryItem; onPress: () => void }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={{
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        alignItems: 'center'
      }}
    >
      <Icon.MapPin stroke="#1565C0" width={20} height={20} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>{item.country}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <Header title="Search Location" />
        <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon.Search stroke="#8E8E93" width={20} height={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a city"
            value={currentSearchTerm}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {currentSearchTerm.length > 0 && (
            <TouchableOpacity testID="clear-search-button" onPress={handleClearSearch}>
              <Icon.X stroke="#8E8E93" width={20} height={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator testID="search-loading-indicator" size="small" color="#007AFF" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => `result-${item.id}`}
          style={styles.resultsList}
        />
      ) : (
        currentSearchTerm.length > 0 && !isLoading && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )
      )}

      {/* Weather display for selected location */}
      {selectedLocation && currentSearchTerm.length === 0 && (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.locationHeader}>
            <Text style={styles.selectedLocationName}>
              {selectedLocation.name.toUpperCase()}
            </Text>
            <Text style={styles.selectedLocationCountry}>
              {selectedLocation.country}
            </Text>
          </View>

          {isLoadingWeather ? (
            <View style={styles.weatherLoading}>
              <ActivityIndicator size="large" color="#1565C0" />
              <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
            </View>
          ) : weatherError ? (
            <View style={styles.weatherError}>
              <Icon.AlertCircle stroke="#FF3B30" width={40} height={40} />
              <Text style={styles.weatherErrorText}>{weatherError}</Text>
            </View>
          ) : selectedLocationWeather && (
            <View style={styles.weatherContainer}>
              <View style={styles.weatherMainInfo}>
                <Text style={styles.temperature}>
                  {Math.round(selectedLocationWeather.current.temperature)}°C
                </Text>
                <Text style={styles.weatherCondition}>
                  {selectedLocationWeather.current.condition.main}
                </Text>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <Icon.Droplet stroke="#1565C0" width={20} height={20} />
                  <Text style={styles.weatherDetailLabel}>Humidity</Text>
                  <Text style={styles.weatherDetailValue}>
                    {selectedLocationWeather.current.humidity}%
                  </Text>
                </View>

                <View style={styles.weatherDetailItem}>
                  <Icon.Wind stroke="#1565C0" width={20} height={20} />
                  <Text style={styles.weatherDetailLabel}>Wind</Text>
                  <Text style={styles.weatherDetailValue}>
                    {selectedLocationWeather.current.windSpeed} m/s
                  </Text>
                </View>

                <View style={styles.weatherDetailItem}>
                  <Icon.Thermometer stroke="#1565C0" width={20} height={20} />
                  <Text style={styles.weatherDetailLabel}>Feels Like</Text>
                  <Text style={styles.weatherDetailValue}>
                    {Math.round(selectedLocationWeather.current.feelsLike)}°C
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Recent Searches */}
      {currentSearchTerm.length === 0 && !selectedLocation && searchHistory.length > 0 && (
        <View style={{ margin: 16, backgroundColor: 'white', borderRadius: 8 }}>
          <Text style={{ padding: 16, fontSize: 16, fontWeight: '600', color: '#1565C0' }}>
            Recent Searches
          </Text>
          {searchHistory.slice(0, 3).map(item => (
            <LocationItem
              key={item.id}
              item={item}
              onPress={() => handleSelectLocation(item)}
            />
          ))}
        </View>
      )}

      {/* Saved Searches Modal */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ 
            backgroundColor: 'white',
            marginTop: 100,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            flex: 1 
          }}>
            <View style={{ 
              flexDirection: 'row',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5EA',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Saved Searches</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Icon.X stroke="#000" width={24} height={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchHistory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <LocationItem
                  item={item}
                  onPress={() => {
                    handleSelectLocation(item);
                    setShowHistoryModal(false);
                  }}
                />
              )}
              style={{ backgroundColor: 'white' }}
            />
          </View>
        </View>
      </Modal>

      {/* Saved Searches button moved to bottom of screen */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.savedSearchesButton}
          onPress={() => setShowHistoryModal(true)}
        >
          <Icon.BookOpen stroke="#FFFFFF" width={20} height={20} />
          <Text style={styles.savedSearchesButtonText}>Saved Searches</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    paddingTop: 16,
    borderRadius: 8,
  },
  historyItemShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginTop: 2,
    paddingLeft: 16,  // Increase from 12 to 16 for better spacing
  },
  viewAllButtonContainer: {
    justifyContent: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    height: 60,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFE5E5',
    margin: 16,
    borderRadius: 10,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  resultsList: {
    backgroundColor: '#FFFFFF',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  resultCountry: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    justifyContent: 'center',
    height: 40,
  },
  viewAllButtonText: {
    fontSize: 16,
    color: '#1565C0',
    fontWeight: '500',
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#F5F5F5', // Light grey background for header
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565C0', // Match other blue elements
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: 20,
  },
  selectedLocationContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)', // Match forecast card border
  },
  locationHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  selectedLocationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565C0',
    letterSpacing: 0.5,
  },
  selectedLocationCountry: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  weatherLoading: {
    padding: 40,
    alignItems: 'center',
  },
  weatherLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  weatherError: {
    padding: 40,
    alignItems: 'center',
  },
  weatherErrorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  weatherContainer: {
    padding: 20,
  },
  weatherMainInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  temperature: {
    fontSize: 52,
    fontWeight: '200',
    color: '#212121',
    letterSpacing: 0.25,
  },
  weatherCondition: {
    fontSize: 20,
    color: '#757575',
    marginTop: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: 'rgba(0,0,0,0.02)', // Subtle background like forecast cards
    marginLeft: -20,
    marginRight: -20,
    marginBottom: -20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  weatherDetailLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    backgroundColor: 'rgba(249, 249, 249, 0.95)',
    paddingTop: 10,
  },
  savedSearchesButton: {
    flexDirection: 'row',
    backgroundColor: '#1565C0', // Material Design blue
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  savedSearchesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
});
export default SearchScreen;

