import {markdownLineEnding, markdownSpace} from 'micromark-util-character';

export const header = {tokenize: tokenizeHeader, partial: true};

function tokenizeHeader(effects, ok, nok) {
    let previous;
    return start;
  
    function start(code) {
        if (markdownSpace(code)) {
            effects.consume(code);
            return start;
        }
        if (!markdownLineEnding(code)) {
            effects.enter('admonitionContainerHeader');

            const token = effects.enter('chunkText', {
                contentType: 'text',
                previous
            });
            if (previous) previous.next = token;
            previous = token;

            effects.consume(code);
            return name;
        }
        return ok(code);
    }
  
    function name(code) {
        if (!markdownLineEnding(code)) {
            effects.consume(code)
            return name
        }
        effects.exit('chunkText');
        effects.exit('admonitionContainerHeader');
        return ok(code);
    }
}