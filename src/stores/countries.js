import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

export const useCountriesStore = defineStore('countries', () => {
  const apiUrl = 'https://restcountries.com/v3.1/all'
  const resultsPerPage = 10
  
  const countries = ref([])
  const regions = computed(() => {
    const regionsArray = countries.value.map((country) => country.region)
    // return set so we get unique values
    return [...new Set(regionsArray)]
  })

  const favoriteCountriesFromStoreString = localStorage.getItem("favoriteCountries")
  const favoriteCountriesFromStore = favoriteCountriesFromStoreString ? JSON.parse(favoriteCountriesFromStoreString) : []
  const favoriteCountries = ref(favoriteCountriesFromStore)

  // call rest countries api
  async function getData() {
    try {
      const { status, data } = await axios.get(apiUrl)
      // successful request
      if (status === 200) {
        countries.value.push(...data)
        return {
          success: true,
        };
      } else {
        throw new Error('Error');
      }
    } catch {
      return {
        success: false,
      };
    }
  }

  return { regions, countries, getData, resultsPerPage, favoriteCountries }
})
