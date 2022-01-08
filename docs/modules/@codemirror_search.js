async function moduleInitFunction(require,exports={}){function _interopDefaultLegacy(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}function validRegExp(source){try{return new RegExp(source,baseFlags),!0}catch(_a){return!1}}function createLineDialog(view){function go(){let match=/^([+-])?(\d+)?(:\d+)?(%)?$/.exec(input.value);if(!match)return;let{state:state$1}=view,startLine=state$1.doc.lineAt(state$1.selection.main.head),[,sign,ln,cl,percent]=match,col=cl?+cl.slice(1):0,line=ln?+ln:startLine.number;if(ln&&percent){let pc=line/100;sign&&(pc=pc*("-"==sign?-1:1)+startLine.number/state$1.doc.lines),line=Math.round(state$1.doc.lines*pc)}else ln&&sign&&(line=line*("-"==sign?-1:1)+startLine.number);let docLine=state$1.doc.line(Math.max(1,Math.min(state$1.doc.lines,line)));view.dispatch({effects:dialogEffect.of(!1),selection:state.EditorSelection.cursor(docLine.from+Math.max(0,Math.min(col,docLine.length))),scrollIntoView:!0}),view.focus()}let input=elt__default["default"]("input",{class:"cm-textfield",name:"line"}),dom=elt__default["default"]("form",{class:"cm-gotoLine",onkeydown:event=>{27==event.keyCode?(event.preventDefault(),view.dispatch({effects:dialogEffect.of(!1)}),view.focus()):13==event.keyCode&&(event.preventDefault(),go())},onsubmit:event=>{event.preventDefault(),go()}},elt__default["default"]("label",view.state.phrase("Go to line"),": ",input)," ",elt__default["default"]("button",{class:"cm-button",type:"submit"},view.state.phrase("go")));return{dom,pos:-10}}// Find next occurrence of query relative to last cursor. Wrap around
// the document if there are no more matches.
function findNextOccurrence(state,query){let{main,ranges}=state.selection,word=state.wordAt(main.head),fullWord=word&&word.from==main.from&&word.to==main.to;for(let cycled=!1,cursor=new SearchCursor(state.doc,query,ranges[ranges.length-1].to);;)if(cursor.next(),cursor.done){if(cycled)return null;cursor=new SearchCursor(state.doc,query,0,Math.max(0,ranges[ranges.length-1].from-1)),cycled=!0}else{if(cycled&&ranges.some(r=>r.from==cursor.value.from))continue;if(fullWord){let word=state.wordAt(cursor.value.from);if(!word||word.from!=cursor.value.from||word.to!=cursor.value.to)continue}return cursor.value}}/// Select next occurrence of the current selection.
/// Expand selection to the word when selection range is empty.
function searchCommand(f){return view=>{let state=view.state.field(searchState,!1);return state&&state.query.spec.valid?f(view,state):openSearchPanel(view)}}/// Open the search panel if it isn't already open, and move the
/// selection to the first match after the current main selection.
/// Will wrap around to the start of the document when it reaches the
/// end.
function createSearchPanel(view){return view.state.facet(searchConfigFacet).createPanel(view)}function defaultQuery(state,fallback){var _a;let sel=state.selection.main,selText=sel.empty||sel.to>sel.from+100?"":state.sliceDoc(sel.from,sel.to),caseSensitive=null!==(_a=null===fallback||void 0===fallback?void 0:fallback.caseSensitive)&&void 0!==_a?_a:state.facet(searchConfigFacet).caseSensitive;return fallback&&!selText?fallback:new SearchQuery({search:selText.replace(/\n/g,"\\n"),caseSensitive})}/// Make sure the search panel is open and focused.
function phrase(view,phrase){return view.state.phrase(phrase)}function announceMatch(view$1,{from,to}){let lineStart=view$1.state.doc.lineAt(from).from,lineEnd=view$1.state.doc.lineAt(to).to,start=Math.max(lineStart,from-AnnounceMargin),end=Math.min(lineEnd,to+AnnounceMargin),text=view$1.state.sliceDoc(start,end);if(start!=lineStart)for(let i=0;i<AnnounceMargin;i++)if(!Break.test(text[i+1])&&Break.test(text[i])){text=text.slice(i);break}if(end!=lineEnd)for(let i=text.length-1;i>text.length-AnnounceMargin;i--)if(!Break.test(text[i-1])&&Break.test(text[i])){text=text.slice(0,i);break}return view.EditorView.announce.of(`${view$1.state.phrase("current match")}. ${text} ${view$1.state.phrase("on line")} ${view$1.state.doc.lineAt(from).number}`)}Object.defineProperty(exports,"__esModule",{value:!0});var view=await require("@codemirror/view"),state=await require("@codemirror/state"),panel=await require("@codemirror/panel"),rangeset=await require("@codemirror/rangeset"),elt=await require("crelt"),text=await require("@codemirror/text"),elt__default=/*#__PURE__*/_interopDefaultLegacy(elt);const basicNormalize="function"==typeof String.prototype.normalize?x=>x.normalize("NFKD"):x=>x;/// A search cursor provides an iterator over text matches in a
/// document.
class SearchCursor{/// Create a text cursor. The query is the search string, `from` to
/// `to` provides the region to search.
///
/// When `normalize` is given, it will be called, on both the query
/// string and the content it is matched against, before comparing.
/// You can, for example, create a case-insensitive search by
/// passing `s => s.toLowerCase()`.
///
/// Text is always normalized with
/// [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
/// (when supported).
constructor(text,query,from=0,to=text.length,normalize){this.value={from:0,to:0},this.done=!1,this.matches=[],this.buffer="",this.bufferPos=0,this.iter=text.iterRange(from,to),this.bufferStart=from,this.normalize=normalize?x=>normalize(basicNormalize(x)):basicNormalize,this.query=this.normalize(query)}peek(){if(this.bufferPos==this.buffer.length){if(this.bufferStart+=this.buffer.length,this.iter.next(),this.iter.done)return-1;this.bufferPos=0,this.buffer=this.iter.value}return text.codePointAt(this.buffer,this.bufferPos)}/// Look for the next match. Updates the iterator's
/// [`value`](#search.SearchCursor.value) and
/// [`done`](#search.SearchCursor.done) properties. Should be called
/// at least once before using the cursor.
next(){for(;this.matches.length;)this.matches.pop();return this.nextOverlapping()}/// The `next` method will ignore matches that partially overlap a
/// previous match. This method behaves like `next`, but includes
/// such matches.
nextOverlapping(){for(;;){let next=this.peek();if(0>next)return this.done=!0,this;let str=text.fromCodePoint(next),start=this.bufferStart+this.bufferPos;this.bufferPos+=text.codePointSize(next);let norm=this.normalize(str);for(let i=0,pos=start;;i++){let code=norm.charCodeAt(i),match=this.match(code,pos);if(match)return this.value=match,this;if(i==norm.length-1)break;pos==start&&i<str.length&&str.charCodeAt(i)==code&&pos++}}}match(code,pos){let match=null;for(let i=0;i<this.matches.length;i+=2){let index=this.matches[i],keep=!1;this.query.charCodeAt(index)==code&&(index==this.query.length-1?match={from:this.matches[i+1],to:pos+1}:(this.matches[i]++,keep=!0)),keep||(this.matches.splice(i,2),i-=2)}return this.query.charCodeAt(0)==code&&(1==this.query.length?match={from:pos,to:pos+1}:this.matches.push(1,pos)),match}}"undefined"!=typeof Symbol&&(SearchCursor.prototype[Symbol.iterator]=function(){return this});const empty={from:-1,to:-1,match:/.*/.exec("")},baseFlags="gm"+(null==/x/.unicode?"":"u");/// This class is similar to [`SearchCursor`](#search.SearchCursor)
/// but searches for a regular expression pattern instead of a plain
/// string.
class RegExpCursor{/// Create a cursor that will search the given range in the given
/// document. `query` should be the raw pattern (as you'd pass it to
/// `new RegExp`).
constructor(text,query,options,from=0,to=text.length){if(this.to=to,this.curLine="",this.done=!1,this.value=empty,/\\[sWDnr]|\n|\r|\[\^/.test(query))return new MultilineRegExpCursor(text,query,options,from,to);this.re=new RegExp(query,baseFlags+((null===options||void 0===options?void 0:options.ignoreCase)?"i":"")),this.iter=text.iter();let startLine=text.lineAt(from);this.curLineStart=startLine.from,this.matchPos=from,this.getLine(this.curLineStart)}getLine(skip){this.iter.next(skip),this.iter.lineBreak?this.curLine="":(this.curLine=this.iter.value,this.curLineStart+this.curLine.length>this.to&&(this.curLine=this.curLine.slice(0,this.to-this.curLineStart)),this.iter.next())}nextLine(){this.curLineStart=this.curLineStart+this.curLine.length+1,this.curLineStart>this.to?this.curLine="":this.getLine(0)}/// Move to the next match, if there is one.
next(){for(let off=this.matchPos-this.curLineStart;;){this.re.lastIndex=off;let match=this.matchPos<=this.to&&this.re.exec(this.curLine);if(match){let from=this.curLineStart+match.index,to=from+match[0].length;if(this.matchPos=to+(from==to?1:0),from==this.curLine.length&&this.nextLine(),from<to||from>this.value.to)return this.value={from,to,match},this;off=this.matchPos-this.curLineStart}else if(this.curLineStart+this.curLine.length<this.to)this.nextLine(),off=0;else return this.done=!0,this}}}const flattened=new WeakMap;// Reusable (partially) flattened document strings
class FlattenedDoc{constructor(from,text){this.from=from,this.text=text}get to(){return this.from+this.text.length}static get(doc,from,to){let cached=flattened.get(doc);if(!cached||cached.from>=to||cached.to<=from){let flat=new FlattenedDoc(from,doc.sliceString(from,to));return flattened.set(doc,flat),flat}if(cached.from==from&&cached.to==to)return cached;let{text,from:cachedFrom}=cached;return cachedFrom>from&&(text=doc.sliceString(from,cachedFrom)+text,cachedFrom=from),cached.to<to&&(text+=doc.sliceString(cached.to,to)),flattened.set(doc,new FlattenedDoc(cachedFrom,text)),new FlattenedDoc(from,text.slice(from-cachedFrom,to-cachedFrom))}}class MultilineRegExpCursor{constructor(text,query,options,from,to){this.text=text,this.to=to,this.done=!1,this.value=empty,this.matchPos=from,this.re=new RegExp(query,baseFlags+((null===options||void 0===options?void 0:options.ignoreCase)?"i":"")),this.flat=FlattenedDoc.get(text,from,this.chunkEnd(from+5e3/* Base */))}chunkEnd(pos){return pos>=this.to?this.to:this.text.lineAt(pos).to}next(){for(;;){let off=this.re.lastIndex=this.matchPos-this.flat.from,match=this.re.exec(this.flat.text);if(match&&!match[0]&&match.index==off&&(this.re.lastIndex=off+1,match=this.re.exec(this.flat.text)),match&&this.flat.to<this.to&&match.index+match[0].length>this.flat.text.length-10&&(match=null),match){let from=this.flat.from+match.index,to=from+match[0].length;return this.value={from,to,match},this.matchPos=to+(from==to?1:0),this}if(this.flat.to==this.to)return this.done=!0,this;// Grow the flattened doc
this.flat=FlattenedDoc.get(this.text,this.flat.from,this.chunkEnd(this.flat.from+2*this.flat.text.length))}}}"undefined"!=typeof Symbol&&(RegExpCursor.prototype[Symbol.iterator]=MultilineRegExpCursor.prototype[Symbol.iterator]=function(){return this});const dialogEffect=state.StateEffect.define(),dialogField=state.StateField.define({create(){return!0},update(value,tr){for(let e of tr.effects)e.is(dialogEffect)&&(value=e.value);return value},provide:f=>panel.showPanel.from(f,val=>val?createLineDialog:null)}),gotoLine=view=>{let panel$1=panel.getPanel(view,createLineDialog);if(!panel$1){let effects=[dialogEffect.of(!0)];null==view.state.field(dialogField,!1)&&effects.push(state.StateEffect.appendConfig.of([dialogField,baseTheme$1])),view.dispatch({effects}),panel$1=panel.getPanel(view,createLineDialog)}return panel$1&&panel$1.dom.querySelector("input").focus(),!0},baseTheme$1=view.EditorView.baseTheme({".cm-panel.cm-gotoLine":{padding:"2px 6px 4px","& label":{fontSize:"80%"}}}),defaultHighlightOptions={highlightWordAroundCursor:!1,minSelectionLength:1,maxMatches:100},highlightConfig=state.Facet.define({combine(options){return state.combineConfig(options,defaultHighlightOptions,{highlightWordAroundCursor:(a,b)=>a||b,minSelectionLength:Math.min,maxMatches:Math.min})}}),matchDeco=view.Decoration.mark({class:"cm-selectionMatch"}),mainMatchDeco=view.Decoration.mark({class:"cm-selectionMatch cm-selectionMatch-main"}),matchHighlighter=view.ViewPlugin.fromClass(class{constructor(view){this.decorations=this.getDeco(view)}update(update){(update.selectionSet||update.docChanged||update.viewportChanged)&&(this.decorations=this.getDeco(update.view))}getDeco(view$1){let conf=view$1.state.facet(highlightConfig),{state:state$1}=view$1,sel=state$1.selection;if(1<sel.ranges.length)return view.Decoration.none;let query,range=sel.main,check=null;if(range.empty){if(!conf.highlightWordAroundCursor)return view.Decoration.none;let word=state$1.wordAt(range.head);if(!word)return view.Decoration.none;check=state$1.charCategorizer(range.head),query=state$1.sliceDoc(word.from,word.to)}else{let len=range.to-range.from;if(len<conf.minSelectionLength||200<len)return view.Decoration.none;if(query=state$1.sliceDoc(range.from,range.to).trim(),!query)return view.Decoration.none}let deco=[];for(let part of view$1.visibleRanges)for(let cursor=new SearchCursor(state$1.doc,query,part.from,part.to);!cursor.next().done;){let{from,to}=cursor.value;if((!check||(0==from||check(state$1.sliceDoc(from-1,from))!=state.CharCategory.Word)&&(to==state$1.doc.length||check(state$1.sliceDoc(to,to+1))!=state.CharCategory.Word))&&(check&&from<=range.from&&to>=range.to?deco.push(mainMatchDeco.range(from,to)):(from>=range.to||to<=range.from)&&deco.push(matchDeco.range(from,to)),deco.length>conf.maxMatches))return view.Decoration.none}return view.Decoration.set(deco)}},{decorations:v=>v.decorations}),defaultTheme=view.EditorView.baseTheme({".cm-selectionMatch":{backgroundColor:"#99ff7780"},".cm-searchMatch .cm-selectionMatch":{backgroundColor:"transparent"}}),selectWord=({state:state$1,dispatch})=>{let{selection}=state$1,newSel=state.EditorSelection.create(selection.ranges.map(range=>state$1.wordAt(range.head)||state.EditorSelection.cursor(range.head)),selection.mainIndex);return!newSel.eq(selection)&&(dispatch(state$1.update({selection:newSel})),!0)},selectNextOccurrence=({state:state$1,dispatch})=>{let{ranges}=state$1.selection;if(ranges.some(sel=>sel.from===sel.to))return selectWord({state:state$1,dispatch});let searchedText=state$1.sliceDoc(ranges[0].from,ranges[0].to);if(state$1.selection.ranges.some(r=>state$1.sliceDoc(r.from,r.to)!=searchedText))return!1;let range=findNextOccurrence(state$1,searchedText);return!!range&&(dispatch(state$1.update({selection:state$1.selection.addRange(state.EditorSelection.range(range.from,range.to),!1),scrollIntoView:!0})),!0)},searchConfigFacet=state.Facet.define({combine(configs){var _a;return{top:configs.reduce((val,conf)=>null!==val&&void 0!==val?val:conf.top,void 0)||!1,caseSensitive:configs.reduce((val,conf)=>null!==val&&void 0!==val?val:conf.caseSensitive||conf.matchCase,void 0)||!1,createPanel:(null===(_a=configs.find(c=>c.createPanel))||void 0===_a?void 0:_a.createPanel)||(view=>new SearchPanel(view))}}});/// A search query. Part of the editor's search state.
class SearchQuery{/// Create a query object.
constructor(config){this.search=config.search,this.caseSensitive=!!config.caseSensitive,this.regexp=!!config.regexp,this.replace=config.replace||"",this.valid=!!this.search&&(!this.regexp||validRegExp(this.search))}/// Compare this query to another query.
eq(other){return this.search==other.search&&this.replace==other.replace&&this.caseSensitive==other.caseSensitive&&this.regexp==other.regexp}/// @internal
create(){return this.regexp?new RegExpQuery(this):new StringQuery(this)}}class QueryType{constructor(spec){this.spec=spec}}class StringQuery extends QueryType{constructor(spec){super(spec),this.unquoted=spec.search.replace(/\\([nrt\\])/g,(_,ch)=>"n"==ch?"\n":"r"==ch?"\r":"t"==ch?"\t":"\\")}cursor(doc,from=0,to=doc.length){return new SearchCursor(doc,this.unquoted,from,to,this.spec.caseSensitive?void 0:x=>x.toLowerCase())}nextMatch(doc,curFrom,curTo){let cursor=this.cursor(doc,curTo).nextOverlapping();return cursor.done&&(cursor=this.cursor(doc,0,curFrom).nextOverlapping()),cursor.done?null:cursor.value}// Searching in reverse is, rather than implementing inverted search
// cursor, done by scanning chunk after chunk forward.
prevMatchInRange(doc,from,to){for(let pos=to;;){let start=Math.max(from,pos-1e4/* ChunkSize */-this.unquoted.length),cursor=this.cursor(doc,start,pos),range=null;for(;!cursor.nextOverlapping().done;)range=cursor.value;if(range)return range;if(start==from)return null;pos-=1e4/* ChunkSize */}}prevMatch(doc,curFrom,curTo){return this.prevMatchInRange(doc,0,curFrom)||this.prevMatchInRange(doc,curTo,doc.length)}getReplacement(){return this.spec.replace}matchAll(doc,limit){let cursor=this.cursor(doc),ranges=[];for(;!cursor.next().done;){if(ranges.length>=limit)return null;ranges.push(cursor.value)}return ranges}highlight(doc,from,to,add){for(let cursor=this.cursor(doc,Math.max(0,from-this.unquoted.length),Math.min(to+this.unquoted.length,doc.length));!cursor.next().done;)add(cursor.value.from,cursor.value.to)}}class RegExpQuery extends QueryType{cursor(doc,from=0,to=doc.length){return new RegExpCursor(doc,this.spec.search,this.spec.caseSensitive?void 0:{ignoreCase:!0},from,to)}nextMatch(doc,curFrom,curTo){let cursor=this.cursor(doc,curTo).next();return cursor.done&&(cursor=this.cursor(doc,0,curFrom).next()),cursor.done?null:cursor.value}prevMatchInRange(doc,from,to){for(let size=1;;size++){let start=Math.max(from,to-1e4*size/* ChunkSize */),cursor=this.cursor(doc,start,to),range=null;for(;!cursor.next().done;)range=cursor.value;if(range&&(start==from||range.from>start+10))return range;if(start==from)return null}}prevMatch(doc,curFrom,curTo){return this.prevMatchInRange(doc,0,curFrom)||this.prevMatchInRange(doc,curTo,doc.length)}getReplacement(result){return this.spec.replace.replace(/\$([$&\d+])/g,(m,i)=>"$"==i?"$":"&"==i?result.match[0]:"0"!=i&&+i<result.match.length?result.match[i]:m)}matchAll(doc,limit){let cursor=this.cursor(doc),ranges=[];for(;!cursor.next().done;){if(ranges.length>=limit)return null;ranges.push(cursor.value)}return ranges}highlight(doc,from,to,add){for(let cursor=this.cursor(doc,Math.max(0,from-250/* HighlightMargin */),Math.min(to+250/* HighlightMargin */,doc.length));!cursor.next().done;)add(cursor.value.from,cursor.value.to)}}/// A state effect that updates the current search query.
const setSearchQuery=state.StateEffect.define(),togglePanel=state.StateEffect.define(),searchState=state.StateField.define({create(state){return new SearchState(defaultQuery(state).create(),createSearchPanel)},update(value,tr){for(let effect of tr.effects)effect.is(setSearchQuery)?value=new SearchState(effect.value.create(),value.panel):effect.is(togglePanel)&&(value=new SearchState(value.query,effect.value?createSearchPanel:null));return value},provide:f=>panel.showPanel.from(f,val=>val.panel)});class SearchState{constructor(query,panel){this.query=query,this.panel=panel}}const matchMark=view.Decoration.mark({class:"cm-searchMatch"}),selectedMatchMark=view.Decoration.mark({class:"cm-searchMatch cm-searchMatch-selected"}),searchHighlighter=view.ViewPlugin.fromClass(class{constructor(view){this.view=view,this.decorations=this.highlight(view.state.field(searchState))}update(update){let state=update.state.field(searchState);(state!=update.startState.field(searchState)||update.docChanged||update.selectionSet)&&(this.decorations=this.highlight(state))}highlight({query,panel}){if(!panel||!query.spec.valid)return view.Decoration.none;let{view:view$1}=this,builder=new rangeset.RangeSetBuilder;for(let i=0,ranges=view$1.visibleRanges,l=ranges.length;i<l;i++){let{from,to}=ranges[i];for(;i<l-1&&to>ranges[i+1].from-500/* HighlightMargin */;)to=ranges[++i].to;query.highlight(view$1.state.doc,from,to,(from,to)=>{let selected=view$1.state.selection.ranges.some(r=>r.from==from&&r.to==to);builder.add(from,to,selected?selectedMatchMark:matchMark)})}return builder.finish()}},{decorations:v=>v.decorations}),findNext=searchCommand((view,{query})=>{let{from,to}=view.state.selection.main,next=query.nextMatch(view.state.doc,from,to);return!!(next&&(next.from!=from||next.to!=to))&&(view.dispatch({selection:{anchor:next.from,head:next.to},scrollIntoView:!0,effects:announceMatch(view,next),userEvent:"select.search"}),!0)}),findPrevious=searchCommand((view,{query})=>{let{state}=view,{from,to}=state.selection.main,range=query.prevMatch(state.doc,from,to);return!!range&&(view.dispatch({selection:{anchor:range.from,head:range.to},scrollIntoView:!0,effects:announceMatch(view,range),userEvent:"select.search"}),!0)}),selectMatches=searchCommand((view,{query})=>{let ranges=query.matchAll(view.state.doc,1e3);return!!(ranges&&ranges.length)&&(view.dispatch({selection:state.EditorSelection.create(ranges.map(r=>state.EditorSelection.range(r.from,r.to))),userEvent:"select.search.matches"}),!0)}),selectSelectionMatches=({state:state$1,dispatch})=>{let sel=state$1.selection;if(1<sel.ranges.length||sel.main.empty)return!1;let{from,to}=sel.main,ranges=[],main=0;for(let cur=new SearchCursor(state$1.doc,state$1.sliceDoc(from,to));!cur.next().done;){if(1e3<ranges.length)return!1;cur.value.from==from&&(main=ranges.length),ranges.push(state.EditorSelection.range(cur.value.from,cur.value.to))}return dispatch(state$1.update({selection:state.EditorSelection.create(ranges,main),userEvent:"select.search.matches"})),!0},replaceNext=searchCommand((view,{query})=>{let{state}=view,{from,to}=state.selection.main;if(state.readOnly)return!1;let next=query.nextMatch(state.doc,from,from);if(!next)return!1;let selection,replacement,changes=[];if(next.from==from&&next.to==to&&(replacement=state.toText(query.getReplacement(next)),changes.push({from:next.from,to:next.to,insert:replacement}),next=query.nextMatch(state.doc,next.from,next.to)),next){let off=0==changes.length||changes[0].from>=next.to?0:next.to-next.from-replacement.length;selection={anchor:next.from-off,head:next.to-off}}return view.dispatch({changes,selection,scrollIntoView:!!selection,effects:next?announceMatch(view,next):void 0,userEvent:"input.replace"}),!0}),replaceAll=searchCommand((view,{query})=>{if(view.state.readOnly)return!1;let changes=query.matchAll(view.state.doc,1e9).map(match=>{let{from,to}=match;return{from,to,insert:query.getReplacement(match)}});return!!changes.length&&(view.dispatch({changes,userEvent:"input.replace.all"}),!0)}),openSearchPanel=view=>{let state$1=view.state.field(searchState,!1);if(state$1&&state$1.panel){let panel$1=panel.getPanel(view,createSearchPanel);if(!panel$1)return!1;let searchInput=panel$1.dom.querySelector("[name=search]");if(searchInput!=view.root.activeElement){let query=defaultQuery(view.state,state$1.query.spec);query.valid&&view.dispatch({effects:setSearchQuery.of(query)}),searchInput.focus(),searchInput.select()}}else view.dispatch({effects:[togglePanel.of(!0),state$1?setSearchQuery.of(defaultQuery(view.state,state$1.query.spec)):state.StateEffect.appendConfig.of(searchExtensions)]});return!0},closeSearchPanel=view=>{let state=view.state.field(searchState,!1);if(!state||!state.panel)return!1;let panel$1=panel.getPanel(view,createSearchPanel);return panel$1&&panel$1.dom.contains(view.root.activeElement)&&view.focus(),view.dispatch({effects:togglePanel.of(!1)}),!0};class SearchPanel{constructor(view){function button(name,onclick,content){return elt__default["default"]("button",{class:"cm-button",name,onclick,type:"button"},content)}this.view=view;let query=this.query=view.state.field(searchState).query.spec;this.commit=this.commit.bind(this),this.searchField=elt__default["default"]("input",{value:query.search,placeholder:phrase(view,"Find"),"aria-label":phrase(view,"Find"),class:"cm-textfield",name:"search",onchange:this.commit,onkeyup:this.commit}),this.replaceField=elt__default["default"]("input",{value:query.replace,placeholder:phrase(view,"Replace"),"aria-label":phrase(view,"Replace"),class:"cm-textfield",name:"replace",onchange:this.commit,onkeyup:this.commit}),this.caseField=elt__default["default"]("input",{type:"checkbox",name:"case",checked:query.caseSensitive,onchange:this.commit}),this.reField=elt__default["default"]("input",{type:"checkbox",name:"re",checked:query.regexp,onchange:this.commit}),this.dom=elt__default["default"]("div",{onkeydown:e=>this.keydown(e),class:"cm-search"},[this.searchField,button("next",()=>findNext(view),[phrase(view,"next")]),button("prev",()=>findPrevious(view),[phrase(view,"previous")]),button("select",()=>selectMatches(view),[phrase(view,"all")]),elt__default["default"]("label",null,[this.caseField,phrase(view,"match case")]),elt__default["default"]("label",null,[this.reField,phrase(view,"regexp")]),...(view.state.readOnly?[]:[elt__default["default"]("br"),this.replaceField,button("replace",()=>replaceNext(view),[phrase(view,"replace")]),button("replaceAll",()=>replaceAll(view),[phrase(view,"replace all")]),elt__default["default"]("button",{name:"close",onclick:()=>closeSearchPanel(view),"aria-label":phrase(view,"close"),type:"button"},["\xD7"])])])}commit(){let query=new SearchQuery({search:this.searchField.value,caseSensitive:this.caseField.checked,regexp:this.reField.checked,replace:this.replaceField.value});query.eq(this.query)||(this.query=query,this.view.dispatch({effects:setSearchQuery.of(query)}))}keydown(e){view.runScopeHandlers(this.view,e,"search-panel")?e.preventDefault():13==e.keyCode&&e.target==this.searchField?(e.preventDefault(),(e.shiftKey?findPrevious:findNext)(this.view)):13==e.keyCode&&e.target==this.replaceField&&(e.preventDefault(),replaceNext(this.view))}update(update){for(let tr of update.transactions)for(let effect of tr.effects)effect.is(setSearchQuery)&&!effect.value.eq(this.query)&&this.setQuery(effect.value)}setQuery(query){this.query=query,this.searchField.value=query.search,this.replaceField.value=query.replace,this.caseField.checked=query.caseSensitive,this.reField.checked=query.regexp}mount(){this.searchField.select()}get pos(){return 80}get top(){return this.view.state.facet(searchConfigFacet).top}}const AnnounceMargin=30,Break=/[\s\.,:;?!]/,baseTheme=view.EditorView.baseTheme({".cm-panel.cm-search":{padding:"2px 6px 4px",position:"relative","& [name=close]":{position:"absolute",top:"0",right:"4px",backgroundColor:"inherit",border:"none",font:"inherit",padding:0,margin:0},"& input, & button, & label":{margin:".2em .6em .2em 0"},"& input[type=checkbox]":{marginRight:".2em"},"& label":{fontSize:"80%",whiteSpace:"pre"}},"&light .cm-searchMatch":{backgroundColor:"#ffff0054"},"&dark .cm-searchMatch":{backgroundColor:"#00ffff8a"},"&light .cm-searchMatch-selected":{backgroundColor:"#ff6a0054"},"&dark .cm-searchMatch-selected":{backgroundColor:"#ff00ff8a"}}),searchExtensions=[searchState,state.Prec.lowest(searchHighlighter),baseTheme];return exports.RegExpCursor=RegExpCursor,exports.SearchCursor=SearchCursor,exports.SearchQuery=SearchQuery,exports.closeSearchPanel=closeSearchPanel,exports.findNext=findNext,exports.findPrevious=findPrevious,exports.getSearchQuery=/// Get the current search query from an editor state.
function(state){let curState=state.field(searchState,!1);return curState?curState.query.spec:defaultQuery(state)},exports.gotoLine=gotoLine,exports.highlightSelectionMatches=/// This extension highlights text that matches the selection. It uses
/// the `"cm-selectionMatch"` class for the highlighting. When
/// `highlightWordAroundCursor` is enabled, the word at the cursor
/// itself will be highlighted with `"cm-selectionMatch-main"`.
function(options){let ext=[defaultTheme,matchHighlighter];return options&&ext.push(highlightConfig.of(options)),ext},exports.openSearchPanel=openSearchPanel,exports.replaceAll=replaceAll,exports.replaceNext=replaceNext,exports.searchConfig=/// Configure the behavior of the search extension.
function(config){return searchConfigFacet.of(config)},exports.searchKeymap=[{key:"Mod-f",run:openSearchPanel,scope:"editor search-panel"},{key:"F3",run:findNext,shift:findPrevious,scope:"editor search-panel",preventDefault:!0},{key:"Mod-g",run:findNext,shift:findPrevious,scope:"editor search-panel",preventDefault:!0},{key:"Escape",run:closeSearchPanel,scope:"editor search-panel"},{key:"Mod-Shift-l",run:selectSelectionMatches},{key:"Alt-g",run:gotoLine},{key:"Mod-d",run:selectNextOccurrence,preventDefault:!0}],exports.selectMatches=selectMatches,exports.selectNextOccurrence=selectNextOccurrence,exports.selectSelectionMatches=selectSelectionMatches,exports.setSearchQuery=setSearchQuery,exports}