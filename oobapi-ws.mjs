import http from 'http'
//default options from https://github.com/oobabooga/text-generation-webui/blob/main/api-example-stream.py
const default_options = {
  model: "unsloth_mistral-7b-instruct-v0.2-bnb-4bit",
  prompt: "[INST]In five sentences or less, explain what buffer solutions are and how they are relevant to biology.[/INST]",
  best_of: 1,
  echo: false,
  frequency_penalty: 0,
  logit_bias: {},
  logprobs: 0,
  max_tokens: 250,
  n: 1,
  presence_penalty: 0,
  stream: true,
  suffix: "",
  temperature: 1,
  top_p: 1,
  min_p: 0,
  dynamic_temperature: false,
  dynatemp_low: 1,
  dynatemp_high: 1,
  dynatemp_exponent: 1,
  smoothing_factor: 0,
  smoothing_curve: 1,
  stop: [],
  top_k: 0,
  repetition_penalty: 1,
  repetition_penalty_range: 1024,
  typical_p: 1,
  tfs: 1,
  top_a: 0,
  epsilon_cutoff: 0,
  eta_cutoff: 0,
  guidance_scale: 1,
  negative_prompt: "",
  penalty_alpha: 0,
  mirostat_mode: 0,
  mirostat_tau: 5,
  mirostat_eta: 0.1,
  temperature_last: false,
  do_sample: true,
  seed: -1,
  encoder_repetition_penalty: 1,
  no_repeat_ngram_size: 0,
  min_length: 0,
  num_beams: 1,
  length_penalty: 1,
  early_stopping: false,
  truncation_length: 0,
  max_tokens_second: 0,
  prompt_lookup_num_tokens: 0,
  custom_token_bans: "",
  sampler_priority: [],
  ban_eos_token: false,
  add_bos_token: true,
  skip_special_tokens: true,
  grammar_string: ""
}

const api = ({host='127.0.0.1', port=5000}={}, parameters=default_options) => {
  const URI = `http://${host}:${port}/v1/completions`


  let api = {parameters}
  api.generate = prompt => {
    // check for string prompt and wrap in an object
    if (typeof prompt === 'string') prompt = {prompt}
    const postData = JSON.stringify(Object.assign({},api.parameters, prompt))
    const http_options = {
      hostname: host,
      port,
      path: '/v1/completions',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = http.request(http_options, (res) => {
      res.setEncoding('utf8')

      res.on('data', (chunk) => {
        // Remove the 'data:' prefix from the chunk
        const parsed = JSON.parse(chunk.slice(5))
        // TODO: handle multiples choices when n != 1
        const response = parsed.choices[0]
        if (response.finish_reason == null) {
          api.ontoken?.(response.text)
          api.debugstream?.(parsed)
        } else {
          api.onend?.(parsed)
        }
      })
    })

    req.on('error', (error) => {
      api.onerror?.({error})
      console.error("Request error:", error)
    })

    req.write(postData)
    req.end()
  }
  return api
}

export default api
