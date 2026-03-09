import api from "./api";

const categoryService  = {
    getAll: () => api.get('/api/categories'),
}

export default categoryService