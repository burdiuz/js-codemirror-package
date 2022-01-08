async function moduleInitFunction(require,exports={}){// Tokenizer data is stored a big uint16 array containing, for each
// state:
//
//  - A group bitmask, indicating what token groups are reachable from
//    this state, so that paths that can only lead to tokens not in
//    any of the current groups can be cut off early.
//
//  - The position of the end of the state's sequence of accepting
//    tokens
//
//  - The number of outgoing edges for the state
//
//  - The accepting tokens, as (token id, group mask) pairs
//
//  - The outgoing edges, as (start character, end character, state
//    index) triples, with end character being exclusive
//
// This function interprets that data, running through a stream as
// long as new states with the a matching group mask can be reached,
// and updating `token` when it matches a token.
function readToken(data,input,stack,group){let state=0,groupMask=1<<group,{parser}=stack.p,{dialect}=parser;scan:for(;;){if(0==(groupMask&data[state]))break;let accEnd=data[state+1];// Check whether this state can lead to a token in the current group
// Accept tokens in this state, possibly overwriting
// lower-precedence / shorter tokens
for(let i=state+3;i<accEnd;i+=2)if(0<(data[i+1]&groupMask)){let term=data[i];if(dialect.allows(term)&&(-1==input.token.value||input.token.value==term||parser.overrides(term,input.token.value))){input.acceptToken(term);break}}// Do a binary search on the state's edges
for(let next=input.next,low=0,high=data[state+2];low<high;){let mid=low+high>>1,index=accEnd+mid+(mid<<1),from=data[index],to=data[index+1];if(next<from)high=mid;else if(next>=to)low=mid+1;else{state=data[index+2],input.advance();continue scan}}break}}// See lezer-generator/src/encode.ts for comments about the encoding
// used here
function decodeArray(input,Type=Uint16Array){if("string"!=typeof input)return input;let array=null;for(let value,pos=0,out=0;pos<input.length;){for(value=0;;){let next=input.charCodeAt(pos++),stop=!1;if(126==next/* BigValCode */){value=65535/* BigVal */;break}92<=next/* Gap2 */&&next--,34<=next/* Gap1 */&&next--;let digit=next-32/* Start */;if(46<=digit/* Base */&&(digit-=46/* Base */,stop=!0),value+=digit,stop)break;value*=46/* Base */}array?array[out++]=value:array=new Type(value)}return array}// FIXME find some way to reduce recovery work done when the input
// doesn't match the grammar at all.
// Environment variable used to control console output
function cutAt(tree,pos,side){let cursor=tree.fullCursor();for(cursor.moveTo(pos);;)if(0>side?!cursor.childBefore(pos):!cursor.childAfter(pos))for(;;){if((0>side?cursor.to<pos:cursor.from>pos)&&!cursor.type.isError)return 0>side?Math.max(0,Math.min(cursor.to-1,pos-25/* Margin */)):Math.min(tree.length,Math.max(cursor.from+1,pos+25/* Margin */));if(0>side?cursor.prevSibling():cursor.nextSibling())break;if(!cursor.parent())return 0>side?0:tree.length}}function pushStackDedup(stack,newStacks){for(let other,i=0;i<newStacks.length;i++)if(other=newStacks[i],other.pos==stack.pos&&other.sameState(stack))return void(newStacks[i].score<stack.score&&(newStacks[i]=stack));newStacks.push(stack)}function pair(data,off){return data[off]|data[off+1]<<16}function findOffset(data,start,term){for(let next,i=start;65535!=(next=data[i])/* End */;i++)if(next==term)return i-start;return-1}function findFinished(stacks){let best=null;for(let stack of stacks){let stopped=stack.p.stoppedAt;(stack.pos==stack.p.stream.end||null!=stopped&&stack.pos>stopped)&&stack.p.parser.stateFlag(stack.state,2/* Accepting */)&&(!best||best.score<stack.score)&&(best=stack)}return best}Object.defineProperty(exports,"__esModule",{value:!0});var common=await require("@lezer/common");/// A parse stack. These are used internally by the parser to track
/// parsing progress. They also provide some properties and methods
/// that external code such as a tokenizer can use to get information
/// about the parse state.
class Stack{/// @internal
constructor(/// The parse that this stack is part of @internal
p,/// Holds state, input pos, buffer index triplets for all but the
/// top state @internal
stack,/// The current parse state @internal
state,// The position at which the next reduce should take place. This
// can be less than `this.pos` when skipped expressions have been
// added to the stack (which should be moved outside of the next
// reduction)
/// @internal
reducePos,/// The input position up to which this stack has parsed.
pos,/// The dynamic score of the stack, including dynamic precedence
/// and error-recovery penalties
/// @internal
score,// The output buffer. Holds (type, start, end, size) quads
// representing nodes created by the parser, where `size` is
// amount of buffer array entries covered by this node.
/// @internal
buffer,// The base offset of the buffer. When stacks are split, the split
// instance shared the buffer history with its parent up to
// `bufferBase`, which is the absolute offset (including the
// offset of previous splits) into the buffer at which this stack
// starts writing.
/// @internal
bufferBase,/// @internal
curContext,/// @internal
lookAhead=0,// A parent stack from which this was split off, if any. This is
// set up so that it always points to a stack that has some
// additional buffer content, never to a stack with an equal
// `bufferBase`.
/// @internal
parent){this.p=p,this.stack=stack,this.state=state,this.reducePos=reducePos,this.pos=pos,this.score=score,this.buffer=buffer,this.bufferBase=bufferBase,this.curContext=curContext,this.lookAhead=lookAhead,this.parent=parent}/// @internal
toString(){return`[${this.stack.filter((_,i)=>0==i%3).concat(this.state)}]@${this.pos}${this.score?"!"+this.score:""}`}// Start an empty stack
/// @internal
static start(p,state,pos=0){let cx=p.parser.context;return new Stack(p,[],state,pos,pos,0,[],0,cx?new StackContext(cx,cx.start):null,0,null)}/// The stack's current [context](#lr.ContextTracker) value, if
/// any. Its type will depend on the context tracker's type
/// parameter, or it will be `null` if there is no context
/// tracker.
get context(){return this.curContext?this.curContext.context:null}// Push a state onto the stack, tracking its start position as well
// as the buffer base at that point.
/// @internal
pushState(state,start){this.stack.push(this.state,start,this.bufferBase+this.buffer.length),this.state=state}// Apply a reduce action
/// @internal
reduce(action){let depth=action>>19/* ReduceDepthShift */,type=65535&action/* ValueMask */,{parser}=this.p,dPrec=parser.dynamicPrecedence(type);if(dPrec&&(this.score+=dPrec),0==depth)return type<parser.minRepeatTerm&&this.storeNode(type,this.reducePos,this.reducePos,4,!0),this.pushState(parser.getGoto(this.state,type,!0),this.reducePos),void this.reduceContext(type,this.reducePos);// Find the base index into `this.stack`, content after which will
// be dropped. Note that with `StayFlag` reductions we need to
// consume two extra frames (the dummy parent node for the skipped
// expression and the state that we'll be staying in, which should
// be moved to `this.state`).
let base=this.stack.length-3*(depth-1)-(262144&action/* StayFlag */?6:0),start=this.stack[base-2],bufferBase=this.stack[base-1],count=this.bufferBase+this.buffer.length-bufferBase;// Store normal terms or `R -> R R` repeat reductions
if(type<parser.minRepeatTerm||131072&action/* RepeatFlag */){let pos=parser.stateFlag(this.state,1/* Skipped */)?this.pos:this.reducePos;this.storeNode(type,start,pos,count+4,!0)}if(262144&action/* StayFlag */)this.state=this.stack[base];else{let baseStateID=this.stack[base-3];this.state=parser.getGoto(baseStateID,type,!0)}for(;this.stack.length>base;)this.stack.pop();this.reduceContext(type,start)}// Shift a value into the buffer
/// @internal
storeNode(term,start,end,size=4,isReduce=!1){if(0==term/* Err */){// Try to omit/merge adjacent error nodes
let cur=this,top=this.buffer.length;if(0==top&&cur.parent&&(top=cur.bufferBase-cur.parent.bufferBase,cur=cur.parent),0<top&&0==cur.buffer[top-4]/* Err */&&-1<cur.buffer[top-1]){if(start==end)return;if(cur.buffer[top-2]>=start)return void(cur.buffer[top-2]=end)}}if(!isReduce||this.pos==end)this.buffer.push(term,start,end,size);else{// There may be skipped nodes that have to be moved forward
let index=this.buffer.length;if(0<index&&0!=this.buffer[index-4]/* Err */)for(;0<index&&this.buffer[index-2]>end;)// Move this record forward
this.buffer[index]=this.buffer[index-4],this.buffer[index+1]=this.buffer[index-3],this.buffer[index+2]=this.buffer[index-2],this.buffer[index+3]=this.buffer[index-1],index-=4,4<size&&(size-=4);this.buffer[index]=term,this.buffer[index+1]=start,this.buffer[index+2]=end,this.buffer[index+3]=size}}// Apply a shift action
/// @internal
shift(action,next,nextEnd){let start=this.pos;if(131072&action/* GotoFlag */)this.pushState(65535&action/* ValueMask */,this.pos);else if(0==(262144&action/* StayFlag */)){// Regular shift
let nextState=action,{parser}=this.p;(nextEnd>this.pos||next<=parser.maxNode)&&(this.pos=nextEnd,!parser.stateFlag(nextState,1/* Skipped */)&&(this.reducePos=nextEnd)),this.pushState(nextState,start),this.shiftContext(next,start),next<=parser.maxNode&&this.buffer.push(next,start,nextEnd,4)}else// Shift-and-stay, which means this is a skipped token
this.pos=nextEnd,this.shiftContext(next,start),next<=this.p.parser.maxNode&&this.buffer.push(next,start,nextEnd,4)}// Apply an action
/// @internal
apply(action,next,nextEnd){65536&action/* ReduceFlag */?this.reduce(action):this.shift(action,next,nextEnd)}// Add a prebuilt (reused) node into the buffer. @internal
useNode(value,next){let index=this.p.reused.length-1;(0>index||this.p.reused[index]!=value)&&(this.p.reused.push(value),index++);let start=this.pos;this.reducePos=this.pos=start+value.length,this.pushState(next,start),this.buffer.push(index,start,this.reducePos,-1/* size == -1 means this is a reused value */),this.curContext&&this.updateContext(this.curContext.tracker.reuse(this.curContext.context,value,this,this.p.stream.reset(this.pos-value.length)))}// Split the stack. Due to the buffer sharing and the fact
// that `this.stack` tends to stay quite shallow, this isn't very
// expensive.
/// @internal
split(){let parent=this,off=parent.buffer.length;// Because the top of the buffer (after this.pos) may be mutated
// to reorder reductions and skipped tokens, and shared buffers
// should be immutable, this copies any outstanding skipped tokens
// to the new buffer, and puts the base pointer before them.
for(;0<off&&parent.buffer[off-2]>parent.reducePos;)off-=4;let buffer=parent.buffer.slice(off),base=parent.bufferBase+off;// Make sure parent points to an actual parent with content, if there is such a parent.
for(;parent&&base==parent.bufferBase;)parent=parent.parent;return new Stack(this.p,this.stack.slice(),this.state,this.reducePos,this.pos,this.score,buffer,base,this.curContext,this.lookAhead,parent)}// Try to recover from an error by 'deleting' (ignoring) one token.
/// @internal
recoverByDelete(next,nextEnd){let isNode=next<=this.p.parser.maxNode;isNode&&this.storeNode(next,this.pos,nextEnd,4),this.storeNode(0/* Err */,this.pos,nextEnd,isNode?8:4),this.pos=this.reducePos=nextEnd,this.score-=190/* Delete */}/// Check if the given term would be able to be shifted (optionally
/// after some reductions) on this stack. This can be useful for
/// external tokenizers that want to make sure they only provide a
/// given token when it applies.
canShift(term){for(let action,sim=new SimulatedStack(this);;){if(action=this.p.parser.stateSlot(sim.state,4/* DefaultReduce */)||this.p.parser.hasAction(sim.state,term),0==(65536&action/* ReduceFlag */))return!0;if(0==action)return!1;sim.reduce(action)}}// Apply up to Recover.MaxNext recovery actions that conceptually
// inserts some missing token or rule.
/// @internal
recoverByInsert(next){if(300<=this.stack.length/* MaxInsertStackDepth */)return[];let nextStates=this.p.parser.nextStates(this.state);if(8<nextStates.length||120<=this.stack.length/* DampenInsertStackDepth */){let best=[];for(let s,i=0;i<nextStates.length;i+=2)(s=nextStates[i+1])!=this.state&&this.p.parser.hasAction(s,next)&&best.push(nextStates[i],s);if(120>this.stack.length/* DampenInsertStackDepth */)for(let s,i=0;8>best.length&&i<nextStates.length;i+=2)s=nextStates[i+1],best.some((v,i)=>1&i&&v==s)||best.push(nextStates[i],s);nextStates=best}let result=[];for(let s,i=0;i<nextStates.length&&4>result.length/* MaxNext */;i+=2){if(s=nextStates[i+1],s==this.state)continue;let stack=this.split();stack.storeNode(0/* Err */,stack.pos,stack.pos,4,!0),stack.pushState(s,this.pos),stack.shiftContext(nextStates[i],this.pos),stack.score-=200/* Insert */,result.push(stack)}return result}// Force a reduce, if possible. Return false if that can't
// be done.
/// @internal
forceReduce(){let reduce=this.p.parser.stateSlot(this.state,5/* ForcedReduce */);if(0==(65536&reduce/* ReduceFlag */))return!1;let{parser}=this.p;if(!parser.validAction(this.state,reduce)){let target=this.stack.length-3*(reduce>>19);if(0>target||0>parser.getGoto(this.stack[target],65535&reduce,!1))return!1;this.storeNode(0/* Err */,this.reducePos,this.reducePos,4,!0),this.score-=100/* Reduce */}return this.reduce(reduce),!0}/// @internal
forceAll(){for(;!this.p.parser.stateFlag(this.state,2/* Accepting */);)if(!this.forceReduce()){this.storeNode(0/* Err */,this.pos,this.pos,4,!0);break}return this}/// Check whether this state has no further actions (assumed to be a direct descendant of the
/// top state, since any other states must be able to continue
/// somehow). @internal
get deadEnd(){if(3!=this.stack.length)return!1;let{parser}=this.p;return 65535==parser.data[parser.stateSlot(this.state,1/* Actions */)]/* End */&&!parser.stateSlot(this.state,4/* DefaultReduce */)}/// Restart the stack (put it back in its start state). Only safe
/// when this.stack.length == 3 (state is directly below the top
/// state). @internal
restart(){this.state=this.stack[0],this.stack.length=0}/// @internal
sameState(other){if(this.state!=other.state||this.stack.length!=other.stack.length)return!1;for(let i=0;i<this.stack.length;i+=3)if(this.stack[i]!=other.stack[i])return!1;return!0}/// Get the parser used by this stack.
get parser(){return this.p.parser}/// Test whether a given dialect (by numeric ID, as exported from
/// the terms file) is enabled.
dialectEnabled(dialectID){return this.p.parser.dialect.flags[dialectID]}shiftContext(term,start){this.curContext&&this.updateContext(this.curContext.tracker.shift(this.curContext.context,term,this,this.p.stream.reset(start)))}reduceContext(term,start){this.curContext&&this.updateContext(this.curContext.tracker.reduce(this.curContext.context,term,this,this.p.stream.reset(start)))}/// @internal
emitContext(){let last=this.buffer.length-1;(0>last||-3!=this.buffer[last])&&this.buffer.push(this.curContext.hash,this.reducePos,this.reducePos,-3)}/// @internal
emitLookAhead(){let last=this.buffer.length-1;(0>last||-4!=this.buffer[last])&&this.buffer.push(this.lookAhead,this.reducePos,this.reducePos,-4)}updateContext(context){if(context!=this.curContext.context){let newCx=new StackContext(this.curContext.tracker,context);newCx.hash!=this.curContext.hash&&this.emitContext(),this.curContext=newCx}}/// @internal
setLookAhead(lookAhead){lookAhead>this.lookAhead&&(this.emitLookAhead(),this.lookAhead=lookAhead)}/// @internal
close(){this.curContext&&this.curContext.tracker.strict&&this.emitContext(),0<this.lookAhead&&this.emitLookAhead()}}class StackContext{constructor(tracker,context){this.tracker=tracker,this.context=context,this.hash=tracker.strict?tracker.hash(context):0}}var Recover;(function(Recover){Recover[Recover.Insert=200]="Insert",Recover[Recover.Delete=190]="Delete",Recover[Recover.Reduce=100]="Reduce",Recover[Recover.MaxNext=4]="MaxNext",Recover[Recover.MaxInsertStackDepth=300]="MaxInsertStackDepth",Recover[Recover.DampenInsertStackDepth=120]="DampenInsertStackDepth"})(Recover||(Recover={}));// Used to cheaply run some reductions to scan ahead without mutating
// an entire stack
class SimulatedStack{constructor(start){this.start=start,this.state=start.state,this.stack=start.stack,this.base=this.stack.length}reduce(action){let depth=action>>19/* ReduceDepthShift */;0==depth?(this.stack==this.start.stack&&(this.stack=this.stack.slice()),this.stack.push(this.state,0,0),this.base+=3):this.base-=3*(depth-1);let goto=this.start.p.parser.getGoto(this.stack[this.base-3],65535&action,!0);this.state=goto}}// This is given to `Tree.build` to build a buffer, and encapsulates
// the parent-stack-walking necessary to read the nodes.
class StackBufferCursor{constructor(stack,pos,index){this.stack=stack,this.pos=pos,this.index=index,this.buffer=stack.buffer,0==this.index&&this.maybeNext()}static create(stack,pos=stack.bufferBase+stack.buffer.length){return new StackBufferCursor(stack,pos,pos-stack.bufferBase)}maybeNext(){let next=this.stack.parent;null!=next&&(this.index=this.stack.bufferBase-next.bufferBase,this.stack=next,this.buffer=next.buffer)}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}next(){this.index-=4,this.pos-=4,0==this.index&&this.maybeNext()}fork(){return new StackBufferCursor(this.stack,this.pos,this.index)}}class CachedToken{constructor(){this.start=-1,this.value=-1,this.end=-1,this.extended=-1,this.lookAhead=0,this.mask=0,this.context=0}}const nullToken=new CachedToken;/// [Tokenizers](#lr.ExternalTokenizer) interact with the input
/// through this interface. It presents the input as a stream of
/// characters, tracking lookahead and hiding the complexity of
/// [ranges](#common.Parser.parse^ranges) from tokenizer code.
class InputStream{/// @internal
constructor(/// @internal
input,/// @internal
ranges){this.input=input,this.ranges=ranges,this.chunk="",this.chunkOff=0,this.chunk2="",this.chunk2Pos=0,this.next=-1,this.token=nullToken,this.rangeIndex=0,this.pos=this.chunkPos=ranges[0].from,this.range=ranges[0],this.end=ranges[ranges.length-1].to,this.readNext()}resolveOffset(offset,assoc){let range=this.range,index=this.rangeIndex,pos=this.pos+offset;for(;pos<range.from;){if(!index)return null;let next=this.ranges[--index];pos-=range.from-next.to,range=next}for(;0>assoc?pos>range.to:pos>=range.to;){if(index==this.ranges.length-1)return null;let next=this.ranges[++index];pos+=next.from-range.to,range=next}return pos}/// Look at a code unit near the stream position. `.peek(0)` equals
/// `.next`, `.peek(-1)` gives you the previous character, and so
/// on.
///
/// Note that looking around during tokenizing creates dependencies
/// on potentially far-away content, which may reduce the
/// effectiveness incremental parsing—when looking forward—or even
/// cause invalid reparses when looking backward more than 25 code
/// units, since the library does not track lookbehind.
peek(offset){let pos,result,idx=this.chunkOff+offset;if(0<=idx&&idx<this.chunk.length)pos=this.pos+offset,result=this.chunk.charCodeAt(idx);else{let resolved=this.resolveOffset(offset,1);if(null==resolved)return-1;if(pos=resolved,pos>=this.chunk2Pos&&pos<this.chunk2Pos+this.chunk2.length)result=this.chunk2.charCodeAt(pos-this.chunk2Pos);else{let i=this.rangeIndex,range=this.range;for(;range.to<=pos;)range=this.ranges[++i];this.chunk2=this.input.chunk(this.chunk2Pos=pos),pos+this.chunk2.length>range.to&&(this.chunk2=this.chunk2.slice(0,range.to-pos)),result=this.chunk2.charCodeAt(0)}}return pos>=this.token.lookAhead&&(this.token.lookAhead=pos+1),result}/// Accept a token. By default, the end of the token is set to the
/// current stream position, but you can pass an offset (relative to
/// the stream position) to change that.
acceptToken(token,endOffset=0){let end=endOffset?this.resolveOffset(endOffset,-1):this.pos;if(null==end||end<this.token.start)throw new RangeError("Token end out of bounds");this.token.value=token,this.token.end=end}getChunk(){if(this.pos>=this.chunk2Pos&&this.pos<this.chunk2Pos+this.chunk2.length){let{chunk,chunkPos}=this;this.chunk=this.chunk2,this.chunkPos=this.chunk2Pos,this.chunk2=chunk,this.chunk2Pos=chunkPos,this.chunkOff=this.pos-this.chunkPos}else{this.chunk2=this.chunk,this.chunk2Pos=this.chunkPos;let nextChunk=this.input.chunk(this.pos),end=this.pos+nextChunk.length;this.chunk=end>this.range.to?nextChunk.slice(0,this.range.to-this.pos):nextChunk,this.chunkPos=this.pos,this.chunkOff=0}}readNext(){return this.chunkOff>=this.chunk.length&&(this.getChunk(),this.chunkOff==this.chunk.length)?this.next=-1:this.next=this.chunk.charCodeAt(this.chunkOff)}/// Move the stream forward N (defaults to 1) code units. Returns
/// the new value of [`next`](#lr.InputStream.next).
advance(n=1){for(this.chunkOff+=n;this.pos+n>=this.range.to;){if(this.rangeIndex==this.ranges.length-1)return this.setDone();n-=this.range.to-this.pos,this.range=this.ranges[++this.rangeIndex],this.pos=this.range.from}return this.pos+=n,this.pos>=this.token.lookAhead&&(this.token.lookAhead=this.pos+1),this.readNext()}setDone(){return this.pos=this.chunkPos=this.end,this.range=this.ranges[this.rangeIndex=this.ranges.length-1],this.chunk="",this.next=-1}/// @internal
reset(pos,token){if(token?(this.token=token,token.start=pos,token.lookAhead=pos+1,token.value=token.extended=-1):this.token=nullToken,this.pos!=pos){if(this.pos=pos,pos==this.end)return this.setDone(),this;for(;pos<this.range.from;)this.range=this.ranges[--this.rangeIndex];for(;pos>=this.range.to;)this.range=this.ranges[++this.rangeIndex];pos>=this.chunkPos&&pos<this.chunkPos+this.chunk.length?this.chunkOff=pos-this.chunkPos:(this.chunk="",this.chunkOff=0),this.readNext()}return this}/// @internal
read(from,to){if(from>=this.chunkPos&&to<=this.chunkPos+this.chunk.length)return this.chunk.slice(from-this.chunkPos,to-this.chunkPos);if(from>=this.range.from&&to<=this.range.to)return this.input.read(from,to);let result="";for(let r of this.ranges){if(r.from>=to)break;r.to>from&&(result+=this.input.read(Math.max(r.from,from),Math.min(r.to,to)))}return result}}/// @internal
class TokenGroup{constructor(data,id){this.data=data,this.id=id}token(input,stack){readToken(this.data,input,stack,this.id)}}TokenGroup.prototype.contextual=TokenGroup.prototype.fallback=TokenGroup.prototype.extend=!1;const verbose="undefined"!=typeof process&&/\bparse\b/.test(process.env.LOG);let stackIDs=null;var Safety;(function(Safety){Safety[Safety.Margin=25]="Margin"})(Safety||(Safety={}));class FragmentCursor{constructor(fragments,nodeSet){this.fragments=fragments,this.nodeSet=nodeSet,this.i=0,this.fragment=null,this.safeFrom=-1,this.safeTo=-1,this.trees=[],this.start=[],this.index=[],this.nextFragment()}nextFragment(){let fr=this.fragment=this.i==this.fragments.length?null:this.fragments[this.i++];if(fr){for(this.safeFrom=fr.openStart?cutAt(fr.tree,fr.from+fr.offset,1)-fr.offset:fr.from,this.safeTo=fr.openEnd?cutAt(fr.tree,fr.to+fr.offset,-1)-fr.offset:fr.to;this.trees.length;)this.trees.pop(),this.start.pop(),this.index.pop();this.trees.push(fr.tree),this.start.push(-fr.offset),this.index.push(0),this.nextStart=this.safeFrom}else this.nextStart=1e9}// `pos` must be >= any previously given `pos` for this cursor
nodeAt(pos){if(pos<this.nextStart)return null;for(;this.fragment&&this.safeTo<=pos;)this.nextFragment();if(!this.fragment)return null;for(;;){let last=this.trees.length-1;if(0>last)return this.nextFragment(),null;let top=this.trees[last],index=this.index[last];if(index==top.children.length){this.trees.pop(),this.start.pop(),this.index.pop();continue}let next=top.children[index],start=this.start[last]+top.positions[index];if(start>pos)return this.nextStart=start,null;if(next instanceof common.Tree){if(start==pos){if(start<this.safeFrom)return null;let end=start+next.length;if(end<=this.safeTo){let lookAhead=next.prop(common.NodeProp.lookAhead);if(!lookAhead||end+lookAhead<this.fragment.to)return next}}this.index[last]++,start+next.length>=Math.max(this.safeFrom,pos)&&(this.trees.push(next),this.start.push(start),this.index.push(0))}else this.index[last]++,this.nextStart=start+next.length}}}class TokenCache{constructor(parser,stream){this.stream=stream,this.tokens=[],this.mainToken=null,this.actions=[],this.tokens=parser.tokenizers.map(()=>new CachedToken)}getActions(stack){let actionIndex=0,main=null,{parser}=stack.p,{tokenizers}=parser,mask=parser.stateSlot(stack.state,3/* TokenizerMask */),context=stack.curContext?stack.curContext.hash:0,lookAhead=0;for(let i=0;i<tokenizers.length;i++){if(0==(1<<i&mask))continue;let tokenizer=tokenizers[i],token=this.tokens[i];if((!main||tokenizer.fallback)&&((tokenizer.contextual||token.start!=stack.pos||token.mask!=mask||token.context!=context)&&(this.updateCachedToken(token,tokenizer,stack),token.mask=mask,token.context=context),token.lookAhead>token.end+25/* Margin */&&(lookAhead=Math.max(token.lookAhead,lookAhead)),0!=token.value/* Err */)){let startIndex=actionIndex;if(-1<token.extended&&(actionIndex=this.addActions(stack,token.extended,token.end,actionIndex)),actionIndex=this.addActions(stack,token.value,token.end,actionIndex),!tokenizer.extend&&(main=token,actionIndex>startIndex))break}}for(;this.actions.length>actionIndex;)this.actions.pop();return lookAhead&&stack.setLookAhead(lookAhead),main||stack.pos!=this.stream.end||(main=new CachedToken,main.value=stack.p.parser.eofTerm,main.start=main.end=stack.pos,actionIndex=this.addActions(stack,main.value,main.end,actionIndex)),this.mainToken=main,this.actions}getMainToken(stack){if(this.mainToken)return this.mainToken;let main=new CachedToken,{pos,p}=stack;return main.start=pos,main.end=Math.min(pos+1,p.stream.end),main.value=pos==p.stream.end?p.parser.eofTerm:0/* Err */,main}updateCachedToken(token,tokenizer,stack){if(tokenizer.token(this.stream.reset(stack.pos,token),stack),-1<token.value){let{parser}=stack.p;for(let i=0;i<parser.specialized.length;i++)if(parser.specialized[i]==token.value){let result=parser.specializers[i](this.stream.read(token.start,token.end),stack);if(0<=result&&stack.p.parser.dialect.allows(result>>1)){0==(1&result)/* Specialize */?token.value=result>>1:token.extended=result>>1;break}}}else token.value=0/* Err */,token.end=Math.min(stack.p.stream.end,stack.pos+1)}putAction(action,token,end,index){// Don't add duplicate actions
for(let i=0;i<index;i+=3)if(this.actions[i]==action)return index;return this.actions[index++]=action,this.actions[index++]=token,this.actions[index++]=end,index}addActions(stack,token,end,index){let{state}=stack,{parser}=stack.p,{data}=parser;for(let set=0;2>set;set++)for(let i=parser.stateSlot(state,set?2/* Skip */:1/* Actions */);;i+=3){if(65535==data[i]/* End */)if(1==data[i+1]/* Next */)i=pair(data,i+2);else{0==index&&2==data[i+1]/* Other */&&(index=this.putAction(pair(data,i+1),token,end,index));break}data[i]==token&&(index=this.putAction(pair(data,i+1),token,end,index))}return index}}var Rec;(function(Rec){Rec[Rec.Distance=5]="Distance",Rec[Rec.MaxRemainingPerStep=3]="MaxRemainingPerStep",Rec[Rec.MinBufferLengthPrune=200]="MinBufferLengthPrune",Rec[Rec.ForceReduceLimit=10]="ForceReduceLimit"})(Rec||(Rec={}));class Parse{constructor(parser,input,fragments,ranges){this.parser=parser,this.input=input,this.ranges=ranges,this.recovering=0,this.nextStackID=9812,this.minStackPos=0,this.reused=[],this.stoppedAt=null,this.stream=new InputStream(input,ranges),this.tokens=new TokenCache(parser,this.stream),this.topTerm=parser.top[1];let{from}=ranges[0];this.stacks=[Stack.start(this,parser.top[0],from)],this.fragments=fragments.length&&this.stream.end-from>4*parser.bufferLength?new FragmentCursor(fragments,parser.nodeSet):null}get parsedPos(){return this.minStackPos}// Move the parser forward. This will process all parse stacks at
// `this.pos` and try to advance them to a further position. If no
// stack for such a position is found, it'll start error-recovery.
//
// When the parse is finished, this will return a syntax tree. When
// not, it returns `null`.
advance(){let stopped,stoppedTokens,stacks=this.stacks,pos=this.minStackPos,newStacks=this.stacks=[];// This will hold stacks beyond `pos`.
// Keep advancing any stacks at `pos` until they either move
// forward or can't be advanced. Gather stacks that can't be
// advanced further in `stopped`.
for(let stack,i=0;i<stacks.length;i++)for(stack=stacks[i];;){if(this.tokens.mainToken=null,stack.pos>pos)newStacks.push(stack);else if(this.advanceStack(stack,newStacks,stacks))continue;else{stopped||(stopped=[],stoppedTokens=[]),stopped.push(stack);let tok=this.tokens.getMainToken(stack);stoppedTokens.push(tok.value,tok.end)}break}if(!newStacks.length){let finished=stopped&&findFinished(stopped);if(finished)return this.stackToTree(finished);if(this.parser.strict)throw verbose&&stopped&&console.log("Stuck with token "+(this.tokens.mainToken?this.parser.getName(this.tokens.mainToken.value):"none")),new SyntaxError("No parse at "+pos);this.recovering||(this.recovering=5/* Distance */)}if(this.recovering&&stopped){let finished=null!=this.stoppedAt&&stopped[0].pos>this.stoppedAt?stopped[0]:this.runRecovery(stopped,stoppedTokens,newStacks);if(finished)return this.stackToTree(finished.forceAll())}if(this.recovering){let maxRemaining=1==this.recovering?1:3*this.recovering/* MaxRemainingPerStep */;if(newStacks.length>maxRemaining)for(newStacks.sort((a,b)=>b.score-a.score);newStacks.length>maxRemaining;)newStacks.pop();newStacks.some(s=>s.reducePos>pos)&&this.recovering--}else if(1<newStacks.length)// Prune stacks that are in the same state, or that have been
// running without splitting for a while, to avoid getting stuck
// with multiple successful stacks running endlessly on.
outer:for(let stack,i=0;i<newStacks.length-1;i++){stack=newStacks[i];for(let other,j=i+1;j<newStacks.length;j++)if(other=newStacks[j],stack.sameState(other)||200<stack.buffer.length/* MinBufferLengthPrune */&&200<other.buffer.length/* MinBufferLengthPrune */)if(0<(stack.score-other.score||stack.buffer.length-other.buffer.length))newStacks.splice(j--,1);else{newStacks.splice(i--,1);continue outer}}this.minStackPos=newStacks[0].pos;for(let i=1;i<newStacks.length;i++)newStacks[i].pos<this.minStackPos&&(this.minStackPos=newStacks[i].pos);return null}stopAt(pos){if(null!=this.stoppedAt&&this.stoppedAt<pos)throw new RangeError("Can't move stoppedAt forward");this.stoppedAt=pos}// Returns an updated version of the given stack, or null if the
// stack can't advance normally. When `split` and `stacks` are
// given, stacks split off by ambiguous operations will be pushed to
// `split`, or added to `stacks` if they move `pos` forward.
advanceStack(stack,stacks,split){let start=stack.pos,{parser}=this,base=verbose?this.stackID(stack)+" -> ":"";if(null!=this.stoppedAt&&start>this.stoppedAt)return stack.forceReduce()?stack:null;if(this.fragments){let strictCx=stack.curContext&&stack.curContext.tracker.strict,cxHash=strictCx?stack.curContext.hash:0;for(let match,cached=this.fragments.nodeAt(start);cached;){if(match=this.parser.nodeSet.types[cached.type.id]==cached.type?parser.getGoto(stack.state,cached.type.id):-1,-1<match&&cached.length&&(!strictCx||(cached.prop(common.NodeProp.contextHash)||0)==cxHash))return stack.useNode(cached,match),verbose&&console.log(base+this.stackID(stack)+` (via reuse of ${parser.getName(cached.type.id)})`),!0;if(!(cached instanceof common.Tree)||0==cached.children.length||0<cached.positions[0])break;let inner=cached.children[0];if(inner instanceof common.Tree&&0==cached.positions[0])cached=inner;else break}}let defaultReduce=parser.stateSlot(stack.state,4/* DefaultReduce */);if(0<defaultReduce)return stack.reduce(defaultReduce),verbose&&console.log(base+this.stackID(stack)+` (via always-reduce ${parser.getName(65535&defaultReduce/* ValueMask */)})`),!0;let actions=this.tokens.getActions(stack);for(let i=0;i<actions.length;){let action=actions[i++],term=actions[i++],end=actions[i++],last=i==actions.length||!split,localStack=last?stack:stack.split();if(localStack.apply(action,term,end),verbose&&console.log(base+this.stackID(localStack)+` (via ${0==(65536&action/* ReduceFlag */)?"shift":`reduce of ${parser.getName(65535&action/* ValueMask */)}`} for ${parser.getName(term)} @ ${start}${localStack==stack?"":", split"})`),last)return!0;localStack.pos>start?stacks.push(localStack):split.push(localStack)}return!1}// Advance a given stack forward as far as it will go. Returns the
// (possibly updated) stack if it got stuck, or null if it moved
// forward and was given to `pushStackDedup`.
advanceFully(stack,newStacks){for(let pos=stack.pos;;){if(!this.advanceStack(stack,null,null))return!1;if(stack.pos>pos)return pushStackDedup(stack,newStacks),!0}}runRecovery(stacks,tokens,newStacks){let finished=null,restarted=!1;for(let i=0;i<stacks.length;i++){let stack=stacks[i],token=tokens[i<<1],tokenEnd=tokens[(i<<1)+1],base=verbose?this.stackID(stack)+" -> ":"";if(stack.deadEnd){if(restarted)continue;restarted=!0,stack.restart(),verbose&&console.log(base+this.stackID(stack)+" (restarted)");let done=this.advanceFully(stack,newStacks);if(done)continue}let force=stack.split(),forceBase=base;for(let j=0;force.forceReduce()&&10>j/* ForceReduceLimit */;j++){verbose&&console.log(forceBase+this.stackID(force)+" (via force-reduce)");let done=this.advanceFully(force,newStacks);if(done)break;verbose&&(forceBase=this.stackID(force)+" -> ")}for(let insert of stack.recoverByInsert(token))verbose&&console.log(base+this.stackID(insert)+" (via recover-insert)"),this.advanceFully(insert,newStacks);this.stream.end>stack.pos?(tokenEnd==stack.pos&&(tokenEnd++,token=0/* Err */),stack.recoverByDelete(token,tokenEnd),verbose&&console.log(base+this.stackID(stack)+` (via recover-delete ${this.parser.getName(token)})`),pushStackDedup(stack,newStacks)):(!finished||finished.score<stack.score)&&(finished=stack)}return finished}// Convert the stack's buffer to a syntax tree.
stackToTree(stack){return stack.close(),common.Tree.build({buffer:StackBufferCursor.create(stack),nodeSet:this.parser.nodeSet,topID:this.topTerm,maxBufferLength:this.parser.bufferLength,reused:this.reused,start:this.ranges[0].from,length:stack.pos-this.ranges[0].from,minRepeatType:this.parser.minRepeatTerm})}stackID(stack){let id=(stackIDs||(stackIDs=new WeakMap)).get(stack);return id||stackIDs.set(stack,id=String.fromCodePoint(this.nextStackID++)),id+stack}}class Dialect{constructor(source,flags,disabled){this.source=source,this.flags=flags,this.disabled=disabled}allows(term){return!this.disabled||0==this.disabled[term]}}const id=x=>x;/// Context trackers are used to track stateful context (such as
/// indentation in the Python grammar, or parent elements in the XML
/// grammar) needed by external tokenizers. You declare them in a
/// grammar file as `@context exportName from "module"`.
///
/// Context values should be immutable, and can be updated (replaced)
/// on shift or reduce actions.
///
/// The export used in a `@context` declaration should be of this
/// type.
/// A parser holds the parse tables for a given grammar, as generated
/// by `lezer-generator`.
class LRParser extends common.Parser{/// @internal
constructor(spec){function setProp(nodeID,prop,value){nodeProps[nodeID].push([prop,prop.deserialize(value+"")])}if(super(),this.wrappers=[],13!=spec.version/* Version */)throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${13/* Version */})`);let nodeNames=spec.nodeNames.split(" ");this.minRepeatTerm=nodeNames.length;for(let i=0;i<spec.repeatNodeCount;i++)nodeNames.push("");let topTerms=Object.keys(spec.topRules).map(r=>spec.topRules[r][1]),nodeProps=[];for(let i=0;i<nodeNames.length;i++)nodeProps.push([]);if(spec.nodeProps)for(let propSpec of spec.nodeProps){let prop=propSpec[0];for(let next,i=1;i<propSpec.length;)if(next=propSpec[i++],0<=next)setProp(next,prop,propSpec[i++]);else{let value=propSpec[i+-next];for(let j=-next;0<j;j--)setProp(propSpec[i++],prop,value);i++}}this.nodeSet=new common.NodeSet(nodeNames.map((name,i)=>common.NodeType.define({name:i>=this.minRepeatTerm?void 0:name,id:i,props:nodeProps[i],top:-1<topTerms.indexOf(i),error:0==i,skipped:spec.skippedNodes&&-1<spec.skippedNodes.indexOf(i)}))),this.strict=!1,this.bufferLength=common.DefaultBufferLength;let tokenArray=decodeArray(spec.tokenData);if(this.context=spec.context,this.specialized=new Uint16Array(spec.specialized?spec.specialized.length:0),this.specializers=[],spec.specialized)for(let i=0;i<spec.specialized.length;i++)this.specialized[i]=spec.specialized[i].term,this.specializers[i]=spec.specialized[i].get;this.states=decodeArray(spec.states,Uint32Array),this.data=decodeArray(spec.stateData),this.goto=decodeArray(spec.goto),this.maxTerm=spec.maxTerm,this.tokenizers=spec.tokenizers.map(value=>"number"==typeof value?new TokenGroup(tokenArray,value):value),this.topRules=spec.topRules,this.dialects=spec.dialects||{},this.dynamicPrecedences=spec.dynamicPrecedences||null,this.tokenPrecTable=spec.tokenPrec,this.termNames=spec.termNames||null,this.maxNode=this.nodeSet.types.length-1,this.dialect=this.parseDialect(),this.top=this.topRules[Object.keys(this.topRules)[0]]}createParse(input,fragments,ranges){let parse=new Parse(this,input,fragments,ranges);for(let w of this.wrappers)parse=w(parse,input,fragments,ranges);return parse}/// Get a goto table entry @internal
getGoto(state,term,loose=!1){let table=this.goto;if(term>=table[0])return-1;for(let pos=table[term+1];;){let groupTag=table[pos++],last=1&groupTag,target=table[pos++];if(last&&loose)return target;for(let end=pos+(groupTag>>1);pos<end;pos++)if(table[pos]==state)return target;if(last)return-1}}/// Check if this state has an action for a given terminal @internal
hasAction(state,terminal){let data=this.data;for(let set=0;2>set;set++)for(let next,i=this.stateSlot(state,set?2/* Skip */:1/* Actions */);;i+=3){if(65535==(next=data[i])/* End */)if(1==data[i+1]/* Next */)next=data[i=pair(data,i+2)];else{if(2==data[i+1]/* Other */)return pair(data,i+2);break}if(next==terminal||0==next/* Err */)return pair(data,i+1)}return 0}/// @internal
stateSlot(state,slot){return this.states[6*state/* Size */+slot]}/// @internal
stateFlag(state,flag){return 0<(this.stateSlot(state,0/* Flags */)&flag)}/// @internal
validAction(state,action){if(action==this.stateSlot(state,4/* DefaultReduce */))return!0;for(let i=this.stateSlot(state,1/* Actions */);;i+=3){if(65535==this.data[i]/* End */)if(1==this.data[i+1]/* Next */)i=pair(this.data,i+2);else return!1;if(action==pair(this.data,i+1))return!0}}/// Get the states that can follow this one through shift actions or
/// goto jumps. @internal
nextStates(state){let result=[];for(let i=this.stateSlot(state,1/* Actions */);;i+=3){if(65535==this.data[i]/* End */)if(1==this.data[i+1]/* Next */)i=pair(this.data,i+2);else break;if(0==(1&this.data[i+2])){let value=this.data[i+1];result.some((v,i)=>1&i&&v==value)||result.push(this.data[i],value)}}return result}/// @internal
overrides(token,prev){let iPrev=findOffset(this.data,this.tokenPrecTable,prev);return 0>iPrev||findOffset(this.data,this.tokenPrecTable,token)<iPrev}/// Configure the parser. Returns a new parser instance that has the
/// given settings modified. Settings not provided in `config` are
/// kept from the original parser.
configure(config){// Hideous reflection-based kludge to make it easy to create a
// slightly modified copy of a parser.
let copy=Object.assign(Object.create(LRParser.prototype),this);if(config.props&&(copy.nodeSet=this.nodeSet.extend(...config.props)),config.top){let info=this.topRules[config.top];if(!info)throw new RangeError(`Invalid top rule name ${config.top}`);copy.top=info}return config.tokenizers&&(copy.tokenizers=this.tokenizers.map(t=>{let found=config.tokenizers.find(r=>r.from==t);return found?found.to:t})),config.contextTracker&&(copy.context=config.contextTracker),config.dialect&&(copy.dialect=this.parseDialect(config.dialect)),null!=config.strict&&(copy.strict=config.strict),config.wrap&&(copy.wrappers=copy.wrappers.concat(config.wrap)),null!=config.bufferLength&&(copy.bufferLength=config.bufferLength),copy}/// Returns the name associated with a given term. This will only
/// work for all terms when the parser was generated with the
/// `--names` option. By default, only the names of tagged terms are
/// stored.
getName(term){return this.termNames?this.termNames[term]:(term<=this.maxNode&&this.nodeSet.types[term].name||term)+""}/// The eof term id is always allocated directly after the node
/// types. @internal
get eofTerm(){return this.maxNode+1}/// The type of top node produced by the parser.
get topNode(){return this.nodeSet.types[this.top[1]]}/// @internal
dynamicPrecedence(term){let prec=this.dynamicPrecedences;return null==prec?0:prec[term]||0}/// @internal
parseDialect(dialect){let values=Object.keys(this.dialects),flags=values.map(()=>!1);if(dialect)for(let part of dialect.split(" ")){let id=values.indexOf(part);0<=id&&(flags[id]=!0)}let disabled=null;for(let i=0;i<values.length;i++)if(!flags[i])for(let id,j=this.dialects[values[i]];65535!=(id=this.data[j++])/* End */;)(disabled||(disabled=new Uint8Array(this.maxTerm+1)))[id]=1;return new Dialect(dialect,flags,disabled)}/// (used by the output of the parser generator) @internal
static deserialize(spec){return new LRParser(spec)}}return exports.ContextTracker=class{/// Define a context tracker.
constructor(spec){this.start=spec.start,this.shift=spec.shift||id,this.reduce=spec.reduce||id,this.reuse=spec.reuse||id,this.hash=spec.hash||(()=>0),this.strict=!1!==spec.strict}},exports.ExternalTokenizer=/// `@external tokens` declarations in the grammar should resolve to
/// an instance of this class.
class{/// Create a tokenizer. The first argument is the function that,
/// given an input stream, scans for the types of tokens it
/// recognizes at the stream's position, and calls
/// [`acceptToken`](#lr.InputStream.acceptToken) when it finds
/// one.
constructor(/// @internal
token,options={}){this.token=token,this.contextual=!!options.contextual,this.fallback=!!options.fallback,this.extend=!!options.extend}},exports.InputStream=InputStream,exports.LRParser=LRParser,exports.Stack=Stack,exports}