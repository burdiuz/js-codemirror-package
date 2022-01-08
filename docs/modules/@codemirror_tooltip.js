async function moduleInitFunction(require,exports={}){/// Return an extension that configures tooltip behavior.
function windowSpace(){return{top:0,left:0,bottom:innerHeight,right:innerWidth}}function isInTooltip(elt){for(let cur=elt;cur;cur=cur.parentNode)if(1==cur.nodeType&&cur.classList.contains("cm-tooltip"))return!0;return!1}function isOverRange(view,from,to,x,y,margin){let range=document.createRange(),fromDOM=view.domAtPos(from),toDOM=view.domAtPos(to);range.setEnd(toDOM.node,toDOM.offset),range.setStart(fromDOM.node,fromDOM.offset);let rects=range.getClientRects();range.detach();for(let i=0;i<rects.length;i++){let rect=rects[i],dist=Math.max(rect.top-y,y-rect.bottom,rect.left-x,x-rect.right);if(dist<=margin)return!0}return!1}/// Enable a hover tooltip, which shows up when the pointer hovers
/// over ranges of text. The callback is called when the mouse hovers
/// over the document text. It should, if there is a tooltip
/// associated with position `pos` return the tooltip description
/// (either directly or in a promise). The `side` argument indicates
/// on which side of the position the pointer is—it will be -1 if the
/// pointer is before the position, 1 if after the position.
///
/// Note that all hover tooltips are hosted within a single tooltip
/// container element. This allows multiple tooltips over the same
/// range to be "merged" together without overlapping.
Object.defineProperty(exports,"__esModule",{value:!0});var view=await require("@codemirror/view"),state=await require("@codemirror/state");const ios="undefined"!=typeof navigator&&!/Edge\/(\d+)/.exec(navigator.userAgent)&&/Apple Computer/.test(navigator.vendor)&&(/Mobile\/\w+/.test(navigator.userAgent)||2<navigator.maxTouchPoints),Outside="-10000px";class TooltipViewManager{constructor(view,facet,createTooltipView){this.facet=facet,this.createTooltipView=createTooltipView,this.input=view.state.facet(facet),this.tooltips=this.input.filter(t=>t),this.tooltipViews=this.tooltips.map(createTooltipView)}update(update){let input=update.state.facet(this.facet),tooltips=input.filter(x=>x);if(input===this.input){for(let t of this.tooltipViews)t.update&&t.update(update);return!1}let tooltipViews=[];for(let i=0;i<tooltips.length;i++){let tip=tooltips[i],known=-1;if(tip){for(let other,i=0;i<this.tooltips.length;i++)other=this.tooltips[i],other&&other.create==tip.create&&(known=i);if(0>known)tooltipViews[i]=this.createTooltipView(tip);else{let tooltipView=tooltipViews[i]=this.tooltipViews[known];tooltipView.update&&tooltipView.update(update)}}}for(let t of this.tooltipViews)0>tooltipViews.indexOf(t)&&t.dom.remove();return this.input=input,this.tooltips=tooltips,this.tooltipViews=tooltipViews,!0}}const tooltipConfig=state.Facet.define({combine:values=>{var _a,_b,_c;return{position:ios?"absolute":(null===(_a=values.find(conf=>conf.position))||void 0===_a?void 0:_a.position)||"fixed",parent:(null===(_b=values.find(conf=>conf.parent))||void 0===_b?void 0:_b.parent)||null,tooltipSpace:(null===(_c=values.find(conf=>conf.tooltipSpace))||void 0===_c?void 0:_c.tooltipSpace)||windowSpace}}}),tooltipPlugin=view.ViewPlugin.fromClass(class{constructor(view){var _a;this.view=view,this.inView=!0,this.lastTransaction=0,this.measureTimeout=-1;let config=view.state.facet(tooltipConfig);this.position=config.position,this.parent=config.parent,this.classes=view.themeClasses,this.createContainer(),this.measureReq={read:this.readMeasure.bind(this),write:this.writeMeasure.bind(this),key:this},this.manager=new TooltipViewManager(view,showTooltip,t=>this.createTooltip(t)),this.intersectionObserver="function"==typeof IntersectionObserver?new IntersectionObserver(entries=>{Date.now()>this.lastTransaction-50&&0<entries.length&&1>entries[entries.length-1].intersectionRatio&&this.measureSoon()},{threshold:[1]}):null,this.observeIntersection(),null===(_a=view.dom.ownerDocument.defaultView)||void 0===_a?void 0:_a.addEventListener("resize",this.measureSoon=this.measureSoon.bind(this)),this.maybeMeasure()}createContainer(){this.parent?(this.container=document.createElement("div"),this.container.style.position="relative",this.container.className=this.view.themeClasses,this.parent.appendChild(this.container)):this.container=this.view.dom}observeIntersection(){if(this.intersectionObserver){this.intersectionObserver.disconnect();for(let tooltip of this.manager.tooltipViews)this.intersectionObserver.observe(tooltip.dom)}}measureSoon(){0>this.measureTimeout&&(this.measureTimeout=setTimeout(()=>{this.measureTimeout=-1,this.maybeMeasure()},50))}update(update){update.transactions.length&&(this.lastTransaction=Date.now());let updated=this.manager.update(update);updated&&this.observeIntersection();let shouldMeasure=updated||update.geometryChanged,newConfig=update.state.facet(tooltipConfig);if(newConfig.position!=this.position){this.position=newConfig.position;for(let t of this.manager.tooltipViews)t.dom.style.position=this.position;shouldMeasure=!0}if(newConfig.parent!=this.parent){this.parent&&this.container.remove(),this.parent=newConfig.parent,this.createContainer();for(let t of this.manager.tooltipViews)this.container.appendChild(t.dom);shouldMeasure=!0}else this.parent&&this.view.themeClasses!=this.classes&&(this.classes=this.container.className=this.view.themeClasses);shouldMeasure&&this.maybeMeasure()}createTooltip(tooltip){let tooltipView=tooltip.create(this.view);if(tooltipView.dom.classList.add("cm-tooltip"),tooltip.arrow&&!tooltipView.dom.querySelector("cm-tooltip > cm-tooltip-arrow")){let arrow=document.createElement("div");arrow.className="cm-tooltip-arrow",tooltipView.dom.appendChild(arrow)}return tooltipView.dom.style.position=this.position,tooltipView.dom.style.top=Outside,this.container.appendChild(tooltipView.dom),tooltipView.mount&&tooltipView.mount(this.view),tooltipView}destroy(){var _a,_b;null===(_a=this.view.dom.ownerDocument.defaultView)||void 0===_a?void 0:_a.removeEventListener("resize",this.measureSoon);for(let{dom}of this.manager.tooltipViews)dom.remove();null===(_b=this.intersectionObserver)||void 0===_b?void 0:_b.disconnect(),clearTimeout(this.measureTimeout)}readMeasure(){let editor=this.view.dom.getBoundingClientRect();return{editor,parent:this.parent?this.container.getBoundingClientRect():editor,pos:this.manager.tooltips.map(t=>this.view.coordsAtPos(t.pos)),size:this.manager.tooltipViews.map(({dom})=>dom.getBoundingClientRect()),space:this.view.state.facet(tooltipConfig).tooltipSpace(this.view)}}writeMeasure(measured){let{editor,space}=measured,others=[];for(let i=0;i<this.manager.tooltips.length;i++){let tooltip=this.manager.tooltips[i],tView=this.manager.tooltipViews[i],{dom}=tView,pos=measured.pos[i],size=measured.size[i];// Hide tooltips that are outside of the editor.
if(!pos||pos.bottom<=Math.max(editor.top,space.top)||pos.top>=Math.min(editor.bottom,space.bottom)||pos.right<=Math.max(editor.left,space.left)||pos.left>=Math.min(editor.right,space.right)){dom.style.top=Outside;continue}let arrow=tooltip.arrow?tView.dom.querySelector(".cm-tooltip-arrow"):null,arrowHeight=arrow?7/* Size */:0,width=size.right-size.left,height=size.bottom-size.top,offset=tView.offset||noOffset,ltr=this.view.textDirection==view.Direction.LTR,left=size.width>space.right-space.left?ltr?space.left:space.right-size.width:ltr?Math.min(pos.left-(arrow?14/* Offset */:0)+offset.x,space.right-width):Math.max(space.left,pos.left-width+(arrow?14/* Offset */:0)-offset.x),above=!!tooltip.above;!tooltip.strictSide&&(above?pos.top-(size.bottom-size.top)-offset.y<space.top:pos.bottom+(size.bottom-size.top)+offset.y>space.bottom)&&above==space.bottom-pos.bottom>pos.top-space.top&&(above=!above);let top=above?pos.top-height-arrowHeight-offset.y:pos.bottom+arrowHeight+offset.y,right=left+width;for(let r of others)r.left<right&&r.right>left&&r.top<top+height&&r.bottom>top&&(top=above?r.top-height-2-arrowHeight:r.bottom+arrowHeight+2);"absolute"==this.position?(dom.style.top=top-measured.parent.top+"px",dom.style.left=left-measured.parent.left+"px"):(dom.style.top=top+"px",dom.style.left=left+"px"),arrow&&(arrow.style.left=`${pos.left+(ltr?offset.x:-offset.x)-(left+14/* Offset */-7/* Size */)}px`),others.push({left,top,right,bottom:top+height}),dom.classList.toggle("cm-tooltip-above",above),dom.classList.toggle("cm-tooltip-below",!above),tView.positioned&&tView.positioned()}}maybeMeasure(){if(this.manager.tooltips.length&&(this.view.inView&&this.view.requestMeasure(this.measureReq),this.inView!=this.view.inView&&(this.inView=this.view.inView,!this.inView)))for(let tv of this.manager.tooltipViews)tv.dom.style.top=Outside}},{eventHandlers:{scroll(){this.maybeMeasure()}}}),baseTheme=view.EditorView.baseTheme({".cm-tooltip":{zIndex:100},"&light .cm-tooltip":{border:"1px solid #bbb",backgroundColor:"#f5f5f5"},"&light .cm-tooltip-section:not(:first-child)":{borderTop:"1px solid #bbb"},"&dark .cm-tooltip":{backgroundColor:"#333338",color:"white"},".cm-tooltip-arrow":{height:`${7/* Size */}px`,width:`${14}px`,position:"absolute",zIndex:-1,overflow:"hidden","&:before, &:after":{content:"''",position:"absolute",width:0,height:0,borderLeft:`${7/* Size */}px solid transparent`,borderRight:`${7/* Size */}px solid transparent`},".cm-tooltip-above &":{bottom:`-${7/* Size */}px`,"&:before":{borderTop:`${7/* Size */}px solid #bbb`},"&:after":{borderTop:`${7/* Size */}px solid #f5f5f5`,bottom:"1px"}},".cm-tooltip-below &":{top:`-${7/* Size */}px`,"&:before":{borderBottom:`${7/* Size */}px solid #bbb`},"&:after":{borderBottom:`${7/* Size */}px solid #f5f5f5`,top:"1px"}}},"&dark .cm-tooltip .cm-tooltip-arrow":{"&:before":{borderTopColor:"#333338",borderBottomColor:"#333338"},"&:after":{borderTopColor:"transparent",borderBottomColor:"transparent"}}}),noOffset={x:0,y:0},showTooltip=state.Facet.define({enables:[tooltipPlugin,baseTheme]}),showHoverTooltip=state.Facet.define();class HoverTooltipHost{constructor(view){this.view=view,this.mounted=!1,this.dom=document.createElement("div"),this.dom.classList.add("cm-tooltip-hover"),this.manager=new TooltipViewManager(view,showHoverTooltip,t=>this.createHostedView(t))}// Needs to be static so that host tooltip instances always match
static create(view){return new HoverTooltipHost(view)}createHostedView(tooltip){let hostedView=tooltip.create(this.view);return hostedView.dom.classList.add("cm-tooltip-section"),this.dom.appendChild(hostedView.dom),this.mounted&&hostedView.mount&&hostedView.mount(this.view),hostedView}mount(view){for(let hostedView of this.manager.tooltipViews)hostedView.mount&&hostedView.mount(view);this.mounted=!0}positioned(){for(let hostedView of this.manager.tooltipViews)hostedView.positioned&&hostedView.positioned()}update(update){this.manager.update(update)}}const showHoverTooltipHost=showTooltip.compute([showHoverTooltip],state=>{let tooltips=state.facet(showHoverTooltip).filter(t=>t);return 0===tooltips.length?null:{pos:Math.min(...tooltips.map(t=>t.pos)),end:Math.max(...tooltips.filter(t=>null!=t.end).map(t=>t.end)),create:HoverTooltipHost.create,above:tooltips[0].above,arrow:tooltips.some(t=>t.arrow)}});class HoverPlugin{constructor(view,source,field,setHover,hoverTime){this.view=view,this.source=source,this.field=field,this.setHover=setHover,this.hoverTime=hoverTime,this.hoverTimeout=-1,this.restartTimeout=-1,this.pending=null,this.lastMove={x:0,y:0,target:view.dom,time:0},this.checkHover=this.checkHover.bind(this),view.dom.addEventListener("mouseleave",this.mouseleave=this.mouseleave.bind(this)),view.dom.addEventListener("mousemove",this.mousemove=this.mousemove.bind(this))}update(){this.pending&&(this.pending=null,clearTimeout(this.restartTimeout),this.restartTimeout=setTimeout(()=>this.startHover(),20))}get active(){return this.view.state.field(this.field)}checkHover(){if(this.hoverTimeout=-1,!this.active){let hovered=Date.now()-this.lastMove.time;hovered<this.hoverTime?this.hoverTimeout=setTimeout(this.checkHover,this.hoverTime-hovered):this.startHover()}}startHover(){var _a;clearTimeout(this.restartTimeout);let{lastMove}=this,pos=this.view.contentDOM.contains(lastMove.target)?this.view.posAtCoords(lastMove):null;if(null==pos)return;let posCoords=this.view.coordsAtPos(pos);if(null==posCoords||lastMove.y<posCoords.top||lastMove.y>posCoords.bottom||lastMove.x<posCoords.left-this.view.defaultCharacterWidth||lastMove.x>posCoords.right+this.view.defaultCharacterWidth)return;let bidi=this.view.bidiSpans(this.view.state.doc.lineAt(pos)).find(s=>s.from<=pos&&s.to>=pos),rtl=bidi&&bidi.dir==view.Direction.RTL?-1:1,open=this.source(this.view,pos,lastMove.x<posCoords.left?-rtl:rtl);if(null===(_a=open)||void 0===_a?void 0:_a.then){let pending=this.pending={pos};open.then(result=>{this.pending==pending&&(this.pending=null,result&&this.view.dispatch({effects:this.setHover.of(result)}))},e=>view.logException(this.view.state,e,"hover tooltip"))}else open&&this.view.dispatch({effects:this.setHover.of(open)})}mousemove(event){var _a;this.lastMove={x:event.clientX,y:event.clientY,target:event.target,time:Date.now()},0>this.hoverTimeout&&(this.hoverTimeout=setTimeout(this.checkHover,this.hoverTime));let tooltip=this.active;if(tooltip&&!isInTooltip(this.lastMove.target)||this.pending){let{pos}=tooltip||this.pending,end=null!==(_a=null===tooltip||void 0===tooltip?void 0:tooltip.end)&&void 0!==_a?_a:pos;(pos==end?this.view.posAtCoords(this.lastMove)!=pos:!isOverRange(this.view,pos,end,event.clientX,event.clientY,6/* MaxDist */))&&(this.view.dispatch({effects:this.setHover.of(null)}),this.pending=null)}}mouseleave(){clearTimeout(this.hoverTimeout),this.hoverTimeout=-1,this.active&&this.view.dispatch({effects:this.setHover.of(null)})}destroy(){clearTimeout(this.hoverTimeout),this.view.dom.removeEventListener("mouseleave",this.mouseleave),this.view.dom.removeEventListener("mousemove",this.mousemove)}}const closeHoverTooltipEffect=state.StateEffect.define(),closeHoverTooltips=closeHoverTooltipEffect.of(null);/// Transaction effect that closes all hover tooltips.
return exports.closeHoverTooltips=closeHoverTooltips,exports.hasHoverTooltips=/// Returns true if any hover tooltips are currently active.
function(state){return state.facet(showHoverTooltip).some(x=>x)},exports.hoverTooltip=function(source,options={}){let setHover=state.StateEffect.define(),hoverState=state.StateField.define({create(){return null},update(value,tr){if(value&&options.hideOnChange&&(tr.docChanged||tr.selection))return null;for(let effect of tr.effects){if(effect.is(setHover))return effect.value;if(effect.is(closeHoverTooltipEffect))return null}if(value&&tr.docChanged){let newPos=tr.changes.mapPos(value.pos,-1,state.MapMode.TrackDel);if(null==newPos)return null;let copy=Object.assign(Object.create(null),value);return copy.pos=newPos,null!=value.end&&(copy.end=tr.changes.mapPos(value.end)),copy}return value},provide:f=>showHoverTooltip.from(f)}),hoverTime=options.hoverTime||600/* Time */;return[hoverState,view.ViewPlugin.define(view=>new HoverPlugin(view,source,hoverState,setHover,hoverTime)),showHoverTooltipHost]},exports.repositionTooltips=/// Tell the tooltip extension to recompute the position of the active
/// tooltips. This can be useful when something happens (such as a
/// re-positioning or CSS change affecting the editor) that could
/// invalidate the existing tooltip positions.
function(view){var _a;null===(_a=view.plugin(tooltipPlugin))||void 0===_a?void 0:_a.maybeMeasure()},exports.showTooltip=showTooltip,exports.tooltips=function(config={}){return tooltipConfig.of(config)},exports}