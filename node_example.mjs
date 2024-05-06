import OobaAPI from './ooba.mjs'
const api = await OobaAPI({url:'http://localhost:5000'})

const prompt = "In order to make homemade bread, follow these steps:\n1)"

process.stdout.write(prompt)

let question = api['/v1/completions'].POST({prompt,stream:true})
question.ontext = text => process.stdout.write(text)

let answer = await question

console.log(`\n\nthe text generated was: \n${answer.text}`)
