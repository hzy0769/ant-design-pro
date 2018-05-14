import { routerRedux } from 'dva/router';
import { fakeAccountLogin } from '../services/api';
import { loginAdminUser } from '../services/lmapi';
import { setAuthority, setAuthorityCloud } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
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
        yield put(routerRedux.push('/'));
      }
    },
  },

  reducers: {
    // 官方演示登录
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      setAuthorityCloud({ userAccount: '' }); // 官方演示登录的话，退出我们的登录
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    // 对接ljdp后端登录
    changeCloudLoginStatus(state, { payload }) {
      setAuthorityCloud(payload.user);
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
  },
};
