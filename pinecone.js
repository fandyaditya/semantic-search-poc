const { PineconeClient } = require("@pinecone-database/pinecone");
const uuid = require('uuid').v4; 

const pinecone = new PineconeClient();

pinecone.init({
  environment: process.env.PINECONE_ENV,
  apiKey: process.env.PINECONE_API_KEY,
});

const upsert = async (data) => {
    const index = pinecone.Index('article');
    const { content, content_tokens, embedding } = data;

    const upsertRequest = {
        vectors: [
            {
                id: uuid(),
                values: embedding,
                metadata: {
                    content,
                    content_tokens
                }
            }
        ]
    }

    try {
        const upsertResponse = await index.upsert({ upsertRequest });
        return upsertResponse;
    }catch(err) {
        console.log(err);
        return {}
    }
   
};

const query = async (embed) => {
    const index = pinecone.Index('article');
    const queryRequest = {
        vector: embed,
        topK: 10,
        includeValues: false,
        includeMetadata: true
    }
    try {
        const response = await index.query({ queryRequest })
        return { data: response }
    }catch(err) {
        return { error: err }
    }
    
}

module.exports = {
    upsert,
    query
}