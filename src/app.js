const dotenv = require('dotenv')
const createServer = require('./Infrastructures/http/createServer')
const container = require('./Infrastructures/container')

dotenv.config()
;(async () => {
  const server = await createServer(container)
  await server.start()
  console.log(`server start at ${server.info.uri}`)
})()
