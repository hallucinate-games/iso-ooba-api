import ooba from './oobapi-stream.mjs'

const api = ooba()

const prompt = "[INST]In order to make homemade bread, follow these steps:[/INST]\n)"

let response_complete = false
process.stdout.write(prompt)
api.ontoken = token => process.stdout.write(token)
api.onend = () => response_complete = true
api.onerror = () => response_complete = true

api.generate(prompt)

const delay = ms => new Promise(res => setTimeout(res, ms))

while (!response_complete) {
  await delay(100)
}
