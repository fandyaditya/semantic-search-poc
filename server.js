require('dotenv').config()
const express = require('express')
const app = express();
const port = 9000;
const openAiHelper = require('./openAI');
const supabaseHelper = require('./supabase');

app.get('/', async (req, res) => {
    const { q } = req.query;

    const embedding = await openAiHelper.createEmbedding(q);

    const { data, error } = await supabaseHelper.rpc('semantic_search', {
        query_embedding: embedding,
        similiarity_threshold: 0.5,
        match_count: 5
    })

    if(error) {
        console.log(error);
        res.status(404).send({ message: `${q} doesn't match any search` });
    } else {
        res.status(200).send({...data})
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})