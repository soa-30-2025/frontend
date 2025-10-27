import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import ControlTable from '../views/ControlTable.vue';
import Blogs from '../views/Blogs.vue';
import UserProfile from '../views/UserProfile.vue';
import Tours from '../views/Tours.vue';
import AllTours from '../views/AllTours.vue';
import ShowTour from '../views/ShowTour.vue';
import TourEditor from '../views/TourEditor.vue';
import PositionSimulator from '../views/PositionSimulator.vue';
import CartView from '../views/CartView.vue';

const routes = [
    { path: '/', name: 'HomePage', component: HomePage },
    { path: '/blogs', name: 'Blogs', component: Blogs },
    { path: '/control-table', name: 'ControlTable', component: ControlTable, meta: { requiresAdmin: true } },
    { path: '/profile/:username', name: 'UserProfile', component: UserProfile },
    { path: '/tours', name: 'Tours', component: Tours },
    { path: '/position-simulator', name: 'PositionSimulator', component: PositionSimulator },
    { path: '/all-tours', name: 'AllTours', component: AllTours },
    { path: '/tour-details/:id', name: 'ShowTour', component: ShowTour },
    { path: '/create-tour', name: 'Create Tour', component: TourEditor, meta: { requiresGuide: true} },
    { path: '/tours/:tourId/edit', name: 'Edit Tour', component: TourEditor, props: true, meta: { requiresGuide: true} },
    { path: '/cart', name: 'Cart', component: CartView, meta: { requiresAuthentication: true} },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!sessionStorage.getItem('username');
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