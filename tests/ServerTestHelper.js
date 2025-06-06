/* eslint-disable max-len */
/* istanbul ignore file */
const ServerTestHelper = {
    async getAccessTokenAndUserIdHelper({ server, username = 'pikk123' }) {
      const userPayload = {
        username,
        password: 'secret',
      };
  
      const responseUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...userPayload,
          fullname: 'pikk122',
        },
      });
  
      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
  
      const responseJson = JSON.parse(responseUser.payload)
      const { id: userId } = responseJson.data.addedUser;
      const { accessToken } = JSON.parse(responseAuth.payload).data;
      return { userId, accessToken };
    },
  };
  
  module.exports = ServerTestHelper;