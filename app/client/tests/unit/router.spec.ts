import router from '@/router/index';

describe('router', () => {
  const routes = router.getRoutes();

  it('defines expected routes', () => {
    expect(routes.length).toBe(2);
    expect(routes[0].name).toBe('home');
    expect(routes[0].path).toBe('/');

    expect(routes[1].name).toBe('about');
    expect(routes[1].path).toBe('/about');
  });

  it('Home route loads Home component', () => {
    expect(routes[0].components.default.name).toBe('HomeView');
  });

  it('About route loads About component', async () => {
    const component = await (routes[1].components.default as () => Promise<any>)();
    expect(component.default.name).toBe('AboutView');
    expect(component.default.components).toHaveProperty('VersionInfo');
  });
});
