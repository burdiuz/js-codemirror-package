async function moduleInitFunction(require,exports={}){/// Define an editor gutter. The order in which the gutters appear is
/// determined by their extension priority.
/// The gutter-drawing plugin is automatically enabled when you add a
/// gutter, but you can use this function to explicitly configure it.
///
/// Unless `fixed` is explicitly set to `false`, the gutters are
/// fixed, meaning they don't scroll along with the content
/// horizontally (except on Internet Explorer, which doesn't support
/// CSS [`position:
/// sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)).
function gutters(config){let result=[gutterView,baseTheme];return config&&!1===config.fixed&&result.push(unfixGutters.of(!0)),result}function asArray(val){return Array.isArray(val)?val:[val]}function advanceCursor(cursor,collect,pos){for(;cursor.value&&cursor.from<=pos;)cursor.from==pos&&collect.push(cursor.value),cursor.next()}function sameMarkers(a,b){if(a.length!=b.length)return!1;for(let i=0;i<a.length;i++)if(!a[i].compare(b[i]))return!1;return!0}/// Facet used to provide markers to the line number gutter.
function formatNumber(view,number){return view.state.facet(lineNumberConfig).formatNumber(number,view.state)}function maxLineNumber(lines){let last=9;for(;last<lines;)last=10*last+9;return last}Object.defineProperty(exports,"__esModule",{value:!0});var view=await require("@codemirror/view"),rangeset=await require("@codemirror/rangeset"),state=await require("@codemirror/state");/// A gutter marker represents a bit of information attached to a line
/// in a specific gutter. Your own custom markers have to extend this
/// class.
class GutterMarker extends rangeset.RangeValue{/// @internal
compare(other){return this==other||this.constructor==other.constructor&&this.eq(other)}/// Compare this marker to another marker of the same type.
eq(){return!1}/// Called if the marker has a `toDOM` method and its representation
/// was removed from a gutter.
destroy(){}}GutterMarker.prototype.elementClass="",GutterMarker.prototype.toDOM=void 0,GutterMarker.prototype.mapMode=state.MapMode.TrackBefore,GutterMarker.prototype.startSide=GutterMarker.prototype.endSide=-1,GutterMarker.prototype.point=!0;/// Facet used to add a class to all gutter elements for a given line.
/// Markers given to this facet should _only_ define an
/// [`elementclass`](#gutter.GutterMarker.elementClass), not a
/// [`toDOM`](#gutter.GutterMarker.toDOM) (or the marker will appear
/// in all gutters for the line).
const gutterLineClass=state.Facet.define(),defaults={class:"",renderEmptyElements:!1,elementStyle:"",markers:()=>rangeset.RangeSet.empty,lineMarker:()=>null,lineMarkerChange:null,initialSpacer:null,updateSpacer:null,domEventHandlers:{}},activeGutters=state.Facet.define(),baseTheme=view.EditorView.baseTheme({".cm-gutters":{display:"flex",height:"100%",boxSizing:"border-box",left:0,zIndex:200},"&light .cm-gutters":{backgroundColor:"#f5f5f5",color:"#999",borderRight:"1px solid #ddd"},"&dark .cm-gutters":{backgroundColor:"#333338",color:"#ccc"},".cm-gutter":{display:"flex !important",flexDirection:"column",flexShrink:0,boxSizing:"border-box",minHeight:"100%",overflow:"hidden"},".cm-gutterElement":{boxSizing:"border-box"},".cm-lineNumbers .cm-gutterElement":{padding:"0 3px 0 5px",minWidth:"20px",textAlign:"right",whiteSpace:"nowrap"},"&light .cm-activeLineGutter":{backgroundColor:"#e2f2ff"},"&dark .cm-activeLineGutter":{backgroundColor:"#222227"}}),unfixGutters=state.Facet.define({combine:values=>values.some(x=>x)}),gutterView=view.ViewPlugin.fromClass(class{constructor(view){this.view=view,this.prevViewport=view.viewport,this.dom=document.createElement("div"),this.dom.className="cm-gutters",this.dom.setAttribute("aria-hidden","true"),this.dom.style.minHeight=this.view.contentHeight+"px",this.gutters=view.state.facet(activeGutters).map(conf=>new SingleGutterView(view,conf));for(let gutter of this.gutters)this.dom.appendChild(gutter.dom);this.fixed=!view.state.facet(unfixGutters),this.fixed&&(this.dom.style.position="sticky"),this.syncGutters(!1),view.scrollDOM.insertBefore(this.dom,view.contentDOM)}update(update){if(this.updateGutters(update)){// Detach during sync when the viewport changed significantly
// (such as during scrolling), since for large updates that is
// faster.
let vpA=this.prevViewport,vpB=update.view.viewport,vpOverlap=Math.min(vpA.to,vpB.to)-Math.max(vpA.from,vpB.from);this.syncGutters(vpOverlap<.8*(vpB.to-vpB.from))}update.geometryChanged&&(this.dom.style.minHeight=this.view.contentHeight+"px"),this.view.state.facet(unfixGutters)!=!this.fixed&&(this.fixed=!this.fixed,this.dom.style.position=this.fixed?"sticky":""),this.prevViewport=update.view.viewport}syncGutters(detach){let after=this.dom.nextSibling;detach&&this.dom.remove();let lineClasses=rangeset.RangeSet.iter(this.view.state.facet(gutterLineClass),this.view.viewport.from),classSet=[],contexts=this.gutters.map(gutter=>new UpdateContext(gutter,this.view.viewport,-this.view.documentPadding.top));for(let line of this.view.viewportLineBlocks){let text;if(Array.isArray(line.type)){for(let b of line.type)if(b.type==view.BlockType.Text){text=b;break}}else text=line.type==view.BlockType.Text?line:void 0;if(text){classSet.length&&(classSet=[]),advanceCursor(lineClasses,classSet,line.from);for(let cx of contexts)cx.line(this.view,text,classSet)}}for(let cx of contexts)cx.finish();detach&&this.view.scrollDOM.insertBefore(this.dom,after)}updateGutters(update){let prev=update.startState.facet(activeGutters),cur=update.state.facet(activeGutters),change=update.docChanged||update.heightChanged||update.viewportChanged||!rangeset.RangeSet.eq(update.startState.facet(gutterLineClass),update.state.facet(gutterLineClass),update.view.viewport.from,update.view.viewport.to);if(prev==cur)for(let gutter of this.gutters)gutter.update(update)&&(change=!0);else{change=!0;let gutters=[];for(let conf of cur){let known=prev.indexOf(conf);0>known?gutters.push(new SingleGutterView(this.view,conf)):(this.gutters[known].update(update),gutters.push(this.gutters[known]))}for(let g of this.gutters)g.dom.remove(),0>gutters.indexOf(g)&&g.destroy();for(let g of gutters)this.dom.appendChild(g.dom);this.gutters=gutters}return change}destroy(){for(let view of this.gutters)view.destroy();this.dom.remove()}},{provide:view.PluginField.scrollMargins.from(value=>0!=value.gutters.length&&value.fixed?value.view.textDirection==view.Direction.LTR?{left:value.dom.offsetWidth}:{right:value.dom.offsetWidth}:null)});class UpdateContext{constructor(gutter,viewport,height){this.gutter=gutter,this.height=height,this.localMarkers=[],this.i=0,this.cursor=rangeset.RangeSet.iter(gutter.markers,viewport.from)}line(view,line,extraMarkers){this.localMarkers.length&&(this.localMarkers=[]),advanceCursor(this.cursor,this.localMarkers,line.from);let localMarkers=extraMarkers.length?this.localMarkers.concat(extraMarkers):this.localMarkers,forLine=this.gutter.config.lineMarker(view,line,localMarkers);forLine&&localMarkers.unshift(forLine);let gutter=this.gutter;if(0!=localMarkers.length||gutter.config.renderEmptyElements){let above=line.top-this.height;if(this.i==gutter.elements.length){let newElt=new GutterElement(view,line.height,above,localMarkers);gutter.elements.push(newElt),gutter.dom.appendChild(newElt.dom)}else gutter.elements[this.i].update(view,line.height,above,localMarkers);this.height=line.bottom,this.i++}}finish(){for(let last,gutter=this.gutter;gutter.elements.length>this.i;)last=gutter.elements.pop(),gutter.dom.removeChild(last.dom),last.destroy()}}class SingleGutterView{constructor(view,config){for(let prop in this.view=view,this.config=config,this.elements=[],this.spacer=null,this.dom=document.createElement("div"),this.dom.className="cm-gutter"+(this.config.class?" "+this.config.class:""),config.domEventHandlers)this.dom.addEventListener(prop,event=>{let line=view.lineBlockAtHeight(event.clientY-view.documentTop);config.domEventHandlers[prop](view,line,event)&&event.preventDefault()});this.markers=asArray(config.markers(view)),config.initialSpacer&&(this.spacer=new GutterElement(view,0,0,[config.initialSpacer(view)]),this.dom.appendChild(this.spacer.dom),this.spacer.dom.style.cssText+="visibility: hidden; pointer-events: none")}update(update){let prevMarkers=this.markers;if(this.markers=asArray(this.config.markers(update.view)),this.spacer&&this.config.updateSpacer){let updated=this.config.updateSpacer(this.spacer.markers[0],update);updated!=this.spacer.markers[0]&&this.spacer.update(update.view,0,0,[updated])}let vp=update.view.viewport;return!rangeset.RangeSet.eq(this.markers,prevMarkers,vp.from,vp.to)||!!this.config.lineMarkerChange&&this.config.lineMarkerChange(update)}destroy(){for(let elt of this.elements)elt.destroy()}}class GutterElement{constructor(view,height,above,markers){this.height=-1,this.above=0,this.markers=[],this.dom=document.createElement("div"),this.update(view,height,above,markers)}update(view,height,above,markers){this.height!=height&&(this.dom.style.height=(this.height=height)+"px"),this.above!=above&&(this.dom.style.marginTop=(this.above=above)?above+"px":""),sameMarkers(this.markers,markers)||this.setMarkers(view,markers)}setMarkers(view,markers){let cls="cm-gutterElement",domPos=this.dom.firstChild;for(let iNew=0,iOld=0;;){let skipTo=iOld,marker=iNew<markers.length?markers[iNew++]:null,matched=!1;if(marker){let c=marker.elementClass;c&&(cls+=" "+c);for(let i=iOld;i<this.markers.length;i++)if(this.markers[i].compare(marker)){skipTo=i,matched=!0;break}}else skipTo=this.markers.length;for(;iOld<skipTo;){let next=this.markers[iOld++];if(next.toDOM){next.destroy(domPos);let after=domPos.nextSibling;domPos.remove(),domPos=after}}if(!marker)break;marker.toDOM&&(matched?domPos=domPos.nextSibling:this.dom.insertBefore(marker.toDOM(view),domPos)),matched&&iOld++}this.dom.className=cls,this.markers=markers}destroy(){this.setMarkers(null,[])}}const lineNumberMarkers=state.Facet.define(),lineNumberConfig=state.Facet.define({combine(values){return state.combineConfig(values,{formatNumber:String,domEventHandlers:{}},{domEventHandlers(a,b){let result=Object.assign({},a);for(let event in b){let exists=result[event],add=b[event];result[event]=exists?(view,line,event)=>exists(view,line,event)||add(view,line,event):add}return result}})}});class NumberMarker extends GutterMarker{constructor(number){super(),this.number=number}eq(other){return this.number==other.number}toDOM(){return document.createTextNode(this.number)}}const lineNumberGutter=activeGutters.compute([lineNumberConfig],state=>({class:"cm-lineNumbers",renderEmptyElements:!1,markers(view){return view.state.facet(lineNumberMarkers)},lineMarker(view,line,others){return others.some(m=>m.toDOM)?null:new NumberMarker(formatNumber(view,view.state.doc.lineAt(line.from).number))},lineMarkerChange:update=>update.startState.facet(lineNumberConfig)!=update.state.facet(lineNumberConfig),initialSpacer(view){return new NumberMarker(formatNumber(view,maxLineNumber(view.state.doc.lines)))},updateSpacer(spacer,update){let max=formatNumber(update.view,maxLineNumber(update.view.state.doc.lines));return max==spacer.number?spacer:new NumberMarker(max)},domEventHandlers:state.facet(lineNumberConfig).domEventHandlers})),activeLineGutterMarker=new class extends GutterMarker{constructor(){super(...arguments),this.elementClass="cm-activeLineGutter"}},activeLineGutterHighlighter=gutterLineClass.compute(["selection"],state=>{let marks=[],last=-1;for(let range of state.selection.ranges)if(range.empty){let linePos=state.doc.lineAt(range.head).from;linePos>last&&(last=linePos,marks.push(activeLineGutterMarker.range(linePos)))}return rangeset.RangeSet.of(marks)});/// Create a line number gutter extension.
return exports.GutterMarker=GutterMarker,exports.gutter=function(config){return[gutters(),activeGutters.of(Object.assign(Object.assign({},defaults),config))]},exports.gutterLineClass=gutterLineClass,exports.gutters=gutters,exports.highlightActiveLineGutter=/// Returns an extension that adds a `cm-activeLineGutter` class to
/// all gutter elements on the [active
/// line](#view.highlightActiveLine).
function(){return activeLineGutterHighlighter},exports.lineNumberMarkers=lineNumberMarkers,exports.lineNumbers=function(config={}){return[lineNumberConfig.of(config),gutters(),lineNumberGutter]},exports}