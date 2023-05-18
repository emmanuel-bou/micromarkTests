export const admonitionFromMarkdown = {
    enter: {
        admonitionContainer: enterContainer,
        admonitionContainerKind: enterContainerKind,
        admonitionContainerHeader: enterContainerHeader
    },
    exit: {
        admonitionContainer: exit,
        admonitionContainerKind: exitContainerKind,
        admonitionContainerHeader: exitContainerHeader,
    }
  }

  function enterContainer(token) {
    enter.call(this, 'admonitionDirective', token)
  }

  function enterContainerKind(token) {
  }

  function enterContainerHeader(token) {
    this.enter(
        {type: 'header', data: {admonitionHeader: true}, children: []},
        token
      )
  }

  function enter(type, token) {
    this.enter({type, kind: '', children: []}, token)
  }
  
  function exit(token) {
    this.exit(token)
  }

  function exitContainerKind(token) {
    const node = this.stack[this.stack.length - 1];
    node.kind = this.sliceSerialize(token);
  }

  function exitContainerHeader(token) {
    this.exit(token)
  }