const readline = require('readline-sync')
const state = require('./state');


function robot(){
  const content = {}
  

  content.tema = reqTema()
  content.prefix = 'What is'
  state.save(content)


  function reqTema(){
    return readline.question('Tema: ')
  }
  
}
module.exports = robot