# iso-ooba-api
This is an oobabooga api wrapper that works the same in node and in the browser. It's a thin wrapper atop [openapi-autowrapper](https://www.npmjs.com/package/openapi-autowrapper) with some additional sauce to enable token streaming on the `v1/completions` endpoint.

## Usage
n.b. API mode must be enabled when [launching ooba](https://github.com/oobabooga/text-generation-webui#api) by using `--api`
For general usage as well as self-documentation help see the docs for [openapi-autowrapper](https://www.npmjs.com/package/openapi-autowrapper). Oobabooga uses FastAPI which self documents at http://localhost:5000/docs by default, all the endpoints there are available through this wrapper. The most notable/useful part of this package is some additional code that implements token streaming via SSE on the `v1/completions` endpoint. See below:

```js
import ooba from 'iso-ooba-api'

const api = await ooba('http://localhost:5000')

const prompt = "In order to make homemade bread, follow these steps:\n1)"

process.stdout.write(prompt)

//if stream is true, calls to POST expose two additional callbacks .ontext and .onchunk
//the former returns the strings as they come out of the LLM and the latter returns the full JSON responses from ooba

let question = api['/v1/completions'].POST({prompt,stream:true})
question.ontext = text => process.stdout.write(text)

//question is *also* a promise that will resolve when generation finishes.
let answer = await question
//generate text
console.log(question.text)
```
