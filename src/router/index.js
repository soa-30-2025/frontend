import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ControlTable from '../views/ControlTable.vue';

const routes = [
    { path: '/', name: 'HomePage', component: HomePage },
    { path: '/control-table', name: 'ControlTable', component: ControlTable, meta: { requiresAdmin: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');

    if (to.meta.requiresAuthentication) {
        if(isLoggedIn && role === "tourist")
            next();
        else{
            alert("Access denied.");
            next('/');
        }
    } else if (to.meta.requiresAdmin) {
        if (role === "admin") {
            next();
        } else {
            alert("Access denied.");
            next('/');
        }
    }else if (to.meta.requiresGuide) {
        if (role === "guide") {
            next();
        } else {
            alert("Access denied.");
            next('/');
        } 
    }else {
        next();
    }
});

export default router;