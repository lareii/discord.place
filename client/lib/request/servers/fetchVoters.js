import config from '@/config';
import axios from 'axios';

export default function fetchVoters(id, page, limit) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const baseURL = `${config.api.url}/servers/${id}/voters`;
    const url = new URL(baseURL);
    if (page) url.searchParams.append('page', page);
    if (limit) url.searchParams.append('limit', limit);

    try {
      const response = await axios.get(url);
      resolve(response.data);
    } catch (error) {
      reject(error instanceof axios.AxiosError ? (error.response?.data?.error || error.message) : error.message);
    }
  });
}