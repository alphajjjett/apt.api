const axios = require('axios');
const lineUserId = process.env.LINE_USER_ID;

exports.pushMessage = async (channelAccessToken, messages) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.line.me/v2/bot/message/push',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      data: {
        to: lineUserId, 
        messages,
      },
    });
    console.log('Push message response:', response.data);
  } catch (err) {
    console.error('Error in pushMessage:', err.response ? err.response.data : err);
  }
};
