async function moduleInitFunction(require,exports={}){function _interopDefaultLegacy(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}function findDiagnostic(diagnostics,diagnostic=null,after=0){let found=null;return diagnostics.between(after,1e9,(from,to,{spec})=>{if(!(diagnostic&&spec.diagnostic!=diagnostic))return found=new SelectedDiagnostic(from,to,spec.diagnostic),!1}),found}function maybeEnableLint(state$1,effects){return state$1.field(lintState,!1)?effects:effects.concat(state.StateEffect.appendConfig.of([lintState,view.EditorView.decorations.compute([lintState],state=>{let{selected,panel}=state.field(lintState);return selected&&panel&&selected.from!=selected.to?view.Decoration.set([activeMark.range(selected.from,selected.to)]):view.Decoration.none}),tooltip.hoverTooltip(lintTooltip),baseTheme]))}/// Returns a transaction spec which updates the current set of
/// diagnostics, and enables the lint extension if if wasn't already
/// active.
function setDiagnostics(state,diagnostics){return{effects:maybeEnableLint(state,[setDiagnosticsEffect.of(diagnostics)])}}/// The state effect that updates the set of active diagnostics. Can
/// be useful when writing an extension that needs to track these.
function lintTooltip(view,pos,side){let{diagnostics}=view.state.field(lintState),found=[],stackStart=2e8,stackEnd=0;return diagnostics.between(pos-(0>side?1:0),pos+(0<side?1:0),(from,to,{spec})=>{pos>=from&&pos<=to&&(from==to||(pos>from||0<side)&&(pos<to||0>side))&&(found.push(spec.diagnostic),stackStart=Math.min(from,stackStart),stackEnd=Math.max(to,stackEnd))}),found.length?{pos:stackStart,end:stackEnd,above:view.state.doc.lineAt(stackStart).to<stackEnd,create(){return{dom:diagnosticsTooltip(view,found)}}}:null}function diagnosticsTooltip(view,diagnostics){return elt__default["default"]("ul",{class:"cm-tooltip-lint"},diagnostics.map(d=>renderDiagnostic(view,d,!1)))}/// Command to open and focus the lint panel.
function assignKeys(actions){let assigned=[];if(actions)actions:for(let{name}of actions){for(let ch,i=0;i<name.length;i++)if(ch=name[i],/[a-zA-Z]/.test(ch)&&!assigned.some(c=>c.toLowerCase()==ch.toLowerCase())){assigned.push(ch);continue actions}assigned.push("")}return assigned}function renderDiagnostic(view,diagnostic,inPanel){var _a;let keys=inPanel?assignKeys(diagnostic.actions):[];return elt__default["default"]("li",{class:"cm-diagnostic cm-diagnostic-"+diagnostic.severity},elt__default["default"]("span",{class:"cm-diagnosticText"},diagnostic.message),null===(_a=diagnostic.actions)||void 0===_a?void 0:_a.map((action,i)=>{let click=e=>{e.preventDefault();let found=findDiagnostic(view.state.field(lintState).diagnostics,diagnostic);found&&action.apply(view,found.from,found.to)},{name}=action,keyIndex=keys[i]?name.indexOf(keys[i]):-1,nameElt=0>keyIndex?name:[name.slice(0,keyIndex),elt__default["default"]("u",name.slice(keyIndex,keyIndex+1)),name.slice(keyIndex+1)];return elt__default["default"]("button",{type:"button",class:"cm-diagnosticAction",onclick:click,onmousedown:click,"aria-label":` Action: ${name}${0>keyIndex?"":` (access key "${keys[i]})"`}.`},nameElt)}),diagnostic.source&&elt__default["default"]("div",{class:"cm-diagnosticSource"},diagnostic.source))}function svg(content,attrs=`viewBox="0 0 40 40"`){return`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content)}</svg>')`}function underline(color){return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`,`width="6" height="3"`)}function trackHoverOn(view,marker){let mousemove=event=>{let rect=marker.getBoundingClientRect();if(!(event.clientX>rect.left-10/* Margin */&&event.clientX<rect.right+10/* Margin */&&event.clientY>rect.top-10/* Margin */&&event.clientY<rect.bottom+10/* Margin */)){for(let target=event.target;target;target=target.parentNode)if(1==target.nodeType&&target.classList.contains("cm-tooltip-lint"))return;window.removeEventListener("mousemove",mousemove),view.state.field(lintGutterTooltip)&&view.dispatch({effects:setLintGutterTooltip.of(null)})}};window.addEventListener("mousemove",mousemove)}function gutterMarkerMouseOver(view,marker,diagnostics){function hovered(){let line=view.visualLineAtHeight(marker.getBoundingClientRect().top+5-view.documentTop);const linePos=view.coordsAtPos(line.from),markerRect=marker.getBoundingClientRect();linePos&&view.dispatch({effects:setLintGutterTooltip.of({pos:line.from,above:!1,create(){return{dom:diagnosticsTooltip(view,diagnostics),offset:{x:markerRect.left-linePos.left,y:0}}}})}),marker.onmouseout=marker.onmousemove=null,trackHoverOn(view,marker)}let hoverTimeout=setTimeout(hovered,600/* Time */);marker.onmouseout=()=>{clearTimeout(hoverTimeout),marker.onmouseout=marker.onmousemove=null},marker.onmousemove=()=>{clearTimeout(hoverTimeout),hoverTimeout=setTimeout(hovered,600/* Time */)}}function markersForDiagnostics(doc,diagnostics){let byLine=Object.create(null);for(let diagnostic of diagnostics){let line=doc.lineAt(diagnostic.from);(byLine[line.from]||(byLine[line.from]=[])).push(diagnostic)}let markers=[];for(let line in byLine)markers.push(new LintGutterMarker(byLine[line]).range(+line));return rangeset.RangeSet.of(markers,!0)}Object.defineProperty(exports,"__esModule",{value:!0});var view=await require("@codemirror/view"),state=await require("@codemirror/state"),tooltip=await require("@codemirror/tooltip"),panel=await require("@codemirror/panel"),gutter=await require("@codemirror/gutter"),rangeset=await require("@codemirror/rangeset"),elt=await require("crelt"),elt__default=/*#__PURE__*/_interopDefaultLegacy(elt);class SelectedDiagnostic{constructor(from,to,diagnostic){this.from=from,this.to=to,this.diagnostic=diagnostic}}class LintState{constructor(diagnostics,panel,selected){this.diagnostics=diagnostics,this.panel=panel,this.selected=selected}static init(diagnostics,panel,state){let ranges=view.Decoration.set(diagnostics.map(d=>d.from==d.to||d.from==d.to-1&&state.doc.lineAt(d.from).to==d.from?view.Decoration.widget({widget:new DiagnosticWidget(d),diagnostic:d}).range(d.from):view.Decoration.mark({attributes:{class:"cm-lintRange cm-lintRange-"+d.severity},diagnostic:d}).range(d.from,d.to)),!0);return new LintState(ranges,panel,findDiagnostic(ranges))}}const setDiagnosticsEffect=state.StateEffect.define(),togglePanel=state.StateEffect.define(),movePanelSelection=state.StateEffect.define(),lintState=state.StateField.define({create(){return new LintState(view.Decoration.none,null,null)},update(value,tr){if(tr.docChanged){let mapped=value.diagnostics.map(tr.changes),selected=null;if(value.selected){let selPos=tr.changes.mapPos(value.selected.from,1);selected=findDiagnostic(mapped,value.selected.diagnostic,selPos)||findDiagnostic(mapped,null,selPos)}value=new LintState(mapped,value.panel,selected)}for(let effect of tr.effects)effect.is(setDiagnosticsEffect)?value=LintState.init(effect.value,value.panel,tr.state):effect.is(togglePanel)?value=new LintState(value.diagnostics,effect.value?LintPanel.open:null,value.selected):effect.is(movePanelSelection)&&(value=new LintState(value.diagnostics,value.panel,effect.value));return value},provide:f=>[panel.showPanel.from(f,val=>val.panel),view.EditorView.decorations.from(f,s=>s.diagnostics)]}),activeMark=view.Decoration.mark({class:"cm-lintRange cm-lintRange-active"}),openLintPanel=view=>{let field=view.state.field(lintState,!1);field&&field.panel||view.dispatch({effects:maybeEnableLint(view.state,[togglePanel.of(!0)])});let panel$1=panel.getPanel(view,LintPanel.open);return panel$1&&panel$1.dom.querySelector(".cm-panel-lint ul").focus(),!0},closeLintPanel=view=>{let field=view.state.field(lintState,!1);return!!(field&&field.panel)&&(view.dispatch({effects:togglePanel.of(!1)}),!0)},nextDiagnostic=view=>{let field=view.state.field(lintState,!1);if(!field)return!1;let sel=view.state.selection.main,next=field.diagnostics.iter(sel.to+1);return(next.value||(next=field.diagnostics.iter(0),next.value&&(next.from!=sel.from||next.to!=sel.to)))&&(view.dispatch({selection:{anchor:next.from,head:next.to},scrollIntoView:!0}),!0)},lintPlugin=view.ViewPlugin.fromClass(class{constructor(view){this.view=view,this.timeout=-1,this.set=!0;let{delay}=view.state.facet(lintSource);this.lintTime=Date.now()+delay,this.run=this.run.bind(this),this.timeout=setTimeout(this.run,delay)}run(){let now=Date.now();if(now<this.lintTime-10)setTimeout(this.run,this.lintTime-now);else{this.set=!1;let{state}=this.view,{sources}=state.facet(lintSource);Promise.all(sources.map(source=>Promise.resolve(source(this.view)))).then(annotations=>{var _a,_b;let all=annotations.reduce((a,b)=>a.concat(b));this.view.state.doc==state.doc&&(all.length||(null===(_b=null===(_a=this.view.state.field(lintState,!1))||void 0===_a?void 0:_a.diagnostics)||void 0===_b?void 0:_b.size))&&this.view.dispatch(setDiagnostics(this.view.state,all))},error=>{view.logException(this.view.state,error)})}}update(update){let source=update.state.facet(lintSource);(update.docChanged||source!=update.startState.facet(lintSource))&&(this.lintTime=Date.now()+source.delay,!this.set&&(this.set=!0,this.timeout=setTimeout(this.run,source.delay)))}force(){this.set&&(this.lintTime=Date.now(),this.run())}destroy(){clearTimeout(this.timeout)}}),lintSource=state.Facet.define({combine(input){return{sources:input.map(i=>i.source),delay:input.length?Math.max(...input.map(i=>i.delay)):750}},enables:lintPlugin});class DiagnosticWidget extends view.WidgetType{constructor(diagnostic){super(),this.diagnostic=diagnostic}eq(other){return other.diagnostic==this.diagnostic}toDOM(){return elt__default["default"]("span",{class:"cm-lintPoint cm-lintPoint-"+this.diagnostic.severity})}}class PanelItem{constructor(view,diagnostic){this.diagnostic=diagnostic,this.id="item_"+Math.floor(4294967295*Math.random()).toString(16),this.dom=renderDiagnostic(view,diagnostic,!0),this.dom.id=this.id,this.dom.setAttribute("role","option")}}class LintPanel{constructor(view){this.view=view,this.items=[];this.list=elt__default["default"]("ul",{tabIndex:0,role:"listbox","aria-label":this.view.state.phrase("Diagnostics"),onkeydown:event=>{if(27==event.keyCode)closeLintPanel(this.view),this.view.focus();else if(38==event.keyCode||33==event.keyCode)this.moveSelection((this.selectedIndex-1+this.items.length)%this.items.length);else if(40==event.keyCode||34==event.keyCode)this.moveSelection((this.selectedIndex+1)%this.items.length);else if(36==event.keyCode)this.moveSelection(0);else if(35==event.keyCode)this.moveSelection(this.items.length-1);else if(13==event.keyCode)this.view.focus();else if(65<=event.keyCode&&90>=event.keyCode&&0<=this.selectedIndex){// A-Z
let{diagnostic}=this.items[this.selectedIndex],keys=assignKeys(diagnostic.actions);for(let i=0;i<keys.length;i++)if(keys[i].toUpperCase().charCodeAt(0)==event.keyCode){let found=findDiagnostic(this.view.state.field(lintState).diagnostics,diagnostic);found&&diagnostic.actions[i].apply(view,found.from,found.to)}}else return;event.preventDefault()},onclick:event=>{for(let i=0;i<this.items.length;i++)this.items[i].dom.contains(event.target)&&this.moveSelection(i)}}),this.dom=elt__default["default"]("div",{class:"cm-panel-lint"},this.list,elt__default["default"]("button",{type:"button",name:"close","aria-label":this.view.state.phrase("close"),onclick:()=>closeLintPanel(this.view)},"\xD7")),this.update()}get selectedIndex(){let selected=this.view.state.field(lintState).selected;if(!selected)return-1;for(let i=0;i<this.items.length;i++)if(this.items[i].diagnostic==selected.diagnostic)return i;return-1}update(){let{diagnostics,selected}=this.view.state.field(lintState),i=0,needsSync=!1,newSelectedItem=null;for(diagnostics.between(0,this.view.state.doc.length,(_start,_end,{spec})=>{let item,found=-1;for(let j=i;j<this.items.length;j++)if(this.items[j].diagnostic==spec.diagnostic){found=j;break}0>found?(item=new PanelItem(this.view,spec.diagnostic),this.items.splice(i,0,item),needsSync=!0):(item=this.items[found],found>i&&(this.items.splice(i,found-i),needsSync=!0)),selected&&item.diagnostic==selected.diagnostic?!item.dom.hasAttribute("aria-selected")&&(item.dom.setAttribute("aria-selected","true"),newSelectedItem=item):item.dom.hasAttribute("aria-selected")&&item.dom.removeAttribute("aria-selected"),i++});i<this.items.length&&!(1==this.items.length&&0>this.items[0].diagnostic.from);)needsSync=!0,this.items.pop();0==this.items.length&&(this.items.push(new PanelItem(this.view,{from:-1,to:-1,severity:"info",message:this.view.state.phrase("No diagnostics")})),needsSync=!0),newSelectedItem?(this.list.setAttribute("aria-activedescendant",newSelectedItem.id),this.view.requestMeasure({key:this,read:()=>({sel:newSelectedItem.dom.getBoundingClientRect(),panel:this.list.getBoundingClientRect()}),write:({sel,panel})=>{sel.top<panel.top?this.list.scrollTop-=panel.top-sel.top:sel.bottom>panel.bottom&&(this.list.scrollTop+=sel.bottom-panel.bottom)}})):0>this.selectedIndex&&this.list.removeAttribute("aria-activedescendant"),needsSync&&this.sync()}sync(){function rm(){let prev=domPos;domPos=prev.nextSibling,prev.remove()}let domPos=this.list.firstChild;for(let item of this.items)if(item.dom.parentNode==this.list){for(;domPos!=item.dom;)rm();domPos=item.dom.nextSibling}else this.list.insertBefore(item.dom,domPos);for(;domPos;)rm()}moveSelection(selectedIndex){if(0>this.selectedIndex)return;let field=this.view.state.field(lintState),selection=findDiagnostic(field.diagnostics,this.items[selectedIndex].diagnostic);selection&&this.view.dispatch({selection:{anchor:selection.from,head:selection.to},scrollIntoView:!0,effects:movePanelSelection.of(selection)})}static open(view){return new LintPanel(view)}}const baseTheme=view.EditorView.baseTheme({".cm-diagnostic":{padding:"3px 6px 3px 8px",marginLeft:"-1px",display:"block",whiteSpace:"pre-wrap"},".cm-diagnostic-error":{borderLeft:"5px solid #d11"},".cm-diagnostic-warning":{borderLeft:"5px solid orange"},".cm-diagnostic-info":{borderLeft:"5px solid #999"},".cm-diagnosticAction":{font:"inherit",border:"none",padding:"2px 4px",backgroundColor:"#444",color:"white",borderRadius:"3px",marginLeft:"8px"},".cm-diagnosticSource":{fontSize:"70%",opacity:.7},".cm-lintRange":{backgroundPosition:"left bottom",backgroundRepeat:"repeat-x",paddingBottom:"0.7px"},".cm-lintRange-error":{backgroundImage:underline("#d11")},".cm-lintRange-warning":{backgroundImage:underline("orange")},".cm-lintRange-info":{backgroundImage:underline("#999")},".cm-lintRange-active":{backgroundColor:"#ffdd9980"},".cm-tooltip-lint":{padding:0,margin:0},".cm-lintPoint":{position:"relative","&:after":{content:"\"\"",position:"absolute",bottom:0,left:"-2px",borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderBottom:"4px solid #d11"}},".cm-lintPoint-warning":{"&:after":{borderBottomColor:"orange"}},".cm-lintPoint-info":{"&:after":{borderBottomColor:"#999"}},".cm-panel.cm-panel-lint":{position:"relative","& ul":{maxHeight:"100px",overflowY:"auto","& [aria-selected]":{backgroundColor:"#ddd","& u":{textDecoration:"underline"}},"&:focus [aria-selected]":{background_fallback:"#bdf",backgroundColor:"Highlight",color_fallback:"white",color:"HighlightText"},"& u":{textDecoration:"none"},padding:0,margin:0},"& [name=close]":{position:"absolute",top:"0",right:"2px",background:"inherit",border:"none",font:"inherit",padding:0,margin:0}}});class LintGutterMarker extends gutter.GutterMarker{constructor(diagnostics){super(),this.diagnostics=diagnostics,this.severity=diagnostics.reduce((max,d)=>{let s=d.severity;return"error"==s||"warning"==s&&"info"==max?s:max},"info")}toDOM(view){let elt=document.createElement("div");return elt.className="cm-lint-marker cm-lint-marker-"+this.severity,elt.onmouseover=()=>gutterMarkerMouseOver(view,elt,this.diagnostics),elt}}const lintGutterExtension=gutter.gutter({class:"cm-gutter-lint",markers:view=>view.state.field(lintGutterMarkers)}),lintGutterMarkers=state.StateField.define({create(){return rangeset.RangeSet.empty},update(markers,tr){markers=markers.map(tr.changes);for(let effect of tr.effects)effect.is(setDiagnosticsEffect)&&(markers=markersForDiagnostics(tr.state.doc,effect.value));return markers}}),setLintGutterTooltip=state.StateEffect.define(),lintGutterTooltip=state.StateField.define({create(){return null},update(tooltip,tr){return tooltip&&tr.docChanged&&(tooltip=Object.assign(Object.assign({},tooltip),{pos:tr.changes.mapPos(tooltip.pos)})),tr.effects.reduce((t,e)=>e.is(setLintGutterTooltip)?e.value:t,tooltip)},provide:field=>tooltip.showTooltip.from(field)}),lintGutterTheme=view.EditorView.baseTheme({".cm-gutter-lint":{width:"1.4em","& .cm-gutterElement":{padding:"0 .2em",display:"flex",flexDirection:"column",justifyContent:"center"}},".cm-lint-marker":{width:"1em",height:"1em"},".cm-lint-marker-info":{content:svg(`<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>`)},".cm-lint-marker-warning":{content:svg(`<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>`)},".cm-lint-marker-error:before":{content:svg(`<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>`)}});return exports.closeLintPanel=closeLintPanel,exports.diagnosticCount=/// Returns the number of active lint diagnostics in the given state.
function(state){let lint=state.field(lintState,!1);return lint?lint.diagnostics.size:0},exports.forceLinting=/// Forces any linters [configured](#lint.linter) to run when the
/// editor is idle to run right away.
function(view){let plugin=view.plugin(lintPlugin);plugin&&plugin.force()},exports.lintGutter=/// Returns an extension that installs a gutter showing markers for
/// each line that has diagnostics, which can be hovered over to see
/// the diagnostics.
function(){return[lintGutterMarkers,lintGutterExtension,lintGutterTheme,lintGutterTooltip]},exports.lintKeymap=[{key:"Mod-Shift-m",run:openLintPanel},{key:"F8",run:nextDiagnostic}],exports.linter=/// Given a diagnostic source, this function returns an extension that
/// enables linting with that source. It will be called whenever the
/// editor is idle (after its content changed).
function(source,config={}){var _a;return lintSource.of({source,delay:null!==(_a=config.delay)&&void 0!==_a?_a:750})},exports.nextDiagnostic=nextDiagnostic,exports.openLintPanel=openLintPanel,exports.setDiagnostics=setDiagnostics,exports.setDiagnosticsEffect=setDiagnosticsEffect,exports}