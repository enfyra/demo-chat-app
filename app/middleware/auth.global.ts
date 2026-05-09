export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth();
  const isPublicRoute = to.path === '/login' || to.path === '/how-it-works';

  if (isPublicRoute) {
    return;
  }

  if (!user.value) {
    await fetchUser();
  }

  if (to.path === '/') {
    return navigateTo(user.value ? '/chat' : '/login');
  }

  if (!user.value) {
    return navigateTo('/login');
  }
});
