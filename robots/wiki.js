const algorithmia = require('algorithmia');
const state = require('./state')
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const nlu = new NaturalLanguageUnderstandingV1({
  version: '2018-04-05',
  authenticator: new IamAuthenticator({
    apikey: "vgF0eEdR_P63FCGzv2Wk1bvvnVizjfOsblch1iPcHJSq",
  }),
  url: "https://api.eu-gb.natural-language-understanding.watson.cloud.ibm.com/instances/e2cf3d1d-1935-417c-a09c-f7df690ab5f6",
});

async function robot(){
  console.log('> [wiki-robot] Starting...');
  const content = state.load();

  await reqWiki(content)
  sanitize(content)
  await reqKeyWordOfSentences(content)

  state.save(content)


  async function reqWiki(content){
  console.log('> [wiki-robot] Request from wiki...');

  const algorithmiaAuthenticated = algorithmia( "simNlkTxJYHeQKzDiRvn5fS+PNC1");
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
  const wikipediaResponse = await wikipediaAlgorithm.pipe(content.tema);
  const wikipediaContent = wikipediaResponse.get();
  
  content.sourceContentOriginal = wikipediaContent.content;
  console.log('> [wiki-robot] Fetching done!');
  }
  function sanitize(content) {
    console.log('> [wiki-robot] Starting sanitize...')
    const firstParagraphLimit = content.sourceContentOriginal.indexOf("\n")
    content.firstParagraph = content.sourceContentOriginal.slice(0, firstParagraphLimit)
  };
  async function reqKeyWordOfSentences(content){
    console.log('> [wiki-robot] Starting request of the keyWords...')
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: content.firstParagraph,
        features: {
          keywords: {limit: 4}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        };
        const keywords = response.result.keywords.map((keyword) => {
          return keyword.text
        });
        content.keywords = keywords
        console.log('> [wiki-robot] Finish!')
        resolve(keywords);
      });
    });
  }

  

}

module.exports = robot