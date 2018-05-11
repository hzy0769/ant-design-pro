// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  return sessionStorage.getItem('antd-pro-authority') || 'noauth';
}

export function setAuthority(authority) {
  return sessionStorage.setItem('antd-pro-authority', authority);
}
