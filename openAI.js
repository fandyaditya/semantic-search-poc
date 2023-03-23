require('dotenv').config()
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openAi = new OpenAIApi(configuration);

const createEmbedding = async (input) => {
    const embeddingRes = await openAi.createEmbedding({
        model: 'text-embedding-ada-002',
        input: input
    });

    const [{embedding}] = embeddingRes.data.data;
    return embedding
}

module.exports = {
    createEmbedding
}