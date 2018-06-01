import { stringify } from 'qs';
import request from '../utils/request';

// 查询静态数据字典
export async function getSysCodeDict(codetype) {
  return request(`/api/framework/sys/code/list?codetype=` + codetype);
}
export async function searchAdminUser(params) {
  return request(`/api/admin/user/sysUser/search?${stringify(params)}`);
}
export async function getAdminUser(params) {
  return request(`/api/admin/user/sysUser/` + params);
}
export async function saveAdminUser(params) {
  return request(`/api/admin/user/sysUser`, {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded;',
    body: params,
  });
}
export async function removeAdminUser(params) {
  return request(`/api/admin/user/sysUser/remove`, {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded;',
    body: params,
  });
}
export async function loginAdminUser(params) {
  return request(`/api/admin/user/sysUser/login`, {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded;',
    body: params,
  });
}
export async function ljdpFileBatchProcess(params) {
  return request(`/api/ljdp/filebatch/process.act`, {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded;',
    body: params,
  });
}
