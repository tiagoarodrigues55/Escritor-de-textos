

const robots = {
  input: require('./robots/input'),
  wiki: require('./robots/wiki'),
  google: require('./robots/google'),
  drive: require('./robots/drive'),
  state: require('./robots/state')
}

async function start(){
  robots.input()
  await robots.wiki()
  await robots.google()
 
  // await robots.drive()
  console.log('> ALL ROBOTS FINISH, LOOK YOUR TEXT IN GOOGLE DRIVE!')  
}

start()