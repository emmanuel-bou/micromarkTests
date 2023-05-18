import {markdownSpace, markdownLineEnding} from 'micromark-util-character'

/**
 * @this {TokenizeContext}
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {string} type
 */
export function matchTypeUsingMatcher(effects, ok, nok, type, matcher) {
  return start;

  /** @type {State} */
  function start(code) {
    if (matcher(code)) {
      effects.enter(type);
      effects.consume(code);
      return name;
    }
    return nok(code);
  }

  /** @type {State} */
  function name(code) {
    if (matcher(code)) {
      effects.consume(code);
      return name;
    }
    effects.exit(type);
    return markdownSpace(code) || markdownLineEnding(code) ? ok(code) : nok(code);
  }
}