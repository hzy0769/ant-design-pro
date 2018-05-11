// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  return sessionStorage.getItem('antd-pro-authority') || 'notaccess';
}

export function setAuthority(authority) {
  return sessionStorage.setItem('antd-pro-authority', authority);
}
// 对接ljdp后端登录的验证
export function setAuthorityCloud(user) {
  sessionStorage.setItem('antd-pro-authority', 'clouduser');
  sessionStorage.setItem('tokenid', user.tokenId);
  sessionStorage.setItem('avatar-img', user.headImg);
}
