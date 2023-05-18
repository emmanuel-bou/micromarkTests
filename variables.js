function variableTokenize(effects, ok, nok) {
    return start
  
    function start(code) {
      effects.enter('variable')
      effects.enter('variableMarker')
      effects.consume(code)
      effects.exit('variableMarker')
      effects.enter('variableString')
      effects.enter('chunkString', {contentType: 'string'})
      return begin
    }
  
    function begin(code) {
      return code === 125 ? nok(code) : inside(code)
    }
  
    function inside(code) {
      if (code === -5 || code === -4 || code === -3 || code === null) {
        return nok(code)
      }
      if (code === 92) {
        effects.consume(code)
        return insideEscape
      }
      if (code === 125) {
        effects.exit('chunkString')
        effects.exit('variableString')
        effects.enter('variableMarker')
        effects.consume(code)
        effects.exit('variableMarker')
        effects.exit('variable')
        return ok
      }
  
      effects.consume(code)
      return inside
    }
    function insideEscape(code) {
      if (code === 92 || code === 125) {
        effects.consume(code)
        return inside
      }
      return inside(code)
    }    
}

export function variablesHtml(data = {}) {
    return {
        enter: {variableString: enterVariableString},
        exit: {variableString: exitVariableString},
    }
    function enterVariableString() {
        this.buffer()
    }
    function exitVariableString() {
        var id = this.resume()
        console.log('id', id);
        if (id in data) {
            this.raw(this.encode(data[id]))
        }
    }
}

const variableConstruct = {name: 'variable', tokenize: variableTokenize}

export const variables = {text: {123: variableConstruct}}

