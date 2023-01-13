const http = require('./http')
const BASE_URL = 'https://jsonplaceholder.typicode.com'

const getPosts = async ()=>{
  return await http(`${BASE_URL}/posts`)
}

const getComments = async ()=>{
  return await http(`${BASE_URL}/comments`)
}

const getUsers = async ()=>{
  return await http(`${BASE_URL}/users`)
}

module.exports = {
  getPosts,
  getComments,
  getUsers
}