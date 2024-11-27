import axios from 'axios';

const URL = import.meta.env.VITE_SERVER_URL

export const api = axios.create({
   baseURL: URL,
})

export const getRooms = async () => {
   const response = await api.get('/api/rooms')
   return response.data
}