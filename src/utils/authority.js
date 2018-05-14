// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  return sessionStorage.getItem('antd-pro-authority') || 'notaccess';
}

export function setAuthority(authority) {
  return sessionStorage.setItem('antd-pro-authority', authority);
}
// 对接ljdp后端登录的验证
export function setAuthorityCloud(user) {
  if (user.userAccount.length > 0) {
    sessionStorage.setItem('antd-pro-authority', 'clouduser');
    sessionStorage.setItem('authority-token', user.tokenId);
    if (user.headImg != null) {
      sessionStorage.setItem('avatar-img', user.headImg);
    } else {
      sessionStorage.setItem(
        'avatar-img',
        'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
      );
    }
    sessionStorage.setItem('username', user.userName);
  } else {
    sessionStorage.removeItem('antd-pro-authority');
    sessionStorage.removeItem('authority-token');
    sessionStorage.removeItem('avatar-img');
    sessionStorage.removeItem('username');
  }
}

export function getAuthorityToken() {
  return sessionStorage.getItem('authority-token');
}
