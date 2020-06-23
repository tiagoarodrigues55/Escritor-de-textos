const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const algorithmia = require('algorithmia');
const {Translate} = require('@google-cloud/translate').v2;
const translate = new Translate({projectId: 'escritor-279604', key: "AIzaSyBRq01cSfllDWq7FcgikJJ1SBxqjaK2nVs"});

const state = require('./state')

var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "58a41ffc",
  application_key: "88f283d8fc1dd51a0c07830892aec182"
});

async function robot(){
  console.log('> [google-robot] Starting...')
  
  content = state.load()

  content.links = []
  content.resums = []
  content.texts = []

  await reqAllGoogle(content)
  // console.log('> [google-robot] vai sanitizar')
  // await sanitized(content)
  
  // console.log('> [google-robot] vai traduzir')



  async function reqAllGoogle(content){
    console.log('> [google-robot] Request all for google')
    for(let key of content.keywords){
      let query = `${content.tema} ${key}`
      key.link = await reqGoogle(query, content)
    }
  }

  async function reqGoogle(query, content){
    console.log('> [google-robot] Request for google')

    const response = await customSearch.cse.list({
      auth: "AIzaSyCzzz8yFhFmMAPnMK0MJuxerG-QiSQti9k",
      cx: "018134765646326113038:lb73dhsksy0",
      q: query,
      num: 1
    });
    if (!response.data.items){
      return
    }
    const link = response.data.items.map((item) => {
      return item.link;
    })
    content.link += link[0]
    content.link += ' '
    content.links.push(link[0])
    const text = await sanitized(content)
    await reqResum(text)
  }
  async function sanitized(content){
  console.log('> [google-robot] sanitizing texts')
    console.log(`> [google-robot] vai estrair o conteudo ${i}`)
     return textapi.extract({
      url: content.links[i]
    },  function(error, response) {
      if (error === null) {
        console.log('> [google-robot] teste 2');
  
      console.log(`> [google-robot] vai sanitizar o conteudo ${i}`)
      const text = sanitizeContent(response.article)
      content.texts.push(text)
      return text
       }
    });
    
    // console.log('> [google-robot] vai traduzir')
    // await translateText(content)
  }
  
  function sanitizeContent(text) {
    const withoutBlankLinesAndMarkdown = removeBlankLineAndMarkdown(text);

    return withoutBlankLinesAndMarkdown
    function removeBlankLineAndMarkdown(text) {
      const allLines = text.split('\n');

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false;
        };

        return true;
      });
      console.log(`> [google-robot] acabou de sanitizar`)

      return withoutBlankLinesAndMarkdown.join('');
    };

  };
  
 async function reqResum(content){
   if (content.texts.length >= 4){
  console.log('> [google-robot] resum texts')
  for(let text of content.texts){
  const algorithmiaAuthenticated = algorithmia( "simNlkTxJYHeQKzDiRvn5fS+PNC1");
  const linkAlgorithm = algorithmiaAuthenticated.algo("nlp/Summarizer/0.1.8?timeout=300");
  const linkResponse = await linkAlgorithm.pipe(text);
  const resumOfLink = linkResponse.get();
  content.resums.push(resumOfLink)
  }
  console.log(`> [google-robot] acabou de resumir`)

 content.text = `${content.firstParagraph}..  ${content.resums[0]}..   ${content.resums[1]}.. ${content.resums[2]}..  ${content.resums[3]}`
   }
}
async function translateText(content){
  let [translation] = await translate.translate(content.text, 'pt-br');
  content.textoFinal = translation
  state.save(content)

}
}
module.exports = robot