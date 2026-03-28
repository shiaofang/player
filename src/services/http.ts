// @ts-nocheck
import axios from 'axios';

const http = axios.create({
  baseURL: 'https://tonzhon.com/api.php',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
});

// Strip JSONP wrapper if the server ever wraps JSON in a callback
http.interceptors.response.use(response => {
  if (typeof response.data === 'string') {
    const match = (response.data as string).match(/^[^(]+\((.+)\)[\s;]*$/s);
    if (match) {
      response.data = JSON.parse(match[1]);
    }
  }
  return response;
});

export default http;

