async function moduleInitFunction(require,exports={}){function addSection(sections,len,ins,forceJoin=!1){if(!(0==len&&0>=ins)){let last=sections.length-2;0<=last&&0>=ins&&ins==sections[last+1]?sections[last]+=len:0==len&&0==sections[last]?sections[last+1]+=ins:forceJoin?(sections[last]+=len,sections[last+1]+=ins):sections.push(len,ins)}}function addInsert(values,sections,value){if(0!=value.length){let index=sections.length-2>>1;if(index<values.length)values[values.length-1]=values[values.length-1].append(value);else{for(;values.length<index;)values.push(text.Text.empty);values.push(value)}}}function iterChanges(desc,f,individual){let inserted=desc.inserted;for(let posA=0,posB=0,i=0;i<desc.sections.length;){let len=desc.sections[i++],ins=desc.sections[i++];if(0>ins)posA+=len,posB+=len;else{let endA=posA,endB=posB,text$1=text.Text.empty;for(;;){if(endA+=len,endB+=ins,ins&&inserted&&(text$1=text$1.append(inserted[i-2>>1])),individual||i==desc.sections.length||0>desc.sections[i+1])break;len=desc.sections[i++],ins=desc.sections[i++]}f(posA,endA,posB,endB,text$1),posA=endA,posB=endB}}}function mapSet(setA,setB,before,mkSet=!1){let sections=[],insert=mkSet?[]:null,a=new SectionIter(setA),b=new SectionIter(setB);for(let posA=0,posB=0;;)if(-1==a.ins)posA+=a.len,a.next();else if(-1==b.ins&&posB<posA){let skip=Math.min(b.len,posA-posB);b.forward(skip),addSection(sections,skip,-1),posB+=skip}else if(0<=b.ins&&(a.done||posB<posA||posB==posA&&(b.len<a.len||b.len==a.len&&!before))){for(addSection(sections,b.ins,-1);posA>posB&&!a.done&&posA+a.len<posB+b.len;)posA+=a.len,a.next();posB+=b.len,b.next()}else if(0<=a.ins){let len=0,end=posA+a.len;for(;;)if(0<=b.ins&&posB>posA&&posB+b.len<end)len+=b.ins,posB+=b.len,b.next();else if(-1==b.ins&&posB<end){let skip=Math.min(b.len,end-posB);len+=skip,b.forward(skip),posB+=skip}else break;addSection(sections,len,a.ins),insert&&addInsert(insert,sections,a.text),posA=end,a.next()}else{if(a.done&&b.done)return insert?new ChangeSet(sections,insert):new ChangeDesc(sections);throw new Error("Mismatched change set lengths")}}function composeSets(setA,setB,mkSet=!1){let sections=[],insert=mkSet?[]:null,a=new SectionIter(setA),b=new SectionIter(setB);for(let open=!1;;){if(a.done&&b.done)return insert?new ChangeSet(sections,insert):new ChangeDesc(sections);if(0==a.ins)addSection(sections,a.len,0,open),a.next();else if(0==b.len&&!b.done)addSection(sections,0,b.ins,open),insert&&addInsert(insert,sections,b.text),b.next();else if(a.done||b.done)throw new Error("Mismatched change set lengths");else{let len=Math.min(a.len2,b.len),sectionLen=sections.length;if(-1==a.ins){let insB=-1==b.ins?-1:b.off?0:b.ins;addSection(sections,len,insB,open),insert&&insB&&addInsert(insert,sections,b.text)}else-1==b.ins?(addSection(sections,a.off?0:a.len,len,open),insert&&addInsert(insert,sections,a.textBit(len))):(addSection(sections,a.off?0:a.len,b.off?0:b.ins,open),insert&&!b.off&&addInsert(insert,sections,b.text));open=(a.ins>len||0<=b.ins&&b.len>len)&&(open||sections.length>sectionLen),a.forward2(len),b.forward(len)}}}function normalized(ranges,mainIndex=0){let main=ranges[mainIndex];ranges.sort((a,b)=>a.from-b.from),mainIndex=ranges.indexOf(main);for(let i=1;i<ranges.length;i++){let range=ranges[i],prev=ranges[i-1];if(range.empty?range.from<=prev.to:range.from<prev.to){let from=prev.from,to=Math.max(range.to,prev.to);i<=mainIndex&&mainIndex--,ranges.splice(--i,2,range.anchor>range.head?EditorSelection.range(to,from):EditorSelection.range(from,to))}}return new EditorSelection(ranges,mainIndex)}function checkSelection(selection,docLength){for(let range of selection.ranges)if(range.to>docLength)throw new RangeError("Selection points outside of document")}function sameArray(a,b){return a==b||a.length==b.length&&a.every((e,i)=>e===b[i])}function compareArray(a,b,compare){if(a.length!=b.length)return!1;for(let i=0;i<a.length;i++)if(!compare(a[i],b[i]))return!1;return!0}function dynamicFacetSlot(addresses,facet,providers){let providerAddrs=providers.map(p=>addresses[p.id]),providerTypes=providers.map(p=>p.type),dynamic=providerAddrs.filter(p=>!(1&p)),idx=addresses[facet.id]>>1;return(state,tr)=>{let oldVal=state.values[idx],changed=oldVal===Uninitialized||!tr;for(let dynAddr of dynamic)1&ensureAddr(state,dynAddr)/* Changed */&&(changed=!0);if(!changed)return 0;let values=[];for(let value,i=0;i<providerAddrs.length;i++)if(value=getAddr(state,providerAddrs[i]),2==providerTypes[i]/* Multi */)for(let val of value)values.push(val);else values.push(value);let value=facet.combine(values);return oldVal!==Uninitialized&&facet.compare(value,oldVal)?0:(state.values[idx]=value,1/* Changed */)}}function prec(value){return ext=>new PrecExtension(ext,value)}/// By default extensions are registered in the order they are found
/// in the flattened form of nested array that was provided.
/// Individual extension values can be assigned a precedence to
/// override this. Extensions that do not have a precedence set get
/// the precedence of the nearest parent with a precedence, or
/// [`default`](#state.Prec.default) if there is no such parent. The
/// final ordering of extensions is determined by first sorting by
/// precedence and then by order within each precedence.
function flatten(extension,compartments,newCompartments){function inner(ext,prec){let known=seen.get(ext);if(null!=known){if(known>=prec)return;let found=result[known].indexOf(ext);-1<found&&result[known].splice(found,1),ext instanceof CompartmentInstance&&newCompartments.delete(ext.compartment)}if(seen.set(ext,prec),Array.isArray(ext))for(let e of ext)inner(e,prec);else if(ext instanceof CompartmentInstance){if(newCompartments.has(ext.compartment))throw new RangeError(`Duplicate use of compartment in extensions`);let content=compartments.get(ext.compartment)||ext.inner;newCompartments.set(ext.compartment,content),inner(content,prec)}else if(ext instanceof PrecExtension)inner(ext.inner,ext.prec);else if(ext instanceof StateField)result[prec].push(ext),ext.provides&&inner(ext.provides,prec);else if(ext instanceof FacetProvider)result[prec].push(ext),ext.facet.extensions&&inner(ext.facet.extensions,prec);else{let content=ext.extension;if(!content)throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);inner(content,prec)}}let result=[[],[],[],[],[]],seen=new Map;return inner(extension,Prec_.default),result.reduce((a,b)=>a.concat(b))}function ensureAddr(state,addr){if(1&addr)return 2/* Computed */;let idx=addr>>1,status=state.status[idx];if(4==status/* Computing */)throw new Error("Cyclic dependency between fields and/or facets");if(2&status/* Computed */)return status;state.status[idx]=4/* Computing */;let changed=state.config.dynamicSlots[idx](state,state.applying);return state.status[idx]=2/* Computed */|changed}function getAddr(state,addr){return 1&addr?state.config.staticValues[addr>>1]:state.values[addr>>1]}function joinRanges(a,b){let result=[];for(let iA=0,iB=0;;){let from,to;if(iA<a.length&&(iB==b.length||b[iB]>=a[iA]))from=a[iA++],to=a[iA++];else if(iB<b.length)from=b[iB++],to=b[iB++];else return result;!result.length||result[result.length-1]<from?result.push(from,to):result[result.length-1]<to&&(result[result.length-1]=to)}}function mergeTransaction(a,b,sequential){var _a;let mapForA,mapForB,changes;return sequential?(mapForA=b.changes,mapForB=ChangeSet.empty(b.changes.length),changes=a.changes.compose(b.changes)):(mapForA=b.changes.map(a.changes),mapForB=a.changes.mapDesc(b.changes,!0),changes=a.changes.compose(mapForA)),{changes,selection:b.selection?b.selection.map(mapForB):null===(_a=a.selection)||void 0===_a?void 0:_a.map(mapForA),effects:StateEffect.mapEffects(a.effects,mapForA).concat(StateEffect.mapEffects(b.effects,mapForB)),annotations:a.annotations.length?a.annotations.concat(b.annotations):b.annotations,scrollIntoView:a.scrollIntoView||b.scrollIntoView}}function resolveTransactionInner(state,spec,docSize){let sel=spec.selection,annotations=asArray(spec.annotations);return spec.userEvent&&(annotations=annotations.concat(Transaction.userEvent.of(spec.userEvent))),{changes:spec.changes instanceof ChangeSet?spec.changes:ChangeSet.of(spec.changes||[],docSize,state.facet(lineSeparator)),selection:sel&&(sel instanceof EditorSelection?sel:EditorSelection.single(sel.anchor,sel.head)),effects:asArray(spec.effects),annotations,scrollIntoView:!!spec.scrollIntoView}}function resolveTransaction(state,specs,filter){let s=resolveTransactionInner(state,specs.length?specs[0]:{},state.doc.length);specs.length&&!1===specs[0].filter&&(filter=!1);for(let i=1;i<specs.length;i++){!1===specs[i].filter&&(filter=!1);let seq=!!specs[i].sequential;s=mergeTransaction(s,resolveTransactionInner(state,specs[i],seq?s.changes.newLength:state.doc.length),seq)}let tr=new Transaction(state,s.changes,s.selection,s.effects,s.annotations,s.scrollIntoView);return extendTransaction(filter?filterTransaction(tr):tr)}// Finish a transaction by applying filters if necessary.
function filterTransaction(tr){let state=tr.startState,result=!0;// Change filters
for(let filter of state.facet(changeFilter)){let value=filter(tr);if(!1===value){result=!1;break}Array.isArray(value)&&(result=!0===result?value:joinRanges(result,value))}if(!0!==result){let changes,back;if(!1===result)back=tr.changes.invertedDesc,changes=ChangeSet.empty(state.doc.length);else{let filtered=tr.changes.filter(result);changes=filtered.changes,back=filtered.filtered.invertedDesc}tr=new Transaction(state,changes,tr.selection&&tr.selection.map(back),StateEffect.mapEffects(tr.effects,back),tr.annotations,tr.scrollIntoView)}// Transaction filters
let filters=state.facet(transactionFilter);for(let filtered,i=filters.length-1;0<=i;i--)filtered=filters[i](tr),tr=filtered instanceof Transaction?filtered:Array.isArray(filtered)&&1==filtered.length&&filtered[0]instanceof Transaction?filtered[0]:resolveTransaction(state,asArray(filtered),!1);return tr}function extendTransaction(tr){let state=tr.startState,extenders=state.facet(transactionExtender),spec=tr;for(let extension,i=extenders.length-1;0<=i;i--)extension=extenders[i](tr),extension&&Object.keys(extension).length&&(spec=mergeTransaction(tr,resolveTransactionInner(state,extension,tr.changes.newLength),!0));return spec==tr?tr:new Transaction(state,tr.changes,tr.selection,spec.effects,spec.annotations,spec.scrollIntoView)}function asArray(value){return null==value?none:Array.isArray(value)?value:[value]}/// The categories produced by a [character
/// categorizer](#state.EditorState.charCategorizer). These are used
/// do things like selecting by word.
function hasWordChar(str){if(wordChar)return wordChar.test(str);for(let ch,i=0;i<str.length;i++)if(ch=str[i],/\w/.test(ch)||"\x80"<ch&&(ch.toUpperCase()!=ch.toLowerCase()||nonASCIISingleCaseWordChar.test(ch)))return!0;return!1}function makeCategorizer(wordChars){return char=>{if(!/\S/.test(char))return exports.CharCategory.Space;if(hasWordChar(char))return exports.CharCategory.Word;for(let i=0;i<wordChars.length;i++)if(-1<char.indexOf(wordChars[i]))return exports.CharCategory.Word;return exports.CharCategory.Other}}/// The editor state class is a persistent (immutable) data structure.
/// To update a state, you [create](#state.EditorState.update) a
/// [transaction](#state.Transaction), which produces a _new_ state
/// instance, without modifying the original object.
///
/// As such, _never_ mutate properties of a state directly. That'll
/// just break things.
Object.defineProperty(exports,"__esModule",{value:!0});var text=await require("@codemirror/text");const DefaultSplit=/\r\n?|\n/;/// Distinguishes different ways in which positions can be mapped.
exports.MapMode=void 0,function(MapMode){MapMode[MapMode.Simple=0]="Simple",MapMode[MapMode.TrackDel=1]="TrackDel",MapMode[MapMode.TrackBefore=2]="TrackBefore",MapMode[MapMode.TrackAfter=3]="TrackAfter"}(exports.MapMode||(exports.MapMode={}));/// A change description is a variant of [change set](#state.ChangeSet)
/// that doesn't store the inserted text. As such, it can't be
/// applied, but is cheaper to store and manipulate.
class ChangeDesc{// Sections are encoded as pairs of integers. The first is the
// length in the current document, and the second is -1 for
// unaffected sections, and the length of the replacement content
// otherwise. So an insertion would be (0, n>0), a deletion (n>0,
// 0), and a replacement two positive numbers.
/// @internal
constructor(/// @internal
sections){this.sections=sections}/// The length of the document before the change.
get length(){let result=0;for(let i=0;i<this.sections.length;i+=2)result+=this.sections[i];return result}/// The length of the document after the change.
get newLength(){let result=0;for(let ins,i=0;i<this.sections.length;i+=2)ins=this.sections[i+1],result+=0>ins?this.sections[i]:ins;return result}/// False when there are actual changes in this set.
get empty(){return 0==this.sections.length||2==this.sections.length&&0>this.sections[1]}/// Iterate over the unchanged parts left by these changes.
iterGaps(f){for(let i=0,posA=0,posB=0;i<this.sections.length;){let len=this.sections[i++],ins=this.sections[i++];0>ins?(f(posA,posB,len),posB+=len):posB+=ins,posA+=len}}/// Iterate over the ranges changed by these changes. (See
/// [`ChangeSet.iterChanges`](#state.ChangeSet.iterChanges) for a
/// variant that also provides you with the inserted text.)
///
/// When `individual` is true, adjacent changes (which are kept
/// separate for [position mapping](#state.ChangeDesc.mapPos)) are
/// reported separately.
iterChangedRanges(f,individual=!1){iterChanges(this,f,individual)}/// Get a description of the inverted form of these changes.
get invertedDesc(){let sections=[];for(let i=0;i<this.sections.length;){let len=this.sections[i++],ins=this.sections[i++];0>ins?sections.push(len,ins):sections.push(ins,len)}return new ChangeDesc(sections)}/// Compute the combined effect of applying another set of changes
/// after this one. The length of the document after this set should
/// match the length before `other`.
composeDesc(other){return this.empty?other:other.empty?this:composeSets(this,other)}/// Map this description, which should start with the same document
/// as `other`, over another set of changes, so that it can be
/// applied after it. When `before` is true, map as if the changes
/// in `other` happened before the ones in `this`.
mapDesc(other,before=!1){return other.empty?this:mapSet(this,other,before)}mapPos(pos,assoc=-1,mode=exports.MapMode.Simple){let posA=0,posB=0;for(let i=0;i<this.sections.length;){let len=this.sections[i++],ins=this.sections[i++],endA=posA+len;if(0>ins){if(endA>pos)return posB+(pos-posA);posB+=len}else{if(mode!=exports.MapMode.Simple&&endA>=pos&&(mode==exports.MapMode.TrackDel&&posA<pos&&endA>pos||mode==exports.MapMode.TrackBefore&&posA<pos||mode==exports.MapMode.TrackAfter&&endA>pos))return null;if(endA>pos||endA==pos&&0>assoc&&!len)return pos==posA||0>assoc?posB:posB+ins;posB+=ins}posA=endA}if(pos>posA)throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);return posB}/// Check whether these changes touch a given range. When one of the
/// changes entirely covers the range, the string `"cover"` is
/// returned.
touchesRange(from,to=from){for(let i=0,pos=0;i<this.sections.length&&pos<=to;){let len=this.sections[i++],ins=this.sections[i++],end=pos+len;if(0<=ins&&pos<=to&&end>=from)return!(pos<from&&end>to)||"cover";pos=end}return!1}/// @internal
toString(){let result="";for(let i=0;i<this.sections.length;){let len=this.sections[i++],ins=this.sections[i++];result+=(result?" ":"")+len+(0<=ins?":"+ins:"")}return result}/// Serialize this change desc to a JSON-representable value.
toJSON(){return this.sections}/// Create a change desc from its JSON representation (as produced
/// by [`toJSON`](#state.ChangeDesc.toJSON).
static fromJSON(json){if(!Array.isArray(json)||json.length%2||json.some(a=>"number"!=typeof a))throw new RangeError("Invalid JSON representation of ChangeDesc");return new ChangeDesc(json)}}/// A change set represents a group of modifications to a document. It
/// stores the document length, and can only be applied to documents
/// with exactly that length.
class ChangeSet extends ChangeDesc{/// @internal
constructor(sections,/// @internal
inserted){super(sections),this.inserted=inserted}/// Apply the changes to a document, returning the modified
/// document.
apply(doc){if(this.length!=doc.length)throw new RangeError("Applying change set to a document with the wrong length");return iterChanges(this,(fromA,toA,fromB,_toB,text)=>doc=doc.replace(fromB,fromB+(toA-fromA),text),!1),doc}mapDesc(other,before=!1){return mapSet(this,other,before,!0)}/// Given the document as it existed _before_ the changes, return a
/// change set that represents the inverse of this set, which could
/// be used to go from the document created by the changes back to
/// the document as it existed before the changes.
invert(doc){let sections=this.sections.slice(),inserted=[];for(let i=0,pos=0;i<sections.length;i+=2){let len=sections[i],ins=sections[i+1];if(0<=ins){sections[i]=ins,sections[i+1]=len;for(let index=i>>1;inserted.length<index;)inserted.push(text.Text.empty);inserted.push(len?doc.slice(pos,pos+len):text.Text.empty)}pos+=len}return new ChangeSet(sections,inserted)}/// Combine two subsequent change sets into a single set. `other`
/// must start in the document produced by `this`. If `this` goes
/// `docA` → `docB` and `other` represents `docB` → `docC`, the
/// returned value will represent the change `docA` → `docC`.
compose(other){return this.empty?other:other.empty?this:composeSets(this,other,!0)}/// Given another change set starting in the same document, maps this
/// change set over the other, producing a new change set that can be
/// applied to the document produced by applying `other`. When
/// `before` is `true`, order changes as if `this` comes before
/// `other`, otherwise (the default) treat `other` as coming first.
///
/// Given two changes `A` and `B`, `A.compose(B.map(A))` and
/// `B.compose(A.map(B, true))` will produce the same document. This
/// provides a basic form of [operational
/// transformation](https://en.wikipedia.org/wiki/Operational_transformation),
/// and can be used for collaborative editing.
map(other,before=!1){return other.empty?this:mapSet(this,other,before,!0)}/// Iterate over the changed ranges in the document, calling `f` for
/// each.
///
/// When `individual` is true, adjacent changes are reported
/// separately.
iterChanges(f,individual=!1){iterChanges(this,f,individual)}/// Get a [change description](#state.ChangeDesc) for this change
/// set.
get desc(){return new ChangeDesc(this.sections)}/// @internal
filter(ranges){let resultSections=[],resultInserted=[],filteredSections=[],iter=new SectionIter(this);done:for(let next,i=0,pos=0;;){for(next=i==ranges.length?1e9:ranges[i++];pos<next||pos==next&&0==iter.len;){if(iter.done)break done;let len=Math.min(iter.len,next-pos);addSection(filteredSections,len,-1);let ins=-1==iter.ins?-1:0==iter.off?iter.ins:0;addSection(resultSections,len,ins),0<ins&&addInsert(resultInserted,resultSections,iter.text),iter.forward(len),pos+=len}for(let end=ranges[i++];pos<end;){if(iter.done)break done;let len=Math.min(iter.len,end-pos);addSection(resultSections,len,-1),addSection(filteredSections,len,-1==iter.ins?-1:0==iter.off?iter.ins:0),iter.forward(len),pos+=len}}return{changes:new ChangeSet(resultSections,resultInserted),filtered:new ChangeDesc(filteredSections)}}/// Serialize this change set to a JSON-representable value.
toJSON(){let parts=[];for(let i=0;i<this.sections.length;i+=2){let len=this.sections[i],ins=this.sections[i+1];0>ins?parts.push(len):0==ins?parts.push([len]):parts.push([len].concat(this.inserted[i>>1].toJSON()))}return parts}/// Create a change set for the given changes, for a document of the
/// given length, using `lineSep` as line separator.
static of(changes,length,lineSep){function flush(force=!1){if(force||sections.length){pos<length&&addSection(sections,length-pos,-1);let set=new ChangeSet(sections,inserted);total=total?total.compose(set.map(total)):set,sections=[],inserted=[],pos=0}}function process(spec){if(Array.isArray(spec))for(let sub of spec)process(sub);else if(spec instanceof ChangeSet){if(spec.length!=length)throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);flush(),total=total?total.compose(spec.map(total)):spec}else{let{from,to=from,insert}=spec;if(from>to||0>from||to>length)throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);let insText=insert?"string"==typeof insert?text.Text.of(insert.split(lineSep||DefaultSplit)):insert:text.Text.empty,insLen=insText.length;if(from==to&&0==insLen)return;from<pos&&flush(),from>pos&&addSection(sections,from-pos,-1),addSection(sections,to-from,insLen),addInsert(inserted,sections,insText),pos=to}}let sections=[],inserted=[],pos=0,total=null;return process(changes),flush(!total),total}/// Create an empty changeset of the given length.
static empty(length){return new ChangeSet(length?[length,-1]:[],[])}/// Create a changeset from its JSON representation (as produced by
/// [`toJSON`](#state.ChangeSet.toJSON).
static fromJSON(json){if(!Array.isArray(json))throw new RangeError("Invalid JSON representation of ChangeSet");let sections=[],inserted=[];for(let part,i=0;i<json.length;i++)if(part=json[i],"number"==typeof part)sections.push(part,-1);else if(!Array.isArray(part)||"number"!=typeof part[0]||part.some((e,i)=>i&&"string"!=typeof e))throw new RangeError("Invalid JSON representation of ChangeSet");else if(1==part.length)sections.push(part[0],0);else{for(;inserted.length<i;)inserted.push(text.Text.empty);inserted[i]=text.Text.of(part.slice(1)),sections.push(part[0],inserted[i].length)}return new ChangeSet(sections,inserted)}}class SectionIter{constructor(set){this.set=set,this.i=0,this.next()}next(){let{sections}=this.set;this.i<sections.length?(this.len=sections[this.i++],this.ins=sections[this.i++]):(this.len=0,this.ins=-2),this.off=0}get done(){return-2==this.ins}get len2(){return 0>this.ins?this.len:this.ins}get text(){let{inserted}=this.set,index=this.i-2>>1;return index>=inserted.length?text.Text.empty:inserted[index]}textBit(len){let{inserted}=this.set,index=this.i-2>>1;return index>=inserted.length&&!len?text.Text.empty:inserted[index].slice(this.off,null==len?void 0:this.off+len)}forward(len){len==this.len?this.next():(this.len-=len,this.off+=len)}forward2(len){-1==this.ins?this.forward(len):len==this.ins?this.next():(this.ins-=len,this.off+=len)}}/// A single selection range. When
/// [`allowMultipleSelections`](#state.EditorState^allowMultipleSelections)
/// is enabled, a [selection](#state.EditorSelection) may hold
/// multiple ranges. By default, selections hold exactly one range.
class SelectionRange{/// @internal
constructor(/// The lower boundary of the range.
from,/// The upper boundary of the range.
to,flags){this.from=from,this.to=to,this.flags=flags}/// The anchor of the range—the side that doesn't move when you
/// extend it.
get anchor(){return 16&this.flags/* Inverted */?this.to:this.from}/// The head of the range, which is moved when the range is
/// [extended](#state.SelectionRange.extend).
get head(){return 16&this.flags/* Inverted */?this.from:this.to}/// True when `anchor` and `head` are at the same position.
get empty(){return this.from==this.to}/// If this is a cursor that is explicitly associated with the
/// character on one of its sides, this returns the side. -1 means
/// the character before its position, 1 the character after, and 0
/// means no association.
get assoc(){return 4&this.flags/* AssocBefore */?-1:8&this.flags/* AssocAfter */?1:0}/// The bidirectional text level associated with this cursor, if
/// any.
get bidiLevel(){let level=3&this.flags/* BidiLevelMask */;return 3==level?null:level}/// The goal column (stored vertical offset) associated with a
/// cursor. This is used to preserve the vertical position when
/// [moving](#view.EditorView.moveVertically) across
/// lines of different length.
get goalColumn(){let value=this.flags>>5/* GoalColumnOffset */;return 33554431==value/* NoGoalColumn */?void 0:value}/// Map this range through a change, producing a valid range in the
/// updated document.
map(change,assoc=-1){let from=change.mapPos(this.from,assoc),to=change.mapPos(this.to,assoc);return from==this.from&&to==this.to?this:new SelectionRange(from,to,this.flags)}/// Extend this range to cover at least `from` to `to`.
extend(from,to=from){if(from<=this.anchor&&to>=this.anchor)return EditorSelection.range(from,to);let head=Math.abs(from-this.anchor)>Math.abs(to-this.anchor)?from:to;return EditorSelection.range(this.anchor,head)}/// Compare this range to another range.
eq(other){return this.anchor==other.anchor&&this.head==other.head}/// Return a JSON-serializable object representing the range.
toJSON(){return{anchor:this.anchor,head:this.head}}/// Convert a JSON representation of a range to a `SelectionRange`
/// instance.
static fromJSON(json){if(!json||"number"!=typeof json.anchor||"number"!=typeof json.head)throw new RangeError("Invalid JSON representation for SelectionRange");return EditorSelection.range(json.anchor,json.head)}}/// An editor selection holds one or more selection ranges.
class EditorSelection{/// @internal
constructor(/// The ranges in the selection, sorted by position. Ranges cannot
/// overlap (but they may touch, if they aren't empty).
ranges,/// The index of the _main_ range in the selection (which is
/// usually the range that was added last).
mainIndex=0){this.ranges=ranges,this.mainIndex=mainIndex}/// Map a selection through a change. Used to adjust the selection
/// position for changes.
map(change,assoc=-1){return change.empty?this:EditorSelection.create(this.ranges.map(r=>r.map(change,assoc)),this.mainIndex)}/// Compare this selection to another selection.
eq(other){if(this.ranges.length!=other.ranges.length||this.mainIndex!=other.mainIndex)return!1;for(let i=0;i<this.ranges.length;i++)if(!this.ranges[i].eq(other.ranges[i]))return!1;return!0}/// Get the primary selection range. Usually, you should make sure
/// your code applies to _all_ ranges, by using methods like
/// [`changeByRange`](#state.EditorState.changeByRange).
get main(){return this.ranges[this.mainIndex]}/// Make sure the selection only has one range. Returns a selection
/// holding only the main range from this selection.
asSingle(){return 1==this.ranges.length?this:new EditorSelection([this.main])}/// Extend this selection with an extra range.
addRange(range,main=!0){return EditorSelection.create([range].concat(this.ranges),main?0:this.mainIndex+1)}/// Replace a given range with another range, and then normalize the
/// selection to merge and sort ranges if necessary.
replaceRange(range,which=this.mainIndex){let ranges=this.ranges.slice();return ranges[which]=range,EditorSelection.create(ranges,this.mainIndex)}/// Convert this selection to an object that can be serialized to
/// JSON.
toJSON(){return{ranges:this.ranges.map(r=>r.toJSON()),main:this.mainIndex}}/// Create a selection from a JSON representation.
static fromJSON(json){if(!json||!Array.isArray(json.ranges)||"number"!=typeof json.main||json.main>=json.ranges.length)throw new RangeError("Invalid JSON representation for EditorSelection");return new EditorSelection(json.ranges.map(r=>SelectionRange.fromJSON(r)),json.main)}/// Create a selection holding a single range.
static single(anchor,head=anchor){return new EditorSelection([EditorSelection.range(anchor,head)],0)}/// Sort and merge the given set of ranges, creating a valid
/// selection.
static create(ranges,mainIndex=0){if(0==ranges.length)throw new RangeError("A selection needs at least one range");for(let range,pos=0,i=0;i<ranges.length;i++){if(range=ranges[i],range.empty?range.from<=pos:range.from<pos)return normalized(ranges.slice(),mainIndex);pos=range.to}return new EditorSelection(ranges,mainIndex)}/// Create a cursor selection range at the given position. You can
/// safely ignore the optional arguments in most situations.
static cursor(pos,assoc=0,bidiLevel,goalColumn){return new SelectionRange(pos,pos,(0==assoc?0:0>assoc?4/* AssocBefore */:8/* AssocAfter */)|(null==bidiLevel?3:Math.min(2,bidiLevel))|(null!==goalColumn&&void 0!==goalColumn?goalColumn:33554431/* NoGoalColumn */)<<5/* GoalColumnOffset */)}/// Create a selection range.
static range(anchor,head,goalColumn){let goal=(null!==goalColumn&&void 0!==goalColumn?goalColumn:33554431/* NoGoalColumn */)<<5/* GoalColumnOffset */;return head<anchor?new SelectionRange(head,anchor,16/* Inverted */|goal):new SelectionRange(anchor,head,goal)}}let nextID=0;/// A facet is a labeled value that is associated with an editor
/// state. It takes inputs from any number of extensions, and combines
/// those into a single output value.
///
/// Examples of facets are the [theme](#view.EditorView^theme) styles
/// associated with an editor or the [tab
/// size](#state.EditorState^tabSize) (which is reduced to a single
/// value, using the input with the hightest precedence).
class Facet{constructor(/// @internal
combine,/// @internal
compareInput,/// @internal
compare,isStatic,/// @internal
extensions){this.combine=combine,this.compareInput=compareInput,this.compare=compare,this.isStatic=isStatic,this.extensions=extensions,this.id=nextID++,this.default=combine([])}/// Define a new facet.
static define(config={}){return new Facet(config.combine||(a=>a),config.compareInput||((a,b)=>a===b),config.compare||(config.combine?(a,b)=>a===b:sameArray),!!config.static,config.enables)}/// Returns an extension that adds the given value for this facet.
of(value){return new FacetProvider([],this,0/* Static */,value)}/// Create an extension that computes a value for the facet from a
/// state. You must take care to declare the parts of the state that
/// this value depends on, since your function is only called again
/// for a new state when one of those parts changed.
///
/// In most cases, you'll want to use the
/// [`provide`](#state.StateField^define^config.provide) option when
/// defining a field instead.
compute(deps,get){if(this.isStatic)throw new Error("Can't compute a static facet");return new FacetProvider(deps,this,1/* Single */,get)}/// Create an extension that computes zero or more values for this
/// facet from a state.
computeN(deps,get){if(this.isStatic)throw new Error("Can't compute a static facet");return new FacetProvider(deps,this,2/* Multi */,get)}from(field,get){return get||(get=x=>x),this.compute([field],state=>get(state.field(field)))}}class FacetProvider{constructor(dependencies,facet,type,value){this.dependencies=dependencies,this.facet=facet,this.type=type,this.value=value,this.id=nextID++}dynamicSlot(addresses){var _a;let getter=this.value,compare=this.facet.compareInput,idx=addresses[this.id]>>1,multi=2==this.type/* Multi */,depDoc=!1,depSel=!1,depAddrs=[];for(let dep of this.dependencies)"doc"==dep?depDoc=!0:"selection"==dep?depSel=!0:0==(1&(null!==(_a=addresses[dep.id])&&void 0!==_a?_a:1))&&depAddrs.push(addresses[dep.id]);return(state,tr)=>{let oldVal=state.values[idx];if(oldVal===Uninitialized)return state.values[idx]=getter(state),1/* Changed */;if(tr){let depChanged=depDoc&&tr.docChanged||depSel&&(tr.docChanged||tr.selection)||depAddrs.some(addr=>0<(1&ensureAddr(state,addr)/* Changed */));if(depChanged){let newVal=getter(state);if(multi?!compareArray(newVal,oldVal,compare):!compare(newVal,oldVal))return state.values[idx]=newVal,1/* Changed */}}return 0}}}const initField=Facet.define({static:!0});/// Fields can store additional information in an editor state, and
/// keep it in sync with the rest of the state.
class StateField{constructor(/// @internal
id,createF,updateF,compareF,/// @internal
spec){this.id=id,this.createF=createF,this.updateF=updateF,this.compareF=compareF,this.spec=spec,this.provides=void 0}/// Define a state field.
static define(config){let field=new StateField(nextID++,config.create,config.update,config.compare||((a,b)=>a===b),config);return config.provide&&(field.provides=config.provide(field)),field}create(state){let init=state.facet(initField).find(i=>i.field==this);return((null===init||void 0===init?void 0:init.create)||this.createF)(state)}/// @internal
slot(addresses){let idx=addresses[this.id]>>1;return(state,tr)=>{let oldVal=state.values[idx];if(oldVal===Uninitialized)return state.values[idx]=this.create(state),1/* Changed */;if(tr){let value=this.updateF(oldVal,tr);if(!this.compareF(oldVal,value))return state.values[idx]=value,1/* Changed */}return 0}}/// Returns an extension that enables this field and overrides the
/// way it is initialized. Can be useful when you need to provide a
/// non-default starting value for the field.
init(create){return[this,initField.of({field:this,create})]}/// State field instances can be used as
/// [`Extension`](#state.Extension) values to enable the field in a
/// given state.
get extension(){return this}}const Prec_={lowest:4,low:3,default:2,high:1,highest:0},Prec={/// The lowest precedence level. Meant for things that should end up
/// near the end of the extension order.
lowest:prec(Prec_.lowest),/// A lower-than-default precedence, for extensions.
low:prec(Prec_.low),/// The default precedence, which is also used for extensions
/// without an explicit precedence.
default:prec(Prec_.default),/// A higher-than-default precedence, for extensions that should
/// come before those with default precedence.
high:prec(Prec_.high),/// The highest precedence level, for extensions that should end up
/// near the start of the precedence ordering.
highest:prec(Prec_.highest),// FIXME Drop these in some future breaking version
/// Backwards-compatible synonym for `Prec.lowest`.
fallback:prec(Prec_.lowest),/// Backwards-compatible synonym for `Prec.high`.
extend:prec(Prec_.high),/// Backwards-compatible synonym for `Prec.highest`.
override:prec(Prec_.highest)};class PrecExtension{constructor(inner,prec){this.inner=inner,this.prec=prec}}/// Extension compartments can be used to make a configuration
/// dynamic. By [wrapping](#state.Compartment.of) part of your
/// configuration in a compartment, you can later
/// [replace](#state.Compartment.reconfigure) that part through a
/// transaction.
class Compartment{/// Create an instance of this compartment to add to your [state
/// configuration](#state.EditorStateConfig.extensions).
of(ext){return new CompartmentInstance(this,ext)}/// Create an [effect](#state.TransactionSpec.effects) that
/// reconfigures this compartment.
reconfigure(content){return Compartment.reconfigure.of({compartment:this,extension:content})}/// Get the current content of the compartment in the state, or
/// `undefined` if it isn't present.
get(state){return state.config.compartments.get(this)}}class CompartmentInstance{constructor(compartment,inner){this.compartment=compartment,this.inner=inner}}class Configuration{constructor(base,compartments,dynamicSlots,address,staticValues){for(this.base=base,this.compartments=compartments,this.dynamicSlots=dynamicSlots,this.address=address,this.staticValues=staticValues,this.statusTemplate=[];this.statusTemplate.length<dynamicSlots.length;)this.statusTemplate.push(0/* Unresolved */)}staticFacet(facet){let addr=this.address[facet.id];return null==addr?facet.default:this.staticValues[addr>>1]}static resolve(base,compartments,oldState){let fields=[],facets=Object.create(null),newCompartments=new Map;for(let ext of flatten(base,compartments,newCompartments))ext instanceof StateField?fields.push(ext):(facets[ext.facet.id]||(facets[ext.facet.id]=[])).push(ext);let address=Object.create(null),staticValues=[],dynamicSlots=[],dynamicDeps=[];for(let field of fields)address[field.id]=dynamicSlots.length<<1,dynamicSlots.push(a=>field.slot(a)),dynamicDeps.push([]);for(let id in facets){let providers=facets[id],facet=providers[0].facet;if(providers.every(p=>0==p.type/* Static */)){address[facet.id]=1|staticValues.length<<1;let value=facet.combine(providers.map(p=>p.value)),oldAddr=oldState?oldState.config.address[facet.id]:null;if(null!=oldAddr){let oldVal=getAddr(oldState,oldAddr);facet.compare(value,oldVal)&&(value=oldVal)}staticValues.push(value)}else{for(let p of providers)0==p.type/* Static */?(address[p.id]=1|staticValues.length<<1,staticValues.push(p.value)):(address[p.id]=dynamicSlots.length<<1,dynamicSlots.push(a=>p.dynamicSlot(a)),dynamicDeps.push(p.dependencies.filter(d=>"string"!=typeof d).map(d=>d.id)));address[facet.id]=dynamicSlots.length<<1,dynamicSlots.push(a=>dynamicFacetSlot(a,facet,providers)),dynamicDeps.push(providers.filter(p=>0!=p.type/* Static */).map(d=>d.id))}}let dynamicValues=dynamicSlots.map(()=>Uninitialized);if(oldState){let canReuse=(id,depth)=>{if(7<depth)return!1;let addr=address[id];if(!(1&addr))return dynamicDeps[addr>>1].every(id=>canReuse(id,depth+1));let oldAddr=oldState.config.address[id];return null!=oldAddr&&getAddr(oldState,oldAddr)==staticValues[addr>>1]};// Copy over old values for shared facets/fields, if we can
// prove that they don't need to be recomputed.
for(let id in address){let cur=address[id],prev=oldState.config.address[id];null!=prev&&0==(1&cur)&&canReuse(+id,0)&&(dynamicValues[cur>>1]=getAddr(oldState,prev))}}return{configuration:new Configuration(base,newCompartments,dynamicSlots.map(f=>f(address)),address,staticValues),values:dynamicValues}}}const Uninitialized={},languageData=Facet.define(),allowMultipleSelections=Facet.define({combine:values=>values.some(v=>v),static:!0}),lineSeparator=Facet.define({combine:values=>values.length?values[0]:void 0,static:!0}),changeFilter=Facet.define(),transactionFilter=Facet.define(),transactionExtender=Facet.define(),readOnly=Facet.define({combine:values=>!!values.length&&values[0]});/// Annotations are tagged values that are used to add metadata to
/// transactions in an extensible way. They should be used to model
/// things that effect the entire transaction (such as its [time
/// stamp](#state.Transaction^time) or information about its
/// [origin](#state.Transaction^userEvent)). For effects that happen
/// _alongside_ the other changes made by the transaction, [state
/// effects](#state.StateEffect) are more appropriate.
class Annotation{/// @internal
constructor(/// The annotation type.
type,/// The value of this annotation.
value){this.type=type,this.value=value}/// Define a new type of annotation.
static define(){return new AnnotationType}}/// Marker that identifies a type of [annotation](#state.Annotation).
class AnnotationType{/// Create an instance of this annotation.
of(value){return new Annotation(this,value)}}/// Representation of a type of state effect. Defined with
/// [`StateEffect.define`](#state.StateEffect^define).
class StateEffectType{/// @internal
constructor(// The `any` types in these function types are there to work
// around TypeScript issue #37631, where the type guard on
// `StateEffect.is` mysteriously stops working when these properly
// have type `Value`.
/// @internal
map){this.map=map}/// Create a [state effect](#state.StateEffect) instance of this
/// type.
of(value){return new StateEffect(this,value)}}/// State effects can be used to represent additional effects
/// associated with a [transaction](#state.Transaction.effects). They
/// are often useful to model changes to custom [state
/// fields](#state.StateField), when those changes aren't implicit in
/// document or selection changes.
class StateEffect{/// @internal
constructor(/// @internal
type,/// The value of this effect.
value){this.type=type,this.value=value}/// Map this effect through a position mapping. Will return
/// `undefined` when that ends up deleting the effect.
map(mapping){let mapped=this.type.map(this.value,mapping);return void 0===mapped?void 0:mapped==this.value?this:new StateEffect(this.type,mapped)}/// Tells you whether this effect object is of a given
/// [type](#state.StateEffectType).
is(type){return this.type==type}/// Define a new effect type. The type parameter indicates the type
/// of values that his effect holds.
static define(spec={}){return new StateEffectType(spec.map||(v=>v))}/// Map an array of effects through a change set.
static mapEffects(effects,mapping){if(!effects.length)return effects;let result=[];for(let effect of effects){let mapped=effect.map(mapping);mapped&&result.push(mapped)}return result}}/// This effect can be used to reconfigure the root extensions of
/// the editor. Doing this will discard any extensions
/// [appended](#state.StateEffect^appendConfig), but does not reset
/// the content of [reconfigured](#state.Compartment.reconfigure)
/// compartments.
StateEffect.reconfigure=StateEffect.define(),StateEffect.appendConfig=StateEffect.define();/// Changes to the editor state are grouped into transactions.
/// Typically, a user action creates a single transaction, which may
/// contain any number of document changes, may change the selection,
/// or have other effects. Create a transaction by calling
/// [`EditorState.update`](#state.EditorState.update).
class Transaction{/// @internal
constructor(/// The state from which the transaction starts.
startState,/// The document changes made by this transaction.
changes,/// The selection set by this transaction, or undefined if it
/// doesn't explicitly set a selection.
selection,/// The effects added to the transaction.
effects,/// @internal
annotations,/// Whether the selection should be scrolled into view after this
/// transaction is dispatched.
scrollIntoView){this.startState=startState,this.changes=changes,this.selection=selection,this.effects=effects,this.annotations=annotations,this.scrollIntoView=scrollIntoView,this._doc=null,this._state=null,selection&&checkSelection(selection,changes.newLength),annotations.some(a=>a.type==Transaction.time)||(this.annotations=annotations.concat(Transaction.time.of(Date.now())))}/// The new document produced by the transaction. Contrary to
/// [`.state`](#state.Transaction.state)`.doc`, accessing this won't
/// force the entire new state to be computed right away, so it is
/// recommended that [transaction
/// filters](#state.EditorState^transactionFilter) use this getter
/// when they need to look at the new document.
get newDoc(){return this._doc||(this._doc=this.changes.apply(this.startState.doc))}/// The new selection produced by the transaction. If
/// [`this.selection`](#state.Transaction.selection) is undefined,
/// this will [map](#state.EditorSelection.map) the start state's
/// current selection through the changes made by the transaction.
get newSelection(){return this.selection||this.startState.selection.map(this.changes)}/// The new state created by the transaction. Computed on demand
/// (but retained for subsequent access), so itis recommended not to
/// access it in [transaction
/// filters](#state.EditorState^transactionFilter) when possible.
get state(){return this._state||this.startState.applyTransaction(this),this._state}/// Get the value of the given annotation type, if any.
annotation(type){for(let ann of this.annotations)if(ann.type==type)return ann.value}/// Indicates whether the transaction changed the document.
get docChanged(){return!this.changes.empty}/// Indicates whether this transaction reconfigures the state
/// (through a [configuration compartment](#state.Compartment) or
/// with a top-level configuration
/// [effect](#state.StateEffect^reconfigure).
get reconfigured(){return this.startState.config!=this.state.config}/// Returns true if the transaction has a [user
/// event](#state.Transaction^userEvent) annotation that is equal to
/// or more specific than `event`. For example, if the transaction
/// has `"select.pointer"` as user event, `"select"` and
/// `"select.pointer"` will match it.
isUserEvent(event){let e=this.annotation(Transaction.userEvent);return!!(e&&(e==event||e.length>event.length&&e.slice(0,event.length)==event&&"."==e[event.length]))}}/// Annotation used to store transaction timestamps.
Transaction.time=Annotation.define(),Transaction.userEvent=Annotation.define(),Transaction.addToHistory=Annotation.define(),Transaction.remote=Annotation.define();const none=[];exports.CharCategory=void 0,function(CharCategory){CharCategory[CharCategory.Word=0]="Word",CharCategory[CharCategory.Space=1]="Space",CharCategory[CharCategory.Other=2]="Other"}(exports.CharCategory||(exports.CharCategory={}));const nonASCIISingleCaseWordChar=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;let wordChar;try{wordChar=/[\p{Alphabetic}\p{Number}_]/u}catch(_){}class EditorState{/// @internal
constructor(/// @internal
config,/// The current document.
doc,/// The current selection.
selection,/// @internal
values,tr=null){this.config=config,this.doc=doc,this.selection=selection,this.values=values,this.applying=null,this.status=config.statusTemplate.slice(),this.applying=tr,tr&&(tr._state=this);for(let i=0;i<this.config.dynamicSlots.length;i++)ensureAddr(this,i<<1);this.applying=null}field(field,require=!0){let addr=this.config.address[field.id];if(null==addr){if(require)throw new RangeError("Field is not present in this state");return}return ensureAddr(this,addr),getAddr(this,addr)}/// Create a [transaction](#state.Transaction) that updates this
/// state. Any number of [transaction specs](#state.TransactionSpec)
/// can be passed. Unless
/// [`sequential`](#state.TransactionSpec.sequential) is set, the
/// [changes](#state.TransactionSpec.changes) (if any) of each spec
/// are assumed to start in the _current_ document (not the document
/// produced by previous specs), and its
/// [selection](#state.TransactionSpec.selection) and
/// [effects](#state.TransactionSpec.effects) are assumed to refer
/// to the document created by its _own_ changes. The resulting
/// transaction contains the combined effect of all the different
/// specs. For [selection](#state.TransactionSpec.selection), later
/// specs take precedence over earlier ones.
update(...specs){return resolveTransaction(this,specs,!0)}/// @internal
applyTransaction(tr){let conf=this.config,{base,compartments}=conf;for(let effect of tr.effects)effect.is(Compartment.reconfigure)?(conf&&(compartments=new Map,conf.compartments.forEach((val,key)=>compartments.set(key,val)),conf=null),compartments.set(effect.value.compartment,effect.value.extension)):effect.is(StateEffect.reconfigure)?(conf=null,base=effect.value):effect.is(StateEffect.appendConfig)&&(conf=null,base=asArray(base).concat(effect.value));let startValues;if(!conf){let resolved=Configuration.resolve(base,compartments,this);conf=resolved.configuration;let intermediateState=new EditorState(conf,this.doc,this.selection,resolved.values,null);startValues=intermediateState.values}else startValues=tr.startState.values.slice();new EditorState(conf,tr.newDoc,tr.newSelection,startValues,tr)}/// Create a [transaction spec](#state.TransactionSpec) that
/// replaces every selection range with the given content.
replaceSelection(text){return"string"==typeof text&&(text=this.toText(text)),this.changeByRange(range=>({changes:{from:range.from,to:range.to,insert:text},range:EditorSelection.cursor(range.from+text.length)}))}/// Create a set of changes and a new selection by running the given
/// function for each range in the active selection. The function
/// can return an optional set of changes (in the coordinate space
/// of the start document), plus an updated range (in the coordinate
/// space of the document produced by the call's own changes). This
/// method will merge all the changes and ranges into a single
/// changeset and selection, and return it as a [transaction
/// spec](#state.TransactionSpec), which can be passed to
/// [`update`](#state.EditorState.update).
changeByRange(f){let sel=this.selection,result1=f(sel.ranges[0]),changes=this.changes(result1.changes),ranges=[result1.range],effects=asArray(result1.effects);for(let i=1;i<sel.ranges.length;i++){let result=f(sel.ranges[i]),newChanges=this.changes(result.changes),newMapped=newChanges.map(changes);for(let j=0;j<i;j++)ranges[j]=ranges[j].map(newMapped);let mapBy=changes.mapDesc(newChanges,!0);ranges.push(result.range.map(mapBy)),changes=changes.compose(newMapped),effects=StateEffect.mapEffects(effects,newMapped).concat(StateEffect.mapEffects(asArray(result.effects),mapBy))}return{changes,selection:EditorSelection.create(ranges,sel.mainIndex),effects}}/// Create a [change set](#state.ChangeSet) from the given change
/// description, taking the state's document length and line
/// separator into account.
changes(spec=[]){return spec instanceof ChangeSet?spec:ChangeSet.of(spec,this.doc.length,this.facet(EditorState.lineSeparator))}/// Using the state's [line
/// separator](#state.EditorState^lineSeparator), create a
/// [`Text`](#text.Text) instance from the given string.
toText(string){return text.Text.of(string.split(this.facet(EditorState.lineSeparator)||DefaultSplit))}/// Return the given range of the document as a string.
sliceDoc(from=0,to=this.doc.length){return this.doc.sliceString(from,to,this.lineBreak)}/// Get the value of a state [facet](#state.Facet).
facet(facet){let addr=this.config.address[facet.id];return null==addr?facet.default:(ensureAddr(this,addr),getAddr(this,addr))}/// Convert this state to a JSON-serializable object. When custom
/// fields should be serialized, you can pass them in as an object
/// mapping property names (in the resulting object, which should
/// not use `doc` or `selection`) to fields.
toJSON(fields){let result={doc:this.sliceDoc(),selection:this.selection.toJSON()};if(fields)for(let prop in fields){let value=fields[prop];value instanceof StateField&&(result[prop]=value.spec.toJSON(this.field(fields[prop]),this))}return result}/// Deserialize a state from its JSON representation. When custom
/// fields should be deserialized, pass the same object you passed
/// to [`toJSON`](#state.EditorState.toJSON) when serializing as
/// third argument.
static fromJSON(json,config={},fields){if(!json||"string"!=typeof json.doc)throw new RangeError("Invalid JSON representation for EditorState");let fieldInit=[];if(fields)for(let prop in fields){let field=fields[prop],value=json[prop];fieldInit.push(field.init(state=>field.spec.fromJSON(value,state)))}return EditorState.create({doc:json.doc,selection:EditorSelection.fromJSON(json.selection),extensions:config.extensions?fieldInit.concat([config.extensions]):fieldInit})}/// Create a new state. You'll usually only need this when
/// initializing an editor—updated states are created by applying
/// transactions.
static create(config={}){let{configuration,values}=Configuration.resolve(config.extensions||[],new Map),doc=config.doc instanceof text.Text?config.doc:text.Text.of((config.doc||"").split(configuration.staticFacet(EditorState.lineSeparator)||DefaultSplit)),selection=config.selection?config.selection instanceof EditorSelection?config.selection:EditorSelection.single(config.selection.anchor,config.selection.head):EditorSelection.single(0);return checkSelection(selection,doc.length),configuration.staticFacet(allowMultipleSelections)||(selection=selection.asSingle()),new EditorState(configuration,doc,selection,values)}/// The size (in columns) of a tab in the document, determined by
/// the [`tabSize`](#state.EditorState^tabSize) facet.
get tabSize(){return this.facet(EditorState.tabSize)}/// Get the proper [line-break](#state.EditorState^lineSeparator)
/// string for this state.
get lineBreak(){return this.facet(EditorState.lineSeparator)||"\n"}/// Returns true when the editor is
/// [configured](#state.EditorState^readOnly) to be read-only.
get readOnly(){return this.facet(readOnly)}/// Look up a translation for the given phrase (via the
/// [`phrases`](#state.EditorState^phrases) facet), or return the
/// original string if no translation is found.
phrase(phrase){for(let map of this.facet(EditorState.phrases))if(Object.prototype.hasOwnProperty.call(map,phrase))return map[phrase];return phrase}/// Find the values for a given language data field, provided by the
/// the [`languageData`](#state.EditorState^languageData) facet.
languageDataAt(name,pos,side=-1){let values=[];for(let provider of this.facet(languageData))for(let result of provider(this,pos,side))Object.prototype.hasOwnProperty.call(result,name)&&values.push(result[name]);return values}/// Return a function that can categorize strings (expected to
/// represent a single [grapheme cluster](#text.findClusterBreak))
/// into one of:
///
///  - Word (contains an alphanumeric character or a character
///    explicitly listed in the local language's `"wordChars"`
///    language data, which should be a string)
///  - Space (contains only whitespace)
///  - Other (anything else)
charCategorizer(at){return makeCategorizer(this.languageDataAt("wordChars",at).join(""))}/// Find the word at the given position, meaning the range
/// containing all [word](#state.CharCategory.Word) characters
/// around it. If no word characters are adjacent to the position,
/// this returns null.
wordAt(pos){let{text:text$1,from,length}=this.doc.lineAt(pos),cat=this.charCategorizer(pos),start=pos-from,end=pos-from;for(;0<start;){let prev=text.findClusterBreak(text$1,start,!1);if(cat(text$1.slice(prev,start))!=exports.CharCategory.Word)break;start=prev}for(;end<length;){let next=text.findClusterBreak(text$1,end);if(cat(text$1.slice(end,next))!=exports.CharCategory.Word)break;end=next}return start==end?null:EditorSelection.range(start+from,end+from)}}/// A facet that, when enabled, causes the editor to allow multiple
/// ranges to be selected. Be careful though, because by default the
/// editor relies on the native DOM selection, which cannot handle
/// multiple selections. An extension like
/// [`drawSelection`](#view.drawSelection) can be used to make
/// secondary selections visible to the user.
return EditorState.allowMultipleSelections=allowMultipleSelections,EditorState.tabSize=Facet.define({combine:values=>values.length?values[0]:4}),EditorState.lineSeparator=lineSeparator,EditorState.readOnly=readOnly,EditorState.phrases=Facet.define(),EditorState.languageData=languageData,EditorState.changeFilter=changeFilter,EditorState.transactionFilter=transactionFilter,EditorState.transactionExtender=transactionExtender,Compartment.reconfigure=StateEffect.define(),Object.defineProperty(exports,"Text",{enumerable:!0,get:function(){return text.Text}}),exports.Annotation=Annotation,exports.AnnotationType=AnnotationType,exports.ChangeDesc=ChangeDesc,exports.ChangeSet=ChangeSet,exports.Compartment=Compartment,exports.EditorSelection=EditorSelection,exports.EditorState=EditorState,exports.Facet=Facet,exports.Prec=Prec,exports.SelectionRange=SelectionRange,exports.StateEffect=StateEffect,exports.StateEffectType=StateEffectType,exports.StateField=StateField,exports.Transaction=Transaction,exports.combineConfig=/// Utility function for combining behaviors to fill in a config
/// object from an array of provided configs. Will, by default, error
/// when a field gets two values that aren't `===`-equal, but you can
/// provide combine functions per field to do something else.
function(configs,defaults,// Should hold only the optional properties of Config, but I haven't managed to express that
combine={}){let result={};for(let config of configs)for(let key of Object.keys(config)){let value=config[key],current=result[key];if(void 0===current)result[key]=value;else if(current===value||void 0===value);// No conflict
else if(Object.hasOwnProperty.call(combine,key))result[key]=combine[key](current,value);else throw new Error("Config merge conflict for field "+key)}for(let key in defaults)void 0===result[key]&&(result[key]=defaults[key]);return result},exports}