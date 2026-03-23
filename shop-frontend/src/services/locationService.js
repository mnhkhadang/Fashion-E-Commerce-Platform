import api from './api'

const locationService = {
  // GET /locations/provinces
  getProvinces: () => api.get('/locations/provinces'),

  // GET /locations/districts?provinceCode=01
  // BE dùng @RequestParam, không phải path param
  getDistricts: (provinceCode) =>
    api.get(`/locations/districts?provinceCode=${provinceCode}`),
}

export default locationService