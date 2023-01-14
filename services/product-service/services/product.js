const http = require('./http')

const BASE_URL = 'https://dummyjson.com'

const getProducts = async ()=>{
  return await http(`${BASE_URL}/products`)
}

module.exports = {
  'getProducts': getProducts
}