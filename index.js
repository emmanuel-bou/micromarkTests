import {promises as fs} from 'node:fs'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {directive} from 'micromark-extension-directive'
import {directiveFromMarkdown, directiveToMarkdown} from 'mdast-util-directive'

import {variables, variablesHtml} from './variables.js'
import {admonition} from './micromark-plugins/admonition/container.js'
import {admonitionFromMarkdown} from './mdast-plugins/admonition/mdast-util-admonition.js'


main()

async function main() {
  const doc = await fs.readFile('example.md')
  //const html = variablesHtml({planet: 'terre', 'pla}net': 'pluton'})
  //const out = micromark(doc, {extensions: [variables], htmlExtensions: [html]})
  //console.log(out)

  const tree = fromMarkdown(doc, {
    extensions: [directive(), admonition()],
    mdastExtensions: [directiveFromMarkdown, admonitionFromMarkdown]
  })

  console.log(JSON.stringify(tree, undefined, '\t'))

  // const out = toMarkdown(tree, {extensions: [directiveToMarkdown]})
  // console.log('------------ To markdown ------------')
  // console.log(out)
}