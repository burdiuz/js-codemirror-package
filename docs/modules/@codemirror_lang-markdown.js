async function moduleInitFunction(require,exports={}){function mkLang(parser){return new language.Language(data,parser,parser.nodeSet.types.find(t=>"Document"==t.name))}/// Language support for strict CommonMark.
function getCodeParser(languages,defaultLanguage){return info=>{let found=info&&language.LanguageDescription.matchLanguageName(languages,info,!0);return found?found.support?found.support.language.parser:language.ParseContext.getSkippingParser(found.load()):defaultLanguage?defaultLanguage.parser:null}}function nodeStart(node,doc){return doc.sliceString(node.from,node.from+50)}function getContext(node,line,doc){let nodes=[];for(let cur=node;cur&&"Document"!=cur.name;cur=cur.parent)("ListItem"==cur.name||"Blockquote"==cur.name)&&nodes.push(cur);let context=[],pos=0;for(let i=nodes.length-1;0<=i;i--){let match,node=nodes[i],start=pos;if("Blockquote"==node.name&&(match=/^\s*>( ?)/.exec(line.slice(pos))))pos+=match[0].length,context.push(new Context(node,start,pos,"",match[1],">",null));else if("ListItem"==node.name&&"OrderedList"==node.parent.name&&(match=/^(\s*)\d+([.)])(\s*)/.exec(nodeStart(node,doc)))){let after=match[3],len=match[0].length;4<=after.length&&(after=after.slice(0,after.length-4),len-=4),pos+=len,context.push(new Context(node.parent,start,pos,match[1],after,match[2],node))}else if("ListItem"==node.name&&"BulletList"==node.parent.name&&(match=/^(\s*)([-+*])(\s+)/.exec(nodeStart(node,doc)))){let after=match[3],len=match[0].length;4<after.length&&(after=after.slice(0,after.length-4),len-=4),pos+=len,context.push(new Context(node.parent,start,pos,match[1],after,match[2],node))}}return context}function itemNumber(item,doc){return /^(\s*)(\d+)(?=[.)])/.exec(doc.sliceString(item.from,item.from+10))}function renumberList(after,doc,changes,offset=0){for(let prev=-1,node=after;;){if("ListItem"==node.name){let m=itemNumber(node,doc),number=+m[2];if(0<=prev){if(number!=prev+1)return;changes.push({from:node.from+m[1].length,to:node.from+m[0].length,insert:prev+2+offset+""})}prev=number}let next=node.nextSibling;if(!next)break;node=next}}/// This command, when invoked in Markdown context with cursor
/// selection(s), will create a new line with the markup for
/// blockquotes and lists that were active on the old line. If the
/// cursor was directly after the end of the markup for the old line,
/// trailing whitespace and list markers are removed from that line.
///
/// The command does nothing in non-Markdown context, so it should
/// not be used as the only binding for Enter (even in a Markdown
/// document, HTML and code regions might use a different language).
function isMark(node){return"QuoteMark"==node.name||"ListMark"==node.name}function contextNodeForDelete(tree,pos){let node=tree.resolveInner(pos,-1),scan=pos;isMark(node)&&(scan=node.from,node=node.parent);for(let prev;prev=node.childBefore(scan);)if(isMark(prev))scan=prev.from;else if("OrderedList"==prev.name||"BulletList"==prev.name)node=prev.lastChild,scan=node.to;else break;return node}/// This command will, when invoked in a Markdown context with the
/// cursor directly after list or blockquote markup, delete one level
/// of markup. When the markup is for a list, it will be replaced by
/// spaces on the first invocation (a further invocation will delete
/// the spaces), to make it easy to continue a list.
///
/// When not after Markdown block markup, this command will return
/// false, so it is intended to be bound alongside other deletion
/// commands, with a higher precedence than the more generic commands.
Object.defineProperty(exports,"__esModule",{value:!0});var state=await require("@codemirror/state"),view=await require("@codemirror/view"),language=await require("@codemirror/language"),markdown$1=await require("@lezer/markdown"),langHtml=await require("@codemirror/lang-html"),highlight=await require("@codemirror/highlight");const data=language.defineLanguageFacet({block:{open:"<!--",close:"-->"}}),commonmark=markdown$1.parser.configure({props:[highlight.styleTags({"Blockquote/...":highlight.tags.quote,HorizontalRule:highlight.tags.contentSeparator,"ATXHeading1/... SetextHeading1/...":highlight.tags.heading1,"ATXHeading2/... SetextHeading2/...":highlight.tags.heading2,"ATXHeading3/...":highlight.tags.heading3,"ATXHeading4/...":highlight.tags.heading4,"ATXHeading5/...":highlight.tags.heading5,"ATXHeading6/...":highlight.tags.heading6,"Comment CommentBlock":highlight.tags.comment,Escape:highlight.tags.escape,Entity:highlight.tags.character,"Emphasis/...":highlight.tags.emphasis,"StrongEmphasis/...":highlight.tags.strong,"Link/... Image/...":highlight.tags.link,"OrderedList/... BulletList/...":highlight.tags.list,"BlockQuote/...":highlight.tags.quote,"InlineCode CodeText":highlight.tags.monospace,URL:highlight.tags.url,"HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark":highlight.tags.processingInstruction,"CodeInfo LinkLabel":highlight.tags.labelName,LinkTitle:highlight.tags.string,Paragraph:highlight.tags.content}),language.foldNodeProp.add(type=>!type.is("Block")||type.is("Document")?void 0:(tree,state)=>({from:state.doc.lineAt(tree.from).to,to:tree.to})),language.indentNodeProp.add({Document:()=>null}),language.languageDataProp.add({Document:data})]}),commonmarkLanguage=mkLang(commonmark),extended=commonmark.configure([markdown$1.GFM,markdown$1.Subscript,markdown$1.Superscript,markdown$1.Emoji,{props:[highlight.styleTags({"TableDelimiter SubscriptMark SuperscriptMark StrikethroughMark":highlight.tags.processingInstruction,"TableHeader/...":highlight.tags.heading,"Strikethrough/...":highlight.tags.strikethrough,TaskMarker:highlight.tags.atom,Task:highlight.tags.list,Emoji:highlight.tags.character,"Subscript Superscript":highlight.tags.special(highlight.tags.content),TableCell:highlight.tags.content})]}]),markdownLanguage=mkLang(extended);class Context{constructor(node,from,to,spaceBefore,spaceAfter,type,item){this.node=node,this.from=from,this.to=to,this.spaceBefore=spaceBefore,this.spaceAfter=spaceAfter,this.type=type,this.item=item}blank(trailing=!0){let result=this.spaceBefore;if("Blockquote"==this.node.name)result+=">";else for(let i=this.to-this.from-result.length-this.spaceAfter.length;0<i;i--)result+=" ";return result+(trailing?this.spaceAfter:"")}marker(doc,add){let number="OrderedList"==this.node.name?+itemNumber(this.item,doc)[2]+add+"":"";return this.spaceBefore+number+this.type+this.spaceAfter}}const insertNewlineContinueMarkup=({state:state$1,dispatch})=>{let tree=language.syntaxTree(state$1),{doc}=state$1,dont=null,changes=state$1.changeByRange(range=>{if(!range.empty||!markdownLanguage.isActiveAt(state$1,range.from))return dont={range};let pos=range.from,line=doc.lineAt(pos),context=getContext(tree.resolveInner(pos,-1),line.text,doc);for(;context.length&&context[context.length-1].from>pos-line.from;)context.pop();if(!context.length)return dont={range};let inner=context[context.length-1];if(inner.to-inner.spaceAfter.length>pos-line.from)return dont={range};// Empty line in list
if(inner.item&&pos>=inner.to-inner.spaceAfter.length&&!/\S/.test(line.text.slice(inner.to)))// First list item or blank line before: delete a level of markup
if(inner.node.firstChild.to>=pos||0<line.from&&!/[^\s>]/.test(doc.lineAt(line.from-1).text)){let delTo,next=1<context.length?context[context.length-2]:null,insert="";next&&next.item?(delTo=line.from+next.from,insert=next.marker(doc,1)):delTo=line.from+(next?next.to:0);let changes=[{from:delTo,to:pos,insert}];return"OrderedList"==inner.node.name&&renumberList(inner.item,doc,changes,-2),next&&"OrderedList"==next.node.name&&renumberList(next.item,doc,changes),{range:state.EditorSelection.cursor(delTo+insert.length),changes}}else{// Move this line down
let insert="";for(let i=0,e=context.length-2;i<=e;i++)insert+=context[i].blank(i<e);return insert+=state$1.lineBreak,{range:state.EditorSelection.cursor(pos+insert.length),changes:{from:line.from,insert}}}let changes=[];"OrderedList"==inner.node.name&&renumberList(inner.item,doc,changes);let insert=state$1.lineBreak,continued=inner.item&&inner.item.from<line.from;// If not dedented
if(!continued||/^[\s\d.)\-+*>]*/.exec(line.text)[0].length>=inner.to)for(let i=0,e=context.length-1;i<=e;i++)insert+=i!=e||continued?context[i].blank():context[i].marker(doc,1);let from=pos;for(;from>line.from&&/\s/.test(line.text.charAt(from-line.from-1));)from--;return changes.push({from,to:pos,insert}),{range:state.EditorSelection.cursor(from+insert.length),changes}});return!dont&&(dispatch(state$1.update(changes,{scrollIntoView:!0,userEvent:"input"})),!0)},deleteMarkupBackward=({state:state$1,dispatch})=>{let tree=language.syntaxTree(state$1),dont=null,changes=state$1.changeByRange(range=>{let pos=range.from,{doc}=state$1;if(range.empty&&markdownLanguage.isActiveAt(state$1,range.from)){let line=doc.lineAt(pos),context=getContext(contextNodeForDelete(tree,pos),line.text,doc);if(context.length){let inner=context[context.length-1],spaceEnd=inner.to-inner.spaceAfter.length+(inner.spaceAfter?1:0);// Delete extra trailing space after markup
if(pos-line.from>spaceEnd&&!/\S/.test(line.text.slice(spaceEnd,pos-line.from)))return{range:state.EditorSelection.cursor(line.from+spaceEnd),changes:{from:line.from+spaceEnd,to:pos}};if(pos-line.from==spaceEnd){let start=line.from+inner.from;// Replace a list item marker with blank space
if(inner.item&&inner.node.from<inner.item.from&&/\S/.test(line.text.slice(inner.from,inner.to)))return{range,changes:{from:start,to:line.from+inner.to,insert:inner.blank()}};// Delete one level of indentation
if(start<pos)return{range:state.EditorSelection.cursor(start),changes:{from:start,to:pos}}}}}return dont={range}});return!dont&&(dispatch(state$1.update(changes,{scrollIntoView:!0,userEvent:"delete"})),!0)},markdownKeymap=[{key:"Enter",run:insertNewlineContinueMarkup},{key:"Backspace",run:deleteMarkupBackward}],htmlNoMatch=langHtml.html({matchClosingTags:!1});return exports.commonmarkLanguage=commonmarkLanguage,exports.deleteMarkupBackward=deleteMarkupBackward,exports.insertNewlineContinueMarkup=insertNewlineContinueMarkup,exports.markdown=/// Markdown language support.
function(config={}){let{codeLanguages,defaultCodeLanguage,addKeymap=!0,base:{parser}=commonmarkLanguage}=config;if(!(parser instanceof markdown$1.MarkdownParser))throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");let defaultCode,extensions=config.extensions?[config.extensions]:[],support=[htmlNoMatch.support];defaultCodeLanguage instanceof language.LanguageSupport?(support.push(defaultCodeLanguage.support),defaultCode=defaultCodeLanguage.language):defaultCodeLanguage&&(defaultCode=defaultCodeLanguage);let codeParser=codeLanguages||defaultCode?getCodeParser(codeLanguages||[],defaultCode):void 0;return extensions.push(markdown$1.parseCode({codeParser,htmlParser:htmlNoMatch.language.parser})),addKeymap&&support.push(state.Prec.high(view.keymap.of(markdownKeymap))),new language.LanguageSupport(mkLang(parser.configure(extensions)),support)},exports.markdownKeymap=markdownKeymap,exports.markdownLanguage=markdownLanguage,exports}