export function createEnvironment(backendOrigin: string, production: boolean) {
  return {
    production,
    apiUrl: backendOrigin + '/v1',
    loginUrl: backendOrigin + '/login',
  };
}
