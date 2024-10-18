export const base64UrlEncode = (value) => {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const base64UrlDecode = (value) => {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'))
}
