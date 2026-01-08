import { useUserStore } from "@/stores/userStore";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue")
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue")
    },
    {
      path: "/project/:id",
      name: "project",
      component: () => import("../views/ProjectView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue")
    },
    {
      path: "/metadata/:species",
      name: "metadata",
      component: () => import("../views/MetadataView.vue"),
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();
  await userStore.getUser();

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return {
      path: "/login",
      query: { redirect: to.fullPath }
    };
  }
});

export default router;
