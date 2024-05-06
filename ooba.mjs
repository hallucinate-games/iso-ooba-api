import OpenAPI from 'openapi-autowrapper'

const parse_chunk = chunk => {
  let route = chunk[0]
  if (route == ':') {
    return {comment:chunk}
  } else if (route == 'd') {
    try {
      const parsed = JSON.parse(chunk.slice(5))
      return parsed
    } catch (error) {
      return {error,chunk}
    }
  } else if (route == 'e') {
    return {event:chunk}
  } else {
    return {error:chunk}
  }
}

const streaming_POST = (url, params) => { 
  //TODO at some point perhaps implement "addEventListener" ?
  //let listeners = {}
  let completion = new Promise(async res => {
    const response = await fetch(url+'/v1/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(params),
    })
    const raw_chunks = []
    let completion_text = ''
    const decoder = new TextDecoder()
    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        res({text: completion_text, raw_chunks})
        return
      }
      const decoded_chunk = decoder.decode(value)
      const chunks = decoded_chunk
        .split('\n')
        .filter(a => a.length && a !== '\r')
        .map(parse_chunk)
        .forEach(chunk => {
          raw_chunks.push(chunk)

          //listeners?.chunk?.forEach(listener => listener(chunk))
          completion?.onchunk?.(chunk)

          const text = chunk?.choices?.[0]?.text
          if (text) {
            //listeners?.text?.forEach(listener => listener(text))
            completion?.ontext?.(text)

            completion_text += text
          }
        })
    }
  })
  return completion
}

let OobaAPI = async (...args) => {
  let api = await OpenAPI(...args)

  if (api['/v1/completions']?.POST) {
    const vanilla_POST = api['/v1/completions'].POST
    const POST = params => {
      if (!params.stream) {
        return vanilla_POST(params)
      } else {
        return streaming_POST(api.url, params)
      }
    }

    Object.assign(POST, vanilla_POST)

    api['/v1/completions'].POST = POST
  }

  return api
}

export default OobaAPI
