import api from './api'

const locationService =  {
    getProvince: () => api.get('/api/locations/provinces'),
    getDistricts: (provinceCode) => api.get(`/api/locations/districts?provinceCode=${provinceCode}`),
}


export default locationService