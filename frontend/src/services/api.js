import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'acneguard_token';

// Base Axios instance
export const go = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// Authenticated Axios instance
export const F0 = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// Inject auth token interceptor for F0
F0.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service calls
export const loginUser = async (credentials) => {
  const response = await go.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await go.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await go.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await go.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, new_password) => {
  const response = await go.post('/auth/reset-password', { token, new_password });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await F0.put('/auth/profile', profileData);
  return response.data;
};

// Skin Assessment Service calls
export const analyzeSkin = async (imageFileOrBlob, userRoutine = null) => {
  const formData = new FormData();
  
  // Convert blob/dataURL to file if necessary
  let fileToUpload = imageFileOrBlob;
  if (typeof imageFileOrBlob === 'string' && imageFileOrBlob.startsWith('data:')) {
    fileToUpload = dataURLtoFile(imageFileOrBlob, 'face_capture.jpg');
  }

  formData.append('file', fileToUpload);
  if (userRoutine) {
    formData.append('user_routine', JSON.stringify(userRoutine));
  }

  const response = await F0.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAssessments = async () => {
  const response = await F0.get('/assessments');
  return response.data;
};

export const deleteAssessment = async (id) => {
  const response = await F0.delete(`/assessments/${id}`);
  return response.data;
};

// Diet risk prediction Service calls
export const predictDiet = async (dietData) => {
  const response = await F0.post('/diet/predict', dietData);
  return response.data;
};

// Utility to convert DataURL to File object for webcam uploads
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
