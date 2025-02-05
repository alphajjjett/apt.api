const axios = require('axios');

exports.notifyLine = async (token, message) => {
    try {
        const response = await axios({
            method: "POST",
            url: "https://notify-api.line.me/api/notify",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`, 
            },
            data: new URLSearchParams({ message }), 
        });
        console.log('notify response', response.data);
    } catch (err) {
        console.log('Error in notifyLine:', err);
    }
};
