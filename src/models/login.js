import { routerRedux } from 'dva/router';
import { fakeAccountLogin } from '../services/api';
import { loginAdminUser } from '../services/lmapi';
import { queryMyMenuData } from '../services/user';
import { setAuthority, setAuthorityCloud } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { getMenuData, formatterMenu } from '../common/menu';

const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};

export default {
  namespace: 'login',

  state: {
    status: undefined,
    menuData: [],
    redirectData: [],
  },

  effects: {
    *login({ payload }, { call, put }) {
      // 官方演示登录
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.status === 'ok') {
        reloadAuthorized();
        yield put({
          type: 'useExampleMenus',
        });
        yield put(routerRedux.push('/'));
      }
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/cloudlogin'));
      }
    },
    *cloudLogin({ payload }, { call, put }) {
      // 对接ljdp后端登录
      const response = yield call(loginAdminUser, payload);
      yield put({
        type: 'changeCloudLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.code === 200) {
        reloadAuthorized();

        const menuResult = yield call(queryMyMenuData);
        yield put({
          type: 'updateMenus',
          payload: menuResult,
        });

        yield put(routerRedux.push('/'));
      }
    },
  },

  reducers: {
    // 官方演示登录
    changeLoginStatus(state, { payload }) {
      setAuthorityCloud({ userAccount: '' }); // 官方演示登录的话，先退出我们的登录
      setAuthority(payload.currentAuthority);
      sessionStorage.removeItem('antd-menus');
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    // 对接ljdp后端登录
    changeCloudLoginStatus(state, { payload }) {
      setAuthorityCloud(payload.user);
      sessionStorage.removeItem('antd-menus');
      let loginstatus = '';
      if (payload.code === 200) {
        loginstatus = 'ok';
      } else {
        loginstatus = 'error';
      }
      return {
        ...state,
        status: loginstatus,
        type: payload.type,
      };
    },
    updateMenus(state, action) {
      const { payload } = action;
      const { code, menus } = payload;
      let menuData = [];
      if (code === 200) {
        menuData = formatterMenu(menus);
        // sessionStorage.setItem('antd-menus', JSON.stringify(menuData));
      }
      menuData.forEach(getRedirect);
      return {
        ...state,
        menuData,
        redirectData,
      };
    },
    useExampleMenus(state) {
      // sessionStorage.setItem('antd-menus', JSON.stringify(getMenuData()));
      getMenuData().forEach(getRedirect);
      return {
        ...state,
        menuData: getMenuData(),
        redirectData,
      };
    },
  },
};
