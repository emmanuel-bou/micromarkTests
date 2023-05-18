import {ok as assert} from 'uvu/assert'
import {factorySpace} from 'micromark-factory-space'
import {markdownLineEnding, markdownSpace} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'
import {constants} from 'micromark-util-symbol/constants.js'
import {types} from 'micromark-util-symbol/types.js'

import {header} from './header.js'

import {nameMatcher} from '../utils/name-matcher.js'
import {matchTypeUsingMatcher} from '../utils/match.js'


/** @type {Construct} */
export const admonitionContainer = {
  tokenize: tokenizeAdmonitionContainer,
  concrete: true
}

export function admonition() {
    return {
      flow: {
        [58]: [admonitionContainer]
      }
    }
  }
  
const nonLazyLine = {tokenize: tokenizeNonLazyLine, partial: true}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeAdmonitionContainer(effects, ok, nok) {
  const self = this
  const tail = self.events[self.events.length - 1]
  const initialSize =
    tail && tail[1].type === types.linePrefix
      ? tail[2].sliceSerialize(tail[1], true).length
      : 0
  let sizeOpen = 0
  let spaceBetweenColonAndName = 0;
  /** @type {Token} */
  let previous

  return start

  /** @type {State} */
  function start(code) {
    assert(code === codes.colon, 'expected `:`')
    effects.enter('admonitionContainer')
    effects.enter('admonitionContainerFence')
    effects.enter('admonitionContainerSequence')
    return sequenceOpen(code)
  }

  /** @type {State} */
  function sequenceOpen(code) {
    if (code === codes.colon) {
      console.log('sequenceOpen consume', codes.colon, sizeOpen);
      effects.consume(code);
      sizeOpen++;
      return sequenceOpen;
    }
    if (markdownSpace(code)) {
      effects.consume(code);
      spaceBetweenColonAndName++;
      return sequenceOpen;
    }
    if (sizeOpen < constants.codeFencedSequenceSizeMin) {
      return nok(code)
    }
  
    effects.exit('admonitionContainerSequence')

    return matchTypeUsingMatcher.call(
      self,
      effects,
      afterName,
      nok,
      'admonitionContainerKind',
      nameMatcher(['tip', 'warning', 'danger'])
    )(code)
  }

  /** @type {State} */
  function afterName(code) {
    return markdownSpace(code) 
        ? effects.attempt(header, afterHeader, afterHeader)(code)
        : afterHeader(code);
  }

  /** @type {State} */
  function afterHeader(code) {
      return factorySpace(effects, openAfter, types.whitespace)(code)
  }

  /** @type {State} */
  function openAfter(code) {
    effects.exit('admonitionContainerFence')

    if (code === codes.eof) {
      return afterOpening(code)
    }

    if (markdownLineEnding(code)) {
      if (self.interrupt) {
        return ok(code)
      }

      return effects.attempt(nonLazyLine, contentStart, afterOpening)(code)
    }

    return nok(code)
  }

  /** @type {State} */
  function afterOpening(code) {
    effects.exit('admonitionContainer')
    return ok(code)
  }

  /** @type {State} */
  function contentStart(code) {
    if (code === codes.eof) {
      effects.exit('admonitionContainer')
      return ok(code)
    }

    effects.enter('admonitionContainerContent')
    return lineStart(code)
  }

  /** @type {State} */
  function lineStart(code) {
    if (code === codes.eof) {
      return after(code)
    }

    return effects.attempt(
      {tokenize: tokenizeClosingFence, partial: true},
      after,
      initialSize
        ? factorySpace(effects, chunkStart, types.linePrefix, initialSize + 1)
        : chunkStart
    )(code)
  }

  /** @type {State} */
  function chunkStart(code) {
    if (code === codes.eof) {
      return after(code)
    }

    const token = effects.enter(types.chunkDocument, {
      contentType: constants.contentTypeDocument,
      previous
    })
    if (previous) previous.next = token
    previous = token
    return contentContinue(code)
  }

  /** @type {State} */
  function contentContinue(code) {
    if (code === codes.eof) {
      const t = effects.exit(types.chunkDocument)
      self.parser.lazy[t.start.line] = false
      return after(code)
    }

    if (markdownLineEnding(code)) {
      return effects.check(nonLazyLine, nonLazyLineAfter, lineAfter)(code)
    }

    effects.consume(code)
    return contentContinue
  }

  /** @type {State} */
  function nonLazyLineAfter(code) {
    effects.consume(code)
    const t = effects.exit(types.chunkDocument)
    self.parser.lazy[t.start.line] = false
    return lineStart
  }

  /** @type {State} */
  function lineAfter(code) {
    const t = effects.exit(types.chunkDocument)
    self.parser.lazy[t.start.line] = false
    return after(code)
  }

  /** @type {State} */
  function after(code) {
    effects.exit('admonitionContainerContent')
    effects.exit('admonitionContainer')
    return ok(code)
  }

  /**
   * @this {TokenizeContext}
   * @type {Tokenizer}
   */
  function tokenizeClosingFence(effects, ok, nok) {
    let size = 0

    return factorySpace(
      effects,
      closingPrefixAfter,
      types.linePrefix,
      constants.tabSize
    )

    /** @type {State} */
    function closingPrefixAfter(code) {
      effects.enter('admonitionContainerFence')
      effects.enter('admonitionContainerSequence')
      return closingSequence(code)
    }

    /** @type {State} */
    function closingSequence(code) {
      if (code === codes.colon) {
        effects.consume(code)
        size++
        return closingSequence
      }

      if (size < sizeOpen) return nok(code)
      effects.exit('admonitionContainerSequence')
      return factorySpace(effects, closingSequenceEnd, types.whitespace)(code)
    }

    /** @type {State} */
    function closingSequenceEnd(code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        effects.exit('admonitionContainerFence')
        return ok(code)
      }

      return nok(code)
    }
  }
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
//function tokenizeLabel(effects, ok, nok) {
  // Always a `[`
//  return factoryLabel(
//    effects,
//    ok,
//    nok,
//    'admonitionContainerLabel',
//    'admonitionContainerLabelMarker',
//    'admonitionContainerLabelString',
//    true
//  )
//}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenizeNonLazyLine(effects, ok, nok) {
  const self = this

  return start

  /** @type {State} */
  function start(code) {
    assert(markdownLineEnding(code), 'expected eol')
    effects.enter(types.lineEnding)
    effects.consume(code)
    effects.exit(types.lineEnding)
    return lineStart
  }

  /** @type {State} */
  function lineStart(code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code)
  }
}