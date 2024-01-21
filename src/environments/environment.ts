// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const basePublicUrl = 'http://127.0.0.1:8000/api';
const baseUrl = 'http://127.0.0.1:8000';

export const environment = {
  production: false,
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
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
