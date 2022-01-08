async function moduleInitFunction(require,exports={}){function mapRange(range,mapping){let from=mapping.mapPos(range.from,1),to=mapping.mapPos(range.to,-1);return from>=to?void 0:{from,to}}/// State effect that can be attached to a transaction to fold the
/// given range. (You probably only need this in exceptional
/// circumstances—usually you'll just want to let
/// [`foldCode`](#fold.foldCode) and the [fold
/// gutter](#fold.foldGutter) create the transactions.)
function selectedLines(view){let lines=[];for(let{head}of view.state.selection.ranges)lines.some(l=>l.from<=head&&l.to>=head)||lines.push(view.lineBlockAt(head));return lines}function foldInside(state,from,to){var _a;let found=null;return null===(_a=state.field(foldState,!1))||void 0===_a?void 0:_a.between(from,to,(from,to)=>{(!found||found.from>from)&&(found={from,to})}),found}function foldExists(folded,from,to){let found=!1;return folded.between(from,from,(a,b)=>{a==from&&b==to&&(found=!0)}),found}function maybeEnable(state$1,other){return state$1.field(foldState,!1)?other:other.concat(state.StateEffect.appendConfig.of(codeFolding()))}/// Fold the lines that are selected, if possible.
function announceFold(view$1,range,fold=!0){let lineFrom=view$1.state.doc.lineAt(range.from).number,lineTo=view$1.state.doc.lineAt(range.to).number;return view.EditorView.announce.of(`${view$1.state.phrase(fold?"Folded lines":"Unfolded lines")} ${lineFrom} ${view$1.state.phrase("to")} ${lineTo}.`)}/// Fold all top-level foldable ranges.
/// Create an extension that configures code folding.
function codeFolding(config){let result=[foldState,baseTheme];return config&&result.push(foldConfig.of(config)),result}Object.defineProperty(exports,"__esModule",{value:!0});var state=await require("@codemirror/state"),view=await require("@codemirror/view"),language=await require("@codemirror/language"),gutter=await require("@codemirror/gutter"),rangeset=await require("@codemirror/rangeset");const foldEffect=state.StateEffect.define({map:mapRange}),unfoldEffect=state.StateEffect.define({map:mapRange}),foldState=state.StateField.define({create(){return view.Decoration.none},update(folded,tr){folded=folded.map(tr.changes);for(let e of tr.effects)e.is(foldEffect)&&!foldExists(folded,e.value.from,e.value.to)?folded=folded.update({add:[foldWidget.range(e.value.from,e.value.to)]}):e.is(unfoldEffect)&&(folded=folded.update({filter:(from,to)=>e.value.from!=from||e.value.to!=to,filterFrom:e.value.from,filterTo:e.value.to}));// Clear folded ranges that cover the selection head
if(tr.selection){let onSelection=!1,{head}=tr.selection.main;folded.between(head,head,(a,b)=>{a<head&&b>head&&(onSelection=!0)}),onSelection&&(folded=folded.update({filterFrom:head,filterTo:head,filter:(a,b)=>b<=head||a>=head}))}return folded},provide:f=>view.EditorView.decorations.from(f)}),foldCode=view=>{for(let line of selectedLines(view)){let range=language.foldable(view.state,line.from,line.to);if(range)return view.dispatch({effects:maybeEnable(view.state,[foldEffect.of(range),announceFold(view,range)])}),!0}return!1},unfoldCode=view=>{if(!view.state.field(foldState,!1))return!1;let effects=[];for(let line of selectedLines(view)){let folded=foldInside(view.state,line.from,line.to);folded&&effects.push(unfoldEffect.of(folded),announceFold(view,folded,!1))}return effects.length&&view.dispatch({effects}),0<effects.length},foldAll=view=>{let{state}=view,effects=[];for(let pos=0;pos<state.doc.length;){let line=view.lineBlockAt(pos),range=language.foldable(state,line.from,line.to);range&&effects.push(foldEffect.of(range)),pos=(range?view.lineBlockAt(range.to):line).to+1}return effects.length&&view.dispatch({effects:maybeEnable(view.state,effects)}),!!effects.length},unfoldAll=view=>{let field=view.state.field(foldState,!1);if(!field||!field.size)return!1;let effects=[];return field.between(0,view.state.doc.length,(from,to)=>{effects.push(unfoldEffect.of({from,to}))}),view.dispatch({effects}),!0},defaultConfig={placeholderDOM:null,placeholderText:"\u2026"},foldConfig=state.Facet.define({combine(values){return state.combineConfig(values,defaultConfig)}}),foldWidget=view.Decoration.replace({widget:new class extends view.WidgetType{toDOM(view){let{state}=view,conf=state.facet(foldConfig),onclick=event=>{let line=view.lineBlockAt(view.posAtDOM(event.target)),folded=foldInside(view.state,line.from,line.to);folded&&view.dispatch({effects:unfoldEffect.of(folded)}),event.preventDefault()};if(conf.placeholderDOM)return conf.placeholderDOM(view,onclick);let element=document.createElement("span");return element.textContent=conf.placeholderText,element.setAttribute("aria-label",state.phrase("folded code")),element.title=state.phrase("unfold"),element.className="cm-foldPlaceholder",element.onclick=onclick,element}}}),foldGutterDefaults={openText:"\u2304",closedText:"\u203A",markerDOM:null};/// State effect that unfolds the given range (if it was folded).
class FoldMarker extends gutter.GutterMarker{constructor(config,open){super(),this.config=config,this.open=open}eq(other){return this.config==other.config&&this.open==other.open}toDOM(view){if(this.config.markerDOM)return this.config.markerDOM(this.open);let span=document.createElement("span");return span.textContent=this.open?this.config.openText:this.config.closedText,span.title=view.state.phrase(this.open?"Fold line":"Unfold line"),span}}/// Create an extension that registers a fold gutter, which shows a
/// fold status indicator before foldable lines (which can be clicked
/// to fold or unfold the line).
const baseTheme=view.EditorView.baseTheme({".cm-foldPlaceholder":{backgroundColor:"#eee",border:"1px solid #ddd",color:"#888",borderRadius:".2em",margin:"0 1px",padding:"0 1px",cursor:"pointer"},".cm-foldGutter span":{padding:"0 1px",cursor:"pointer"}});return exports.codeFolding=codeFolding,exports.foldAll=foldAll,exports.foldCode=foldCode,exports.foldEffect=foldEffect,exports.foldGutter=function(config={}){let fullConfig=Object.assign(Object.assign({},foldGutterDefaults),config),canFold=new FoldMarker(fullConfig,!0),canUnfold=new FoldMarker(fullConfig,!1),markers=view.ViewPlugin.fromClass(class{constructor(view){this.from=view.viewport.from,this.markers=this.buildMarkers(view)}update(update){(update.docChanged||update.viewportChanged||update.startState.facet(language.language)!=update.state.facet(language.language)||update.startState.field(foldState,!1)!=update.state.field(foldState,!1))&&(this.markers=this.buildMarkers(update.view))}buildMarkers(view){let builder=new rangeset.RangeSetBuilder;for(let line of view.viewportLineBlocks){let mark=foldInside(view.state,line.from,line.to)?canUnfold:language.foldable(view.state,line.from,line.to)?canFold:null;mark&&builder.add(line.from,line.from,mark)}return builder.finish()}});return[markers,gutter.gutter({class:"cm-foldGutter",markers(view){var _a;return(null===(_a=view.plugin(markers))||void 0===_a?void 0:_a.markers)||rangeset.RangeSet.empty},initialSpacer(){return new FoldMarker(fullConfig,!1)},domEventHandlers:{click:(view,line)=>{let folded=foldInside(view.state,line.from,line.to);if(folded)return view.dispatch({effects:unfoldEffect.of(folded)}),!0;let range=language.foldable(view.state,line.from,line.to);return!!range&&(view.dispatch({effects:foldEffect.of(range)}),!0)}}}),codeFolding()]},exports.foldKeymap=[{key:"Ctrl-Shift-[",mac:"Cmd-Alt-[",run:foldCode},{key:"Ctrl-Shift-]",mac:"Cmd-Alt-]",run:unfoldCode},{key:"Ctrl-Alt-[",run:foldAll},{key:"Ctrl-Alt-]",run:unfoldAll}],exports.foldedRanges=/// Get a [range set](#rangeset.RangeSet) containing the folded ranges
/// in the given state.
function(state){return state.field(foldState,!1)||rangeset.RangeSet.empty},exports.unfoldAll=unfoldAll,exports.unfoldCode=unfoldCode,exports.unfoldEffect=unfoldEffect,exports}