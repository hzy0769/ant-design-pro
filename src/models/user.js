import { query as queryUsers, queryCurrent } from '../services/user';
import { getAuthority } from '../utils/authority';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const currentAuthority = getAuthority();
      if (currentAuthority === 'clouduser') {
        yield put({
          type: 'saveCurrentUser',
          payload: {
            name: sessionStorage.getItem('username'),
            avatar: sessionStorage.getItem('avatar-img'),
            notifyCount: 0,
          },
        });
      } else {
        const response = yield call(queryCurrent);
        yield put({
          type: 'saveCurrentUser',
          payload: response,
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
