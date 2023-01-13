const axios = require('axios')

const http = async (url)=>{
  const result = await axios.get(`${url}`, {
    headers: { 'access-control-allow-origin': '*' }
  }).catch(err=>{
    return err.response
  })

  if (result && result.data) {
    return {
      success: true,
      message: 'success',
      data: result.data
    }
  } else {
    // console.error(result)
    return {
      success: false,
      message: 'server error'
    }
  }
}

module.exports = http