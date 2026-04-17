const { asyncHandler, sendSuccess } = require('../../utils/response');
const chatbotService = require('./chatbot.service');

const chat = asyncHandler(async (req, res) => {
  const { message, history, sessionId, storeHistory } = req.body || {};
  const data = await chatbotService.askCareerMentor(req.user, message, history, {
    sessionId,
    storeHistory,
  });
  return sendSuccess(res, data);
});

module.exports = {
  chat,
};
