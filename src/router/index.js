import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Categories from '../components/goods/GoodsCate'
import Params from '../components/goods/GoodsParams'
import GoodsList from '../components/goods/GoodsList'
import AddGoods from '../components/goods/AddGoods'
import Order from '../components/order/Order'
import Fund from '../components/fund/Fund'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/Manager',
        component: Users
      },
      {
        path: '/Permission',
        component: Rights
      },
      {
        path: '/Role',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/glist',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: AddGoods
      },
      {
        path: '/order',
        component: Order
      },
      {
        path: '/fund',
        component: Fund
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
