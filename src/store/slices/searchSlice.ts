import {createSlice, PayloadAction, Action} from '@reduxjs/toolkit';
import {REHYDRATE} from 'redux-persist';
import {PersistPartial} from 'redux-persist/es/persistReducer';
// Search Result Interface (for location autocomplete)
export interface SearchResult {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// Search History Item Interface
export interface SearchHistoryItem extends SearchResult {
  timestamp: number;
}

// Type guard for SearchHistoryItem
export const isValidSearchHistoryItem = (item: any): item is SearchHistoryItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.country === 'string' &&
    typeof item.lat === 'number' &&
    typeof item.lon === 'number' &&
    typeof item.timestamp === 'number'
  );
};

// Search State Interface
export interface SearchState {
  searchHistory: SearchHistoryItem[];
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  currentSearchTerm: string;
}

// Type for the redux-persist REHYDRATE action payload
interface RehydrateAction extends Action<typeof REHYDRATE> {
  payload?: {
    search?: SearchState & PersistPartial;
    [key: string]: any;
  };
}

// Initial State
const initialState: SearchState = {
  searchHistory: [],
  searchResults: [],
  isLoading: false,
  error: null,
  currentSearchTerm: '',
};

// Search Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Set search term
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.currentSearchTerm = action.payload;
    },

    // Search results reducers
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
      state.error = null;
    },
    clearSearchResults: state => {
      state.searchResults = [];
    },

    // Search history reducers
    addToSearchHistory: (state, action: PayloadAction<SearchResult>) => {
      if (!action.payload.name || !action.payload.country) {
        return;
      }

      const newItem = {
        id: action.payload.id,
        name: action.payload.name,
        country: action.payload.country,
        lat: action.payload.lat,
        lon: action.payload.lon,
        timestamp: Date.now(),
      };

      // Remove old entry and add new one at the start
      state.searchHistory = [
        newItem,
        ...state.searchHistory.filter(x => x.id !== newItem.id),
      ].slice(0, 10);
    },
    clearSearchHistory: state => {
      state.searchHistory = [];
    },
  },
  extraReducers: builder => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      // Log the rehydrated data
      console.log('Rehydrating search state:', action.payload?.search);

      // If we have rehydrated data, validate it
      if (action.payload?.search?.searchHistory) {
        const validatedHistory = action.payload.search.searchHistory.filter(
          (item: any) => {
            const isValid = isValidSearchHistoryItem(item);

            if (!isValid) {
              console.warn(
                'Invalid history item found during rehydration:',
                item,
              );
            }
            return isValid;
          },
        );

        console.log('Validated history after rehydration:', validatedHistory);
        state.searchHistory = validatedHistory;
      }
    });
  },
});
export const {
  setSearchTerm,
  setSearchLoading,
  setSearchError,
  setSearchResults,
  clearSearchResults,
  addToSearchHistory,
  clearSearchHistory,
} = searchSlice.actions;

export default searchSlice.reducer;
