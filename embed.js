const { encode } = require('gpt-3-encoder');
const fs = require('fs');
const CHUNK_LIMIT = 200;
const CHUNK_MINIMAL = 100;
const openAiHelper = require('./openAI');
const supabaseHelper = require('./supabase');
const pineConeHelper = require('./pinecone');

const chunkArticle = (article) => {
    let articleTextChunks = [];

    if (encode(article).length > CHUNK_LIMIT) {
        const split = article.split(". ");
        let chunkText = "";

        for (let i = 0; i < split.length; i++) {
            const sentence = split[i];
            const sentenceTokenLength = encode(sentence);
            const chunkTextTokenLength = encode(chunkText).length;

            if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_LIMIT) {
                articleTextChunks.push(chunkText);
                chunkText = "";
            }

            if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
                chunkText += sentence + ". ";
            } else {
                chunkText += sentence + " ";
            }
        }

        articleTextChunks.push(chunkText.trim());
    } else {
        articleTextChunks.push(article.trim());
    }

    const articleChunks = articleTextChunks.map((text) => {
        const trimmedText = text.trim();

        const chunk = {
            content: trimmedText,
            content_length: trimmedText.length,
            content_tokens: encode(trimmedText).length,
            embedding: []
        };

        return chunk;
    });

    if (articleChunks.length > 1) {
        for (let i = 0; i < articleChunks.length; i++) {
            const chunk = articleChunks[i];
            const prevChunk = articleChunks[i - 1];

            if (chunk.content_tokens < CHUNK_MINIMAL && prevChunk) {
                prevChunk.content += " " + chunk.content;
                prevChunk.content_length += chunk.content_length;
                prevChunk.content_tokens += chunk.content_tokens;
                articleChunks.splice(i, 1);
                i--;
            }
        }
    }

    const chunkedSection = [
        ...articleChunks
    ];

    return chunkedSection;
};

(async () => {
    const article = await fs.readFileSync('article.txt', { encoding: 'utf8' });
    const chunkedArticles = await chunkArticle(article);

    for(let i = 0 ; i < chunkedArticles.length ; i++) {
        const embedding = await openAiHelper.createEmbedding(chunkedArticles[i].content);
        const result = await pineConeHelper.upsert({ 
            content: chunkedArticles[i].content,
            content_tokens: chunkedArticles[i].content_tokens,
            embedding
        });

        // const { data,error } = await supabaseHelper
        //     .from('semantic_search_poc')
        //     .insert({
        //         content: chunkedArticles[i].content,
        //         content_tokens: chunkedArticles[i].content_tokens,
        //         embedding
        // })
        
        setTimeout(() => {}, 500)
    }
})()

