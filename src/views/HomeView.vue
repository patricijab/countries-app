<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useCountriesStore } from '@/stores/countries'

// store
const store = useCountriesStore()

// data
const loading = ref(true)
const searchQuery = ref('')
const chosenRegion = ref('')
const error = ref(false)
const countries = reactive({
  filtered: []
})
const currentPage = ref(1)

const pagesNo = computed(() => {
    return Math.ceil(countries.filtered.length / store.resultsPerPage) 
  })

const paginatedCountries = computed(() => {
  const startingIndex = (currentPage.value - 1) * store.resultsPerPage
  const endingIndex = (currentPage.value) * store.resultsPerPage
  return countries.filtered.slice(startingIndex, endingIndex)
})

function filterCountries() {
  let result = []

  // filter by search
  if (searchQuery.value !== '') {
    result = store.countries.filter((country) => country.name.common.toLowerCase().includes(searchQuery.value.toLowerCase()))
  } else {
    result = store.countries
  }

  // filter by region
  if (chosenRegion.value !== '') {
    result = result.filter((country) => country.region === chosenRegion.value)
  } else {
    result = result
  }
  
  // set results and reset currentPage
  countries.filtered = result
  currentPage.value = 1
}

function showPage(pageNo) {
  currentPage.value = pageNo
}

function addToFavorites(countryName) {
  if (!store.favoriteCountries.includes(countryName)) {
    store.favoriteCountries.push(countryName)
  }
}

onMounted(async () => {
  const { success } = await store.getData()

  if (success) {
    countries.filtered = store.countries
  } else {
    error.value = true
  }

  loading.value = false
});


</script>

<template>
  <main>
    <h1>Countries</h1>
    <div class="filters">
      <input v-model="searchQuery" placeholder="search ..." @keyup="filterCountries">
      <select @change="filterCountries" v-model="chosenRegion">
        <option value="">All</option>
        <option v-for="region in store.regions" :value="region">
          {{ region }}
        </option>
      </select>
    </div>
    <div class="results">
      <ul>
        <li v-for="country in paginatedCountries">
          <h2 :class="{'favorite': store.favoriteCountries.includes(country.name.common) }">{{ country.name.common }} {{ country.flag }}</h2>
          <p><strong>Population:</strong> {{ country.population }}, <strong>Region:</strong> {{ country.region }}</p>
          <button @click="addToFavorites(country.name.common)">Add to favorites</button>
        </li>
      </ul>
      <div v-if="paginatedCountries.length > 0" class="pagination">
        <button @click="showPage(1)" :class="{'active': currentPage == 1}">1</button>
        <span v-if="currentPage > 3">...</span>
        <button v-if="currentPage > 2" @click="showPage(currentPage - 1)">{{ currentPage - 1 }}</button>
        <span v-if="currentPage > 1 && currentPage < pagesNo" class="active">{{ currentPage }}</span>
        <button v-if="pagesNo > currentPage + 1" @click="showPage(currentPage + 1)">{{ currentPage + 1 }}</button>
        <span v-if="pagesNo - currentPage > 2">...</span>
        <button v-if="pagesNo > 1" @click="showPage(pagesNo)" :class="{'active': currentPage == pagesNo}">{{ pagesNo }}</button>
      </div>
    </div>
    <div class="loading" v-if="loading">loading...</div>
    <div class="no-results" v-if="!loading && !error && paginatedCountries.length === 0">
      No results.
    </div>
    <div class="no-results" v-if="!loading && error">
      There was an error.
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 992px;
  margin: 0 auto;
}

h1 {
  margin-top: 40px;
  margin-bottom: 20px;
}

h2.favorite {
  font-weight: 700;
  color: cornflowerblue;
}

.filters {
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

strong {
  font-weight: 700;
}

.pagination {
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagination button {
  border: 0;
  background-color: transparent;
  cursor: pointer;
}

.pagination .active {
  font-weight: 700;
}

.pagination button, span {
  font-size: 16px;
  padding: 10px;
}
</style>
