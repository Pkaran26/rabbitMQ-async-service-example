const http = require('./http')
const BASE_URL = 'https://jsonplaceholder.typicode.com'

const getPosts = async ()=>{
  return await http(`${BASE_URL}/posts`)
}

const getPostDetail = async (payload)=>{
  return await http(`${BASE_URL}/posts/${payload.params.id}`)
}

const getPostComments = async (payload)=>{
  return await http(`${BASE_URL}/posts/${payload.params.id}/comments`)
}

const getComments = async ()=>{
  return await http(`${BASE_URL}/comments`)
}

const getUsers = async ()=>{
  return await http(`${BASE_URL}/users`)
}

module.exports = {
  'getPosts': getPosts,
  'getPostDetail': getPostDetail,
  'getPostComments': getPostComments,
  'getComments': getComments,
  'getUsers': getUsers
}