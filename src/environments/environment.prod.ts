const basePublicUrl = 'https://api.beltza.eus/api';
const baseUrl = 'https://api.beltza.eus';

export const environment = {
  production: true,
  apiUrl: basePublicUrl,
  api: {
    login: `${baseUrl}/login`,
    subject: `${basePublicUrl}/subjects`,
    course: `${basePublicUrl}/courses`,
    unit: `${basePublicUrl}/units`,
    exercise: `${basePublicUrl}/exercises`,
    user: `${basePublicUrl}/users`,
  },
};
