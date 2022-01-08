async function moduleInitFunction(require,exports={}){function checkSide(side,pos,from,to){return-2/* Before */===side?from<pos:-1/* AtOrBefore */===side?to>=pos&&from<pos:0/* Around */===side?from<pos&&to>pos:1/* AtOrAfter */===side?from<=pos&&to>pos:2/* After */===side?to>pos:4/* DontCare */==side||void 0}function enterUnfinishedNodesBefore(node,pos){for(let last,scan=node.childBefore(pos);scan&&(last=scan.lastChild,last&&last.to==scan.to);)last.type.isError&&last.from==last.to?(node=scan,scan=last.prevSibling):scan=last;return node}function resolveNode(node,pos,side,overlays){// Move up to a node that actually holds the position, if possible
for(var _a;node.from==node.to||(1>side?node.from>=pos:node.from>pos)||(-1<side?node.to<=pos:node.to<pos);){let parent=!overlays&&node instanceof TreeNode&&0>node.index?null:node.parent;if(!parent)return node;node=parent}// Must go up out of overlays when those do not overlap with pos
if(overlays)for(let scan=node,parent=scan.parent;parent;scan=parent,parent=scan.parent)scan instanceof TreeNode&&0>scan.index&&(null===(_a=parent.enter(pos,side,!0))||void 0===_a?void 0:_a.from)!=scan.from&&(node=parent);for(;;){let inner=node.enter(pos,side,overlays);if(!inner)return node;node=inner}}function getChildren(node,type,before,after){let cur=node.cursor,result=[];if(!cur.firstChild())return result;if(null!=before)for(;!cur.type.is(before);)if(!cur.nextSibling())return result;for(;;){if(null!=after&&cur.type.is(after))return result;if(cur.type.is(type)&&result.push(cur.node),!cur.nextSibling())return null==after?result:[]}}function hasChild(tree){return tree.children.some(ch=>ch instanceof TreeBuffer||!ch.type.isAnonymous||hasChild(ch))}function buildTree(data){function takeNode(parentStart,minPos,children,positions,inRepeat){let{id,start,end,size}=cursor,lookAheadAtStart=lookAhead;for(;0>size;){if(cursor.next(),-1==size/* Reuse */){let node=reused[id];return children.push(node),void positions.push(start-parentStart)}if(-3==size/* ContextChange */)return void(contextHash=id);if(-4==size/* LookAhead */)return void(lookAhead=id);throw new RangeError(`Unrecognized record size: ${size}`)}let node,buffer,type=types[id],startPos=start-parentStart;if(end-start<=maxBufferLength&&(buffer=findBufferSize(cursor.pos-minPos,inRepeat))){// Small enough for a buffer, and no reused nodes inside
let data=new Uint16Array(buffer.size-buffer.skip),endPos=cursor.pos-buffer.size,index=data.length;for(;cursor.pos>endPos;)index=copyToBuffer(buffer.start,data,index);node=new TreeBuffer(data,end-buffer.start,nodeSet),startPos=buffer.start-parentStart}else{// Make it a node
let endPos=cursor.pos-size;cursor.next();let localChildren=[],localPositions=[],localInRepeat=id>=minRepeatType?id:-1,lastGroup=0,lastEnd=end;for(;cursor.pos>endPos;)0<=localInRepeat&&cursor.id==localInRepeat&&0<=cursor.size?(cursor.end<=lastEnd-maxBufferLength&&(makeRepeatLeaf(localChildren,localPositions,start,lastGroup,cursor.end,lastEnd,localInRepeat,lookAheadAtStart),lastGroup=localChildren.length,lastEnd=cursor.end),cursor.next()):takeNode(start,endPos,localChildren,localPositions,localInRepeat);if(0<=localInRepeat&&0<lastGroup&&lastGroup<localChildren.length&&makeRepeatLeaf(localChildren,localPositions,start,lastGroup,start,lastEnd,localInRepeat,lookAheadAtStart),localChildren.reverse(),localPositions.reverse(),-1<localInRepeat&&0<lastGroup){let make=makeBalanced(type);node=balanceRange(type,localChildren,localPositions,0,localChildren.length,0,end-start,make,make)}else node=makeTree(type,localChildren,localPositions,end-start,lookAheadAtStart-end)}children.push(node),positions.push(startPos)}function makeBalanced(type){return(children,positions,length)=>{let last,lookAheadProp,lookAhead=0,lastI=children.length-1;if(0<=lastI&&(last=children[lastI])instanceof Tree){if(!lastI&&last.type==type&&last.length==length)return last;(lookAheadProp=last.prop(NodeProp.lookAhead))&&(lookAhead=positions[lastI]+last.length+lookAheadProp)}return makeTree(type,children,positions,length,lookAhead)}}function makeRepeatLeaf(children,positions,base,i,from,to,type,lookAhead){let localChildren=[],localPositions=[];for(;children.length>i;)localChildren.push(children.pop()),localPositions.push(positions.pop()+base-from);children.push(makeTree(nodeSet.types[type],localChildren,localPositions,to-from,lookAhead-to)),positions.push(from-base)}function makeTree(type,children,positions,length,lookAhead=0,props){if(contextHash){let pair=[NodeProp.contextHash,contextHash];props=props?[pair].concat(props):[pair]}if(25<lookAhead){let pair=[NodeProp.lookAhead,lookAhead];props=props?[pair].concat(props):[pair]}return new Tree(type,children,positions,length,props)}function findBufferSize(maxSize,inRepeat){// Scan through the buffer to find previous siblings that fit
// together in a TreeBuffer, and don't contain any reused nodes
// (which can't be stored in a buffer).
// If `inRepeat` is > -1, ignore node boundaries of that type for
// nesting, but make sure the end falls either at the start
// (`maxSize`) or before such a node.
let fork=cursor.fork(),size=0,start=0,skip=0,minStart=fork.end-maxBufferLength,result={size:0,start:0,skip:0};scan:for(let nodeSize,minPos=fork.pos-maxSize;fork.pos>minPos;){// Pretend nested repeat nodes of the same type don't exist
if(nodeSize=fork.size,fork.id==inRepeat&&0<=nodeSize){result.size=size,result.start=start,result.skip=skip,skip+=4,size+=4,fork.next();continue}let startPos=fork.pos-nodeSize;if(0>nodeSize||startPos<minPos||fork.start<minStart)break;let localSkipped=fork.id>=minRepeatType?4:0,nodeStart=fork.start;for(fork.next();fork.pos>startPos;){if(!(0>fork.size))fork.id>=minRepeatType&&(localSkipped+=4);else if(-3==fork.size/* ContextChange */)localSkipped+=4;else break scan;fork.next()}start=nodeStart,size+=nodeSize,skip+=localSkipped}return(0>inRepeat||size==maxSize)&&(result.size=size,result.start=start,result.skip=skip),4<result.size?result:void 0}function copyToBuffer(bufferStart,buffer,index){let{id,start,end,size}=cursor;if(cursor.next(),0<=size&&id<minRepeatType){let startIndex=index;if(4<size)for(let endPos=cursor.pos-(size-4);cursor.pos>endPos;)index=copyToBuffer(bufferStart,buffer,index);buffer[--index]=startIndex,buffer[--index]=end-bufferStart,buffer[--index]=start-bufferStart,buffer[--index]=id}else-3==size/* ContextChange */?contextHash=id:-4==size/* LookAhead */&&(lookAhead=id);return index}var _a;let{buffer,nodeSet,maxBufferLength=DefaultBufferLength,reused=[],minRepeatType=nodeSet.types.length}=data,cursor=Array.isArray(buffer)?new FlatBufferCursor(buffer,buffer.length):buffer,types=nodeSet.types,contextHash=0,lookAhead=0,children=[],positions=[];for(;0<cursor.pos;)takeNode(data.start||0,data.bufferStart||0,children,positions,-1);let length=null!==(_a=data.length)&&void 0!==_a?_a:children.length?positions[0]+children[0].length:0;return new Tree(types[data.topID],children.reverse(),positions.reverse(),length)}function nodeSize(balanceType,node){if(!balanceType.isAnonymous||node instanceof TreeBuffer||node.type!=balanceType)return 1;let size=nodeSizeCache.get(node);if(null==size){size=1;for(let child of node.children){if(child.type!=balanceType||!(child instanceof Tree)){size=1;break}size+=nodeSize(balanceType,child)}nodeSizeCache.set(node,size)}return size}function balanceRange(// The type the balanced tree's inner nodes.
balanceType,// The direct children and their positions
children,positions,// The index range in children/positions to use
from,to,// The start position of the nodes, relative to their parent.
start,// Length of the outer node
length,// Function to build the top node of the balanced tree
mkTop,// Function to build internal nodes for the balanced tree
mkTree){function divide(children,positions,from,to,offset){for(let i=from;i<to;){let groupFrom=i,groupStart=positions[i],groupSize=nodeSize(balanceType,children[i]);for(i++;i<to;i++){let nextSize=nodeSize(balanceType,children[i]);if(groupSize+nextSize>=maxChild)break;groupSize+=nextSize}if(i==groupFrom+1){if(groupSize>maxChild){let only=children[groupFrom];// Only trees can have a size > 1
divide(only.children,only.positions,0,only.children.length,positions[groupFrom]+offset);continue}localChildren.push(children[groupFrom])}else{let length=positions[i-1]+children[i-1].length-groupStart;localChildren.push(balanceRange(balanceType,children,positions,groupFrom,i,groupStart,length,null,mkTree))}localPositions.push(groupStart+offset-start)}}let total=0;for(let i=from;i<to;i++)total+=nodeSize(balanceType,children[i]);let maxChild=Math.ceil(1.5*total/8/* BranchFactor */),localChildren=[],localPositions=[];return divide(children,positions,from,to,0),(mkTop||mkTree)(localChildren,localPositions,length)}/// Tree fragments are used during [incremental
/// parsing](#common.Parser.startParse) to track parts of old trees
/// that can be reused in a new parse. An array of fragments is used
/// to track regions of an old tree whose nodes might be reused in new
/// parses. Use the static
/// [`applyChanges`](#common.TreeFragment^applyChanges) method to
/// update fragments for document changes.
function checkCover(covered,from,to){for(let range of covered){if(range.from>=to)break;if(range.to>from)return range.from<=from&&range.to>=to?2/* Full */:1/* Partial */}return 0/* None */}// Take a piece of buffer and convert it into a stand-alone
// TreeBuffer.
function sliceBuf(buf,startI,endI,nodes,positions,off){if(startI<endI){let from=buf.buffer[startI+1],to=buf.buffer[endI-2];nodes.push(buf.slice(startI,endI,from,to)),positions.push(from-off)}}// This function takes a node that's in a buffer, and converts it, and
// its parent buffer nodes, into a Tree. This is again acting on the
// assumption that the trees and buffers have been constructed by the
// parse that was ran via the mix parser, and thus aren't shared with
// any other code, making violations of the immutability safe.
function materialize(cursor){// Split a level in the buffer, putting the nodes before and after
// the child that contains `node` into new buffers.
function split(startI,endI,type,innerOffset,length){let i=startI;for(;b[i+2]+off<=node.from;)i=b[i+3];let children=[],positions=[];sliceBuf(buf,startI,i,children,positions,innerOffset);let from=b[i+1],to=b[i+2],isTarget=from+off==node.from&&to+off==node.to&&b[i]==node.type.id;return children.push(isTarget?node.toTree():split(i+4,b[i+3],buf.set.types[b[i]],from,to-from)),positions.push(from-innerOffset),sliceBuf(buf,b[i+3],endI,children,positions,innerOffset),new Tree(type,children,positions,length)}let{node}=cursor,depth=0;// Scan up to the nearest tree
do cursor.parent(),depth++;while(!cursor.tree);// Find the index of the buffer in that tree
let i=0,base=cursor.tree,off=0;for(;;i++)if(off=base.positions[i]+cursor.from,off<=node.from&&off+base.children[i].length>=node.to)break;let buf=base.children[i],b=buf.buffer;base.children[i]=split(0,b.length,NodeType.none,0,buf.length);// Move the cursor back to the target node
for(let d=0;d<=depth;d++)cursor.childAfter(node.from)}function punchRanges(outer,ranges){let copy=null,current=ranges;for(let i=1,j=0;i<outer.length;i++)for(let r,gapFrom=outer[i-1].to,gapTo=outer[i].from;j<current.length&&(r=current[j],!(r.from>=gapTo));j++)r.to<=gapFrom||(copy||(current=copy=ranges.slice()),r.from<gapFrom?(copy[j]=new Range(r.from,gapFrom),r.to>gapTo&&copy.splice(j+1,0,new Range(gapTo,r.to))):r.to>gapTo?copy[j--]=new Range(gapTo,r.to):copy.splice(j--,1));return current}function findCoverChanges(a,b,from,to){let iA=0,iB=0,inA=!1,inB=!1,pos=-1e9,result=[];for(;;){let nextA=iA==a.length?1e9:inA?a[iA].to:a[iA].from,nextB=iB==b.length?1e9:inB?b[iB].to:b[iB].from;if(inA!=inB){let start=Math.max(pos,from),end=Math.min(nextA,nextB,to);start<end&&result.push(new Range(start,end))}if(pos=Math.min(nextA,nextB),1e9==pos)break;nextA==pos&&(inA?(inA=!1,iA++):inA=!0),nextB==pos&&(inB?(inB=!1,iB++):inB=!0)}return result}// Given a number of fragments for the outer tree, and a set of ranges
// to parse, find fragments for inner trees mounted around those
// ranges, if any.
function enterFragments(mounts,ranges){let result=[];for(let{pos,mount,frag}of mounts){let startPos=pos+(mount.overlay?mount.overlay[0].from:0),endPos=startPos+mount.tree.length,from=Math.max(frag.from,startPos),to=Math.min(frag.to,endPos);if(mount.overlay){let overlay=mount.overlay.map(r=>new Range(r.from+pos,r.to+pos)),changes=findCoverChanges(ranges,overlay,from,to);for(let i=0,pos=from;;i++){let last=i==changes.length,end=last?to:changes[i].from;if(end>pos&&result.push(new TreeFragment(pos,end,mount.tree,-startPos,frag.from>=pos,frag.to<=end)),last)break;pos=changes[i].to}}else result.push(new TreeFragment(from,to,mount.tree,-startPos,frag.from>=startPos,frag.to<=endPos))}return result}Object.defineProperty(exports,"__esModule",{value:!0});// FIXME profile adding a per-Tree TreeNode cache, validating it by
// parent pointer
/// The default maximum length of a `TreeBuffer` node (1024).
const DefaultBufferLength=1024;let nextPropID=0;class Range{constructor(from,to){this.from=from,this.to=to}}/// Each [node type](#common.NodeType) or [individual tree](#common.Tree)
/// can have metadata associated with it in props. Instances of this
/// class represent prop names.
class NodeProp{/// Create a new node prop type.
constructor(config={}){this.id=nextPropID++,this.perNode=!!config.perNode,this.deserialize=config.deserialize||(()=>{throw new Error("This node type doesn't define a deserialize function")})}/// This is meant to be used with
/// [`NodeSet.extend`](#common.NodeSet.extend) or
/// [`LRParser.configure`](#lr.ParserConfig.props) to compute
/// prop values for each node type in the set. Takes a [match
/// object](#common.NodeType^match) or function that returns undefined
/// if the node type doesn't get this prop, and the prop's value if
/// it does.
add(match){if(this.perNode)throw new RangeError("Can't add per-node props to node types");return"function"!=typeof match&&(match=NodeType.match(match)),type=>{let result=match(type);return void 0===result?null:[this,result]}}}/// Prop that is used to describe matching delimiters. For opening
/// delimiters, this holds an array of node names (written as a
/// space-separated string when declaring this prop in a grammar)
/// for the node types of closing delimiters that match it.
NodeProp.closedBy=new NodeProp({deserialize:str=>str.split(" ")}),NodeProp.openedBy=new NodeProp({deserialize:str=>str.split(" ")}),NodeProp.group=new NodeProp({deserialize:str=>str.split(" ")}),NodeProp.contextHash=new NodeProp({perNode:!0}),NodeProp.lookAhead=new NodeProp({perNode:!0}),NodeProp.mounted=new NodeProp({perNode:!0});/// A mounted tree, which can be [stored](#common.NodeProp^mounted) on
/// a tree node to indicate that parts of its content are
/// represented by another tree.
class MountedTree{constructor(/// The inner tree.
tree,/// If this is null, this tree replaces the entire node (it will
/// be included in the regular iteration instead of its host
/// node). If not, only the given ranges are considered to be
/// covered by this tree. This is used for trees that are mixed in
/// a way that isn't strictly hierarchical. Such mounted trees are
/// only entered by [`resolveInner`](#common.Tree.resolveInner)
/// and [`enter`](#common.SyntaxNode.enter).
overlay,/// The parser used to create this subtree.
parser){this.tree=tree,this.overlay=overlay,this.parser=parser}}const noProps=Object.create(null);/// Each node in a syntax tree has a node type associated with it.
class NodeType{/// @internal
constructor(/// The name of the node type. Not necessarily unique, but if the
/// grammar was written properly, different node types with the
/// same name within a node set should play the same semantic
/// role.
name,/// @internal
props,/// The id of this node in its set. Corresponds to the term ids
/// used in the parser.
id,/// @internal
flags=0){this.name=name,this.props=props,this.id=id,this.flags=flags}static define(spec){let props=spec.props&&spec.props.length?Object.create(null):noProps,flags=(spec.top?1/* Top */:0)|(spec.skipped?2/* Skipped */:0)|(spec.error?4/* Error */:0)|(null==spec.name?8/* Anonymous */:0),type=new NodeType(spec.name||"",props,spec.id,flags);if(spec.props)for(let src of spec.props)if(Array.isArray(src)||(src=src(type)),src){if(src[0].perNode)throw new RangeError("Can't store a per-node prop on a node type");props[src[0].id]=src[1]}return type}/// Retrieves a node prop for this type. Will return `undefined` if
/// the prop isn't present on this node.
prop(prop){return this.props[prop.id]}/// True when this is the top node of a grammar.
get isTop(){return 0<(1&this.flags/* Top */)}/// True when this node is produced by a skip rule.
get isSkipped(){return 0<(2&this.flags/* Skipped */)}/// Indicates whether this is an error node.
get isError(){return 0<(4&this.flags/* Error */)}/// When true, this node type doesn't correspond to a user-declared
/// named node, for example because it is used to cache repetition.
get isAnonymous(){return 0<(8&this.flags/* Anonymous */)}/// Returns true when this node's name or one of its
/// [groups](#common.NodeProp^group) matches the given string.
is(name){if("string"==typeof name){if(this.name==name)return!0;let group=this.prop(NodeProp.group);return!!group&&-1<group.indexOf(name)}return this.id==name}/// Create a function from node types to arbitrary values by
/// specifying an object whose property names are node or
/// [group](#common.NodeProp^group) names. Often useful with
/// [`NodeProp.add`](#common.NodeProp.add). You can put multiple
/// names, separated by spaces, in a single property name to map
/// multiple node names to a single value.
static match(map){let direct=Object.create(null);for(let prop in map)for(let name of prop.split(" "))direct[name]=map[prop];return node=>{for(let found,groups=node.prop(NodeProp.group),i=-1;i<(groups?groups.length:0);i++)if(found=direct[0>i?node.name:groups[i]],found)return found}}}/// An empty dummy node type to use when no actual type is available.
NodeType.none=new NodeType("",Object.create(null),0,8/* Anonymous */);/// A node set holds a collection of node types. It is used to
/// compactly represent trees by storing their type ids, rather than a
/// full pointer to the type object, in a numeric array. Each parser
/// [has](#lr.LRParser.nodeSet) a node set, and [tree
/// buffers](#common.TreeBuffer) can only store collections of nodes
/// from the same set. A set can have a maximum of 2**16 (65536) node
/// types in it, so that the ids fit into 16-bit typed array slots.
class NodeSet{/// Create a set with the given types. The `id` property of each
/// type should correspond to its position within the array.
constructor(/// The node types in this set, by id.
types){this.types=types;for(let i=0;i<types.length;i++)if(types[i].id!=i)throw new RangeError("Node type ids should correspond to array positions when creating a node set")}/// Create a copy of this set with some node properties added. The
/// arguments to this method should be created with
/// [`NodeProp.add`](#common.NodeProp.add).
extend(...props){let newTypes=[];for(let type of this.types){let newProps=null;for(let source of props){let add=source(type);add&&(!newProps&&(newProps=Object.assign({},type.props)),newProps[add[0].id]=add[1])}newTypes.push(newProps?new NodeType(type.name,newProps,type.id,type.flags):type)}return new NodeSet(newTypes)}}const CachedNode=new WeakMap,CachedInnerNode=new WeakMap;/// A piece of syntax tree. There are two ways to approach these
/// trees: the way they are actually stored in memory, and the
/// convenient way.
///
/// Syntax trees are stored as a tree of `Tree` and `TreeBuffer`
/// objects. By packing detail information into `TreeBuffer` leaf
/// nodes, the representation is made a lot more memory-efficient.
///
/// However, when you want to actually work with tree nodes, this
/// representation is very awkward, so most client code will want to
/// use the [`TreeCursor`](#common.TreeCursor) or
/// [`SyntaxNode`](#common.SyntaxNode) interface instead, which provides
/// a view on some part of this data structure, and can be used to
/// move around to adjacent nodes.
class Tree{/// Construct a new tree. See also [`Tree.build`](#common.Tree^build).
constructor(/// The type of the top node.
type,/// This node's child nodes.
children,/// The positions (offsets relative to the start of this tree) of
/// the children.
positions,/// The total length of this tree
length,/// Per-node [node props](#common.NodeProp) to associate with this node.
props){if(this.type=type,this.children=children,this.positions=positions,this.length=length,this.props=null,props&&props.length){this.props=Object.create(null);for(let[prop,value]of props)this.props["number"==typeof prop?prop:prop.id]=value}}/// @internal
toString(){let mounted=this.prop(NodeProp.mounted);if(mounted&&!mounted.overlay)return mounted.tree.toString();let children="";for(let ch of this.children){let str=ch.toString();str&&(children&&(children+=","),children+=str)}return this.type.name?(/\W/.test(this.type.name)&&!this.type.isError?JSON.stringify(this.type.name):this.type.name)+(children.length?"("+children+")":""):children}/// Get a [tree cursor](#common.TreeCursor) rooted at this tree. When
/// `pos` is given, the cursor is [moved](#common.TreeCursor.moveTo)
/// to the given position and side.
cursor(pos,side=0){let scope=null!=pos&&CachedNode.get(this)||this.topNode,cursor=new TreeCursor(scope);return null!=pos&&(cursor.moveTo(pos,side),CachedNode.set(this,cursor._tree)),cursor}/// Get a [tree cursor](#common.TreeCursor) that, unlike regular
/// cursors, doesn't skip through
/// [anonymous](#common.NodeType.isAnonymous) nodes and doesn't
/// automatically enter mounted nodes.
fullCursor(){return new TreeCursor(this.topNode,1/* Full */)}/// Get a [syntax node](#common.SyntaxNode) object for the top of the
/// tree.
get topNode(){return new TreeNode(this,0,0,null)}/// Get the [syntax node](#common.SyntaxNode) at the given position.
/// If `side` is -1, this will move into nodes that end at the
/// position. If 1, it'll move into nodes that start at the
/// position. With 0, it'll only enter nodes that cover the position
/// from both sides.
resolve(pos,side=0){let node=resolveNode(CachedNode.get(this)||this.topNode,pos,side,!1);return CachedNode.set(this,node),node}/// Like [`resolve`](#common.Tree.resolve), but will enter
/// [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
/// pointing into the innermost overlaid tree at the given position
/// (with parent links going through all parent structure, including
/// the host trees).
resolveInner(pos,side=0){let node=resolveNode(CachedInnerNode.get(this)||this.topNode,pos,side,!0);return CachedInnerNode.set(this,node),node}/// Iterate over the tree and its children, calling `enter` for any
/// node that touches the `from`/`to` region (if given) before
/// running over such a node's children, and `leave` (if given) when
/// leaving the node. When `enter` returns `false`, that node will
/// not have its children iterated over (or `leave` called).
iterate(spec){let{enter,leave,from=0,to=this.length}=spec;for(let mustLeave,c=this.cursor(),get=()=>c.node;;){if(mustLeave=!1,c.from<=to&&c.to>=from&&(c.type.isAnonymous||!1!==enter(c.type,c.from,c.to,get))){if(c.firstChild())continue;c.type.isAnonymous||(mustLeave=!0)}for(;;){if(mustLeave&&leave&&leave(c.type,c.from,c.to,get),mustLeave=c.type.isAnonymous,c.nextSibling())break;if(!c.parent())return;mustLeave=!0}}}/// Get the value of the given [node prop](#common.NodeProp) for this
/// node. Works with both per-node and per-type props.
prop(prop){return prop.perNode?this.props?this.props[prop.id]:void 0:this.type.prop(prop)}/// Returns the node's [per-node props](#common.NodeProp.perNode) in a
/// format that can be passed to the [`Tree`](#common.Tree)
/// constructor.
get propValues(){let result=[];if(this.props)for(let id in this.props)result.push([+id,this.props[id]]);return result}/// Balance the direct children of this tree, producing a copy of
/// which may have children grouped into subtrees with type
/// [`NodeType.none`](#common.NodeType^none).
balance(config={}){return 8>=this.children.length/* BranchFactor */?this:balanceRange(NodeType.none,this.children,this.positions,0,this.children.length,0,this.length,(children,positions,length)=>new Tree(this.type,children,positions,length,this.propValues),config.makeTree||((children,positions,length)=>new Tree(NodeType.none,children,positions,length)))}/// Build a tree from a postfix-ordered buffer of node information,
/// or a cursor over such a buffer.
static build(data){return buildTree(data)}}/// The empty tree
Tree.empty=new Tree(NodeType.none,[],[],0);class FlatBufferCursor{constructor(buffer,index){this.buffer=buffer,this.index=index}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}get pos(){return this.index}next(){this.index-=4}fork(){return new FlatBufferCursor(this.buffer,this.index)}}/// Tree buffers contain (type, start, end, endIndex) quads for each
/// node. In such a buffer, nodes are stored in prefix order (parents
/// before children, with the endIndex of the parent indicating which
/// children belong to it)
class TreeBuffer{/// Create a tree buffer.
constructor(/// The buffer's content.
buffer,/// The total length of the group of nodes in the buffer.
length,/// The node set used in this buffer.
set){this.buffer=buffer,this.length=length,this.set=set}/// @internal
get type(){return NodeType.none}/// @internal
toString(){let result=[];for(let index=0;index<this.buffer.length;)result.push(this.childString(index)),index=this.buffer[index+3];return result.join(",")}/// @internal
childString(index){let id=this.buffer[index],endIndex=this.buffer[index+3],type=this.set.types[id],result=type.name;if(/\W/.test(result)&&!type.isError&&(result=JSON.stringify(result)),index+=4,endIndex==index)return result;let children=[];for(;index<endIndex;)children.push(this.childString(index)),index=this.buffer[index+3];return result+"("+children.join(",")+")"}/// @internal
findChild(startIndex,endIndex,dir,pos,side){let{buffer}=this,pick=-1;for(let i=startIndex;i!=endIndex&&!(checkSide(side,pos,buffer[i+1],buffer[i+2])&&(pick=i,0<dir));i=buffer[i+3]);return pick}/// @internal
slice(startI,endI,from,to){let b=this.buffer,copy=new Uint16Array(endI-startI);for(let i=startI,j=0;i<endI;)copy[j++]=b[i++],copy[j++]=b[i++]-from,copy[j++]=b[i++]-from,copy[j++]=b[i++]-startI;return new TreeBuffer(copy,to-from,this.set)}}class TreeNode{constructor(node,_from,// Index in parent node, set to -1 if the node is not a direct child of _parent.node (overlay)
index,_parent){this.node=node,this._from=_from,this.index=index,this._parent=_parent}get type(){return this.node.type}get name(){return this.node.type.name}get from(){return this._from}get to(){return this._from+this.node.length}nextChild(i,dir,pos,side,mode=0){for(let parent=this;;){for(let{children,positions}=parent.node,e=0<dir?children.length:-1;i!=e;i+=dir){let next=children[i],start=positions[i]+parent._from;if(checkSide(side,pos,start,start+next.length))if(next instanceof TreeBuffer){if(2&mode/* NoEnterBuffer */)continue;let index=next.findChild(0,next.buffer.length,dir,pos-start,side);if(-1<index)return new BufferNode(new BufferContext(parent,next,i,start),null,index)}else if(1&mode/* Full */||!next.type.isAnonymous||hasChild(next)){let mounted;if(!(1&mode/* Full */)&&next.props&&(mounted=next.prop(NodeProp.mounted))&&!mounted.overlay)return new TreeNode(mounted.tree,start,i,parent);let inner=new TreeNode(next,start,i,parent);return 1&mode/* Full */||!inner.type.isAnonymous?inner:inner.nextChild(0>dir?next.children.length-1:0,dir,pos,side)}}if(1&mode/* Full */||!parent.type.isAnonymous)return null;if(i=0<=parent.index?parent.index+dir:0>dir?-1:parent._parent.node.children.length,parent=parent._parent,!parent)return null}}get firstChild(){return this.nextChild(0,1,0,4/* DontCare */)}get lastChild(){return this.nextChild(this.node.children.length-1,-1,0,4/* DontCare */)}childAfter(pos){return this.nextChild(0,1,pos,2/* After */)}childBefore(pos){return this.nextChild(this.node.children.length-1,-1,pos,-2/* Before */)}enter(pos,side,overlays=!0,buffers=!0){let mounted;if(overlays&&(mounted=this.node.prop(NodeProp.mounted))&&mounted.overlay){let rPos=pos-this.from;for(let{from,to}of mounted.overlay)if((0<side?from<=rPos:from<rPos)&&(0>side?to>=rPos:to>rPos))return new TreeNode(mounted.tree,mounted.overlay[0].from+this.from,-1,this)}return this.nextChild(0,1,pos,side,buffers?0:2/* NoEnterBuffer */)}nextSignificantParent(){let val=this;for(;val.type.isAnonymous&&val._parent;)val=val._parent;return val}get parent(){return this._parent?this._parent.nextSignificantParent():null}get nextSibling(){return this._parent&&0<=this.index?this._parent.nextChild(this.index+1,1,0,4/* DontCare */):null}get prevSibling(){return this._parent&&0<=this.index?this._parent.nextChild(this.index-1,-1,0,4/* DontCare */):null}get cursor(){return new TreeCursor(this)}get tree(){return this.node}toTree(){return this.node}resolve(pos,side=0){return resolveNode(this,pos,side,!1)}resolveInner(pos,side=0){return resolveNode(this,pos,side,!0)}enterUnfinishedNodesBefore(pos){return enterUnfinishedNodesBefore(this,pos)}getChild(type,before=null,after=null){let r=getChildren(this,type,before,after);return r.length?r[0]:null}getChildren(type,before=null,after=null){return getChildren(this,type,before,after)}/// @internal
toString(){return this.node.toString()}}class BufferContext{constructor(parent,buffer,index,start){this.parent=parent,this.buffer=buffer,this.index=index,this.start=start}}class BufferNode{constructor(context,_parent,index){this.context=context,this._parent=_parent,this.index=index,this.type=context.buffer.set.types[context.buffer.buffer[index]]}get name(){return this.type.name}get from(){return this.context.start+this.context.buffer.buffer[this.index+1]}get to(){return this.context.start+this.context.buffer.buffer[this.index+2]}child(dir,pos,side){let{buffer}=this.context,index=buffer.findChild(this.index+4,buffer.buffer[this.index+3],dir,pos-this.context.start,side);return 0>index?null:new BufferNode(this.context,this,index)}get firstChild(){return this.child(1,0,4/* DontCare */)}get lastChild(){return this.child(-1,0,4/* DontCare */)}childAfter(pos){return this.child(1,pos,2/* After */)}childBefore(pos){return this.child(-1,pos,-2/* Before */)}enter(pos,side,overlays,buffers=!0){if(!buffers)return null;let{buffer}=this.context,index=buffer.findChild(this.index+4,buffer.buffer[this.index+3],0<side?1:-1,pos-this.context.start,side);return 0>index?null:new BufferNode(this.context,this,index)}get parent(){return this._parent||this.context.parent.nextSignificantParent()}externalSibling(dir){return this._parent?null:this.context.parent.nextChild(this.context.index+dir,dir,0,4/* DontCare */)}get nextSibling(){let{buffer}=this.context,after=buffer.buffer[this.index+3];return after<(this._parent?buffer.buffer[this._parent.index+3]:buffer.buffer.length)?new BufferNode(this.context,this._parent,after):this.externalSibling(1)}get prevSibling(){let{buffer}=this.context,parentStart=this._parent?this._parent.index+4:0;return this.index==parentStart?this.externalSibling(-1):new BufferNode(this.context,this._parent,buffer.findChild(parentStart,this.index,-1,0,4/* DontCare */))}get cursor(){return new TreeCursor(this)}get tree(){return null}toTree(){let children=[],positions=[],{buffer}=this.context,startI=this.index+4,endI=buffer.buffer[this.index+3];if(endI>startI){let from=buffer.buffer[this.index+1],to=buffer.buffer[this.index+2];children.push(buffer.slice(startI,endI,from,to)),positions.push(0)}return new Tree(this.type,children,positions,this.to-this.from)}resolve(pos,side=0){return resolveNode(this,pos,side,!1)}resolveInner(pos,side=0){return resolveNode(this,pos,side,!0)}enterUnfinishedNodesBefore(pos){return enterUnfinishedNodesBefore(this,pos)}/// @internal
toString(){return this.context.buffer.childString(this.index)}getChild(type,before=null,after=null){let r=getChildren(this,type,before,after);return r.length?r[0]:null}getChildren(type,before=null,after=null){return getChildren(this,type,before,after)}}/// A tree cursor object focuses on a given node in a syntax tree, and
/// allows you to move to adjacent nodes.
class TreeCursor{/// @internal
constructor(node,/// @internal
mode=0){if(this.mode=mode,this.buffer=null,this.stack=[],this.index=0,this.bufferNode=null,node instanceof TreeNode)this.yieldNode(node);else{this._tree=node.context.parent,this.buffer=node.context;for(let n=node._parent;n;n=n._parent)this.stack.unshift(n.index);this.bufferNode=node,this.yieldBuf(node.index)}}/// Shorthand for `.type.name`.
get name(){return this.type.name}yieldNode(node){return!!node&&(this._tree=node,this.type=node.type,this.from=node.from,this.to=node.to,!0)}yieldBuf(index,type){this.index=index;let{start,buffer}=this.buffer;return this.type=type||buffer.set.types[buffer.buffer[index]],this.from=start+buffer.buffer[index+1],this.to=start+buffer.buffer[index+2],!0}yield(node){return!!node&&(node instanceof TreeNode?(this.buffer=null,this.yieldNode(node)):(this.buffer=node.context,this.yieldBuf(node.index,node.type)))}/// @internal
toString(){return this.buffer?this.buffer.buffer.childString(this.index):this._tree.toString()}/// @internal
enterChild(dir,pos,side){if(!this.buffer)return this.yield(this._tree.nextChild(0>dir?this._tree.node.children.length-1:0,dir,pos,side,this.mode));let{buffer}=this.buffer,index=buffer.findChild(this.index+4,buffer.buffer[this.index+3],dir,pos-this.buffer.start,side);return!(0>index)&&(this.stack.push(this.index),this.yieldBuf(index))}/// Move the cursor to this node's first child. When this returns
/// false, the node has no child, and the cursor has not been moved.
firstChild(){return this.enterChild(1,0,4/* DontCare */)}/// Move the cursor to this node's last child.
lastChild(){return this.enterChild(-1,0,4/* DontCare */)}/// Move the cursor to the first child that ends after `pos`.
childAfter(pos){return this.enterChild(1,pos,2/* After */)}/// Move to the last child that starts before `pos`.
childBefore(pos){return this.enterChild(-1,pos,-2/* Before */)}/// Move the cursor to the child around `pos`. If side is -1 the
/// child may end at that position, when 1 it may start there. This
/// will also enter [overlaid](#common.MountedTree.overlay)
/// [mounted](#common.NodeProp^mounted) trees unless `overlays` is
/// set to false.
enter(pos,side,overlays=!0,buffers=!0){return this.buffer?!!buffers&&this.enterChild(1,pos,side):this.yield(this._tree.enter(pos,side,overlays&&!(1&this.mode/* Full */),buffers))}/// Move to the node's parent node, if this isn't the top node.
parent(){if(!this.buffer)return this.yieldNode(1&this.mode/* Full */?this._tree._parent:this._tree.parent);if(this.stack.length)return this.yieldBuf(this.stack.pop());let parent=1&this.mode/* Full */?this.buffer.parent:this.buffer.parent.nextSignificantParent();return this.buffer=null,this.yieldNode(parent)}/// @internal
sibling(dir){if(!this.buffer)return!!this._tree._parent&&this.yield(0>this._tree.index?null:this._tree._parent.nextChild(this._tree.index+dir,dir,0,4/* DontCare */,this.mode));let{buffer}=this.buffer,d=this.stack.length-1;if(0>dir){let parentStart=0>d?0:this.stack[d]+4;if(this.index!=parentStart)return this.yieldBuf(buffer.findChild(parentStart,this.index,-1,0,4/* DontCare */))}else{let after=buffer.buffer[this.index+3];if(after<(0>d?buffer.buffer.length:buffer.buffer[this.stack[d]+3]))return this.yieldBuf(after)}return!!(0>d)&&this.yield(this.buffer.parent.nextChild(this.buffer.index+dir,dir,0,4/* DontCare */,this.mode))}/// Move to this node's next sibling, if any.
nextSibling(){return this.sibling(1)}/// Move to this node's previous sibling, if any.
prevSibling(){return this.sibling(-1)}atLastNode(dir){let index,parent,{buffer}=this;if(buffer){if(!(0<dir)){for(let i=0;i<this.index;i++)if(buffer.buffer.buffer[i+3]<this.index)return!1;}else if(this.index<buffer.buffer.buffer.length)return!1;({index,parent}=buffer)}else({index,_parent:parent}=this._tree);for(;parent;({index,_parent:parent}=parent))if(-1<index)for(let child,i=index+dir,e=0>dir?-1:parent.node.children.length;i!=e;i+=dir)if(child=parent.node.children[i],1&this.mode/* Full */||child instanceof TreeBuffer||!child.type.isAnonymous||hasChild(child))return!1;return!0}move(dir,enter){if(enter&&this.enterChild(dir,0,4/* DontCare */))return!0;for(;;){if(this.sibling(dir))return!0;if(this.atLastNode(dir)||!this.parent())return!1}}/// Move to the next node in a
/// [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR))
/// traversal, going from a node to its first child or, if the
/// current node is empty or `enter` is false, its next sibling or
/// the next sibling of the first parent node that has one.
next(enter=!0){return this.move(1,enter)}/// Move to the next node in a last-to-first pre-order traveral. A
/// node is followed by its last child or, if it has none, its
/// previous sibling or the previous sibling of the first parent
/// node that has one.
prev(enter=!0){return this.move(-1,enter)}/// Move the cursor to the innermost node that covers `pos`. If
/// `side` is -1, it will enter nodes that end at `pos`. If it is 1,
/// it will enter nodes that start at `pos`.
moveTo(pos,side=0){// Move up to a node that actually holds the position, if possible
for(;(this.from==this.to||(1>side?this.from>=pos:this.from>pos)||(-1<side?this.to<=pos:this.to<pos))&&!!this.parent(););// Then scan down into child nodes as far as possible
for(;this.enterChild(1,pos,side););return this}/// Get a [syntax node](#common.SyntaxNode) at the cursor's current
/// position.
get node(){if(!this.buffer)return this._tree;let cache=this.bufferNode,result=null,depth=0;if(cache&&cache.context==this.buffer)scan:for(let index=this.index,d=this.stack.length;0<=d;){for(let c=cache;c;c=c._parent)if(c.index==index){if(index==this.index)return c;result=c,depth=d+1;break scan}index=this.stack[--d]}for(let i=depth;i<this.stack.length;i++)result=new BufferNode(this.buffer,result,this.stack[i]);return this.bufferNode=new BufferNode(this.buffer,result,this.index)}/// Get the [tree](#common.Tree) that represents the current node, if
/// any. Will return null when the node is in a [tree
/// buffer](#common.TreeBuffer).
get tree(){return this.buffer?null:this._tree.node}}const nodeSizeCache=new WeakMap;class TreeFragment{/// Construct a tree fragment.
constructor(/// The start of the unchanged range pointed to by this fragment.
/// This refers to an offset in the _updated_ document (as opposed
/// to the original tree).
from,/// The end of the unchanged range.
to,/// The tree that this fragment is based on.
tree,/// The offset between the fragment's tree and the document that
/// this fragment can be used against. Add this when going from
/// document to tree positions, subtract it to go from tree to
/// document positions.
offset,openStart=!1,openEnd=!1){this.from=from,this.to=to,this.tree=tree,this.offset=offset,this.open=(openStart?1/* Start */:0)|(openEnd?2/* End */:0)}/// Whether the start of the fragment represents the start of a
/// parse, or the end of a change. (In the second case, it may not
/// be safe to reuse some nodes at the start, depending on the
/// parsing algorithm.)
get openStart(){return 0<(1&this.open/* Start */)}/// Whether the end of the fragment represents the end of a
/// full-document parse, or the start of a change.
get openEnd(){return 0<(2&this.open/* End */)}/// Create a set of fragments from a freshly parsed tree, or update
/// an existing set of fragments by replacing the ones that overlap
/// with a tree with content from the new tree. When `partial` is
/// true, the parse is treated as incomplete, and the resulting
/// fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
/// true.
static addTree(tree,fragments=[],partial=!1){let result=[new TreeFragment(0,tree.length,tree,0,!1,partial)];for(let f of fragments)f.to>tree.length&&result.push(f);return result}/// Apply a set of edits to an array of fragments, removing or
/// splitting fragments as necessary to remove edited ranges, and
/// adjusting offsets for fragments that moved.
static applyChanges(fragments,changes,minGap=128){if(!changes.length)return fragments;let result=[],fI=1,nextF=fragments.length?fragments[0]:null;for(let cI=0,pos=0,off=0;;cI++){let nextC=cI<changes.length?changes[cI]:null,nextPos=nextC?nextC.fromA:1e9;if(nextPos-pos>=minGap)for(;nextF&&nextF.from<nextPos;){let cut=nextF;if(pos>=cut.from||nextPos<=cut.to||off){let fFrom=Math.max(cut.from,pos)-off,fTo=Math.min(cut.to,nextPos)-off;cut=fFrom>=fTo?null:new TreeFragment(fFrom,fTo,cut.tree,cut.offset+off,0<cI,!!nextC)}if(cut&&result.push(cut),nextF.to>nextPos)break;nextF=fI<fragments.length?fragments[fI++]:null}if(!nextC)break;pos=nextC.toA,off=nextC.toA-nextC.toB}return result}}/// A superclass that parsers should extend.
class StringInput{constructor(string){this.string=string}get length(){return this.string.length}chunk(from){return this.string.slice(from)}get lineChunks(){return!1}read(from,to){return this.string.slice(from,to)}}/// Create a parse wrapper that, after the inner parse completes,
/// scans its tree for mixed language regions with the `nest`
/// function, runs the resulting [inner parses](#common.NestedParse),
/// and then [mounts](#common.NodeProp^mounted) their results onto the
/// tree.
///
/// The nesting function is passed a cursor to provide context for a
/// node, but _should not_ move that cursor, only inspect its
/// properties and optionally access its
/// [node object](#common.TreeCursor.node).
class InnerParse{constructor(parser,parse,overlay,target,ranges){this.parser=parser,this.parse=parse,this.overlay=overlay,this.target=target,this.ranges=ranges}}class ActiveOverlay{constructor(parser,predicate,mounts,index,start,target,prev){this.parser=parser,this.predicate=predicate,this.mounts=mounts,this.index=index,this.start=start,this.target=target,this.prev=prev,this.depth=0,this.ranges=[]}}const stoppedInner=new NodeProp({perNode:!0});class MixedParse{constructor(base,nest,input,fragments,ranges){this.nest=nest,this.input=input,this.fragments=fragments,this.ranges=ranges,this.inner=[],this.innerDone=0,this.baseTree=null,this.stoppedAt=null,this.baseParse=base}advance(){if(this.baseParse){let done=this.baseParse.advance();if(!done)return null;if(this.baseParse=null,this.baseTree=done,this.startInner(),null!=this.stoppedAt)for(let inner of this.inner)inner.parse.stopAt(this.stoppedAt)}if(this.innerDone==this.inner.length){let result=this.baseTree;return null!=this.stoppedAt&&(result=new Tree(result.type,result.children,result.positions,result.length,result.propValues.concat([[stoppedInner,this.stoppedAt]]))),result}let inner=this.inner[this.innerDone],done=inner.parse.advance();if(done){this.innerDone++;// This is a somewhat dodgy but super helpful hack where we
// patch up nodes created by the inner parse (and thus
// presumably not aliased anywhere else) to hold the information
// about the inner parse.
let props=Object.assign(Object.create(null),inner.target.props);props[NodeProp.mounted.id]=new MountedTree(done,inner.overlay,inner.parser),inner.target.props=props}return null}get parsedPos(){if(this.baseParse)return 0;let pos=this.input.length;for(let i=this.innerDone;i<this.inner.length;i++)this.inner[i].ranges[0].from<pos&&(pos=Math.min(pos,this.inner[i].parse.parsedPos));return pos}stopAt(pos){if(this.stoppedAt=pos,this.baseParse)this.baseParse.stopAt(pos);else for(let i=this.innerDone;i<this.inner.length;i++)this.inner[i].parse.stopAt(pos)}startInner(){let fragmentCursor=new FragmentCursor(this.fragments),overlay=null,covered=null,cursor=new TreeCursor(new TreeNode(this.baseTree,this.ranges[0].from,0,null),1/* Full */);scan:for(let nest,isCovered;null==this.stoppedAt||cursor.from<this.stoppedAt;){let range,enter=!0;if(fragmentCursor.hasNode(cursor)){if(overlay){let match=overlay.mounts.find(m=>m.frag.from<=cursor.from&&m.frag.to>=cursor.to&&m.mount.overlay);if(match)for(let r of match.mount.overlay){let from=r.from+match.pos,to=r.to+match.pos;from>=cursor.from&&to<=cursor.to&&overlay.ranges.push({from,to})}}enter=!1}else if(covered&&(isCovered=checkCover(covered.ranges,cursor.from,cursor.to)))enter=2!=isCovered/* Full */;else if(!cursor.type.isAnonymous&&cursor.from<cursor.to&&(nest=this.nest(cursor,this.input))){cursor.tree||materialize(cursor);let oldMounts=fragmentCursor.findMounts(cursor.from,nest.parser);if("function"==typeof nest.overlay)overlay=new ActiveOverlay(nest.parser,nest.overlay,oldMounts,this.inner.length,cursor.from,cursor.tree,overlay);else{let ranges=punchRanges(this.ranges,nest.overlay||[new Range(cursor.from,cursor.to)]);ranges.length&&this.inner.push(new InnerParse(nest.parser,nest.parser.startParse(this.input,enterFragments(oldMounts,ranges),ranges),nest.overlay?nest.overlay.map(r=>new Range(r.from-cursor.from,r.to-cursor.from)):null,cursor.tree,ranges)),nest.overlay?ranges.length&&(covered={ranges,depth:0,prev:covered}):enter=!1}}else overlay&&(range=overlay.predicate(cursor))&&(!0===range&&(range=new Range(cursor.from,cursor.to)),range.from<range.to&&overlay.ranges.push(range));if(enter&&cursor.firstChild())overlay&&overlay.depth++,covered&&covered.depth++;else for(;;){if(cursor.nextSibling())break;if(!cursor.parent())break scan;if(overlay&&! --overlay.depth){let ranges=punchRanges(this.ranges,overlay.ranges);ranges.length&&this.inner.splice(overlay.index,0,new InnerParse(overlay.parser,overlay.parser.startParse(this.input,enterFragments(overlay.mounts,ranges),ranges),overlay.ranges.map(r=>new Range(r.from-overlay.start,r.to-overlay.start)),overlay.target,ranges)),overlay=overlay.prev}covered&&! --covered.depth&&(covered=covered.prev)}}}}class StructureCursor{constructor(root,offset){this.offset=offset,this.done=!1,this.cursor=root.fullCursor()}// Move to the first node (in pre-order) that starts at or after `pos`.
moveTo(pos){for(let{cursor}=this,p=pos-this.offset;!this.done&&cursor.from<p;)if(cursor.to>=pos&&cursor.enter(p,1,!1,!1));else cursor.next(!1)||(this.done=!0)}hasNode(cursor){if(this.moveTo(cursor.from),!this.done&&this.cursor.from+this.offset==cursor.from&&this.cursor.tree)for(let tree=this.cursor.tree;;){if(tree==cursor.tree)return!0;if(tree.children.length&&0==tree.positions[0]&&tree.children[0]instanceof Tree)tree=tree.children[0];else break}return!1}}class FragmentCursor{constructor(fragments){var _a;if(this.fragments=fragments,this.curTo=0,this.fragI=0,fragments.length){let first=this.curFrag=fragments[0];this.curTo=null!==(_a=first.tree.prop(stoppedInner))&&void 0!==_a?_a:first.to,this.inner=new StructureCursor(first.tree,-first.offset)}else this.curFrag=this.inner=null}hasNode(node){for(;this.curFrag&&node.from>=this.curTo;)this.nextFrag();return this.curFrag&&this.curFrag.from<=node.from&&this.curTo>=node.to&&this.inner.hasNode(node)}nextFrag(){var _a;if(this.fragI++,this.fragI==this.fragments.length)this.curFrag=this.inner=null;else{let frag=this.curFrag=this.fragments[this.fragI];this.curTo=null!==(_a=frag.tree.prop(stoppedInner))&&void 0!==_a?_a:frag.to,this.inner=new StructureCursor(frag.tree,-frag.offset)}}findMounts(pos,parser){var _a;let result=[];if(this.inner){this.inner.cursor.moveTo(pos,1);for(let mount,pos=this.inner.cursor.node;pos;pos=pos.parent)if(mount=null===(_a=pos.tree)||void 0===_a?void 0:_a.prop(NodeProp.mounted),mount&&mount.parser==parser)for(let frag,i=this.fragI;i<this.fragments.length&&(frag=this.fragments[i],!(frag.from>=pos.to));i++)frag.tree==this.curFrag.tree&&result.push({frag,pos:pos.from-frag.offset,mount})}return result}}return exports.DefaultBufferLength=1024,exports.MountedTree=MountedTree,exports.NodeProp=NodeProp,exports.NodeSet=NodeSet,exports.NodeType=NodeType,exports.Parser=class{/// Start a parse, returning a [partial parse](#common.PartialParse)
/// object. [`fragments`](#common.TreeFragment) can be passed in to
/// make the parse incremental.
///
/// By default, the entire input is parsed. You can pass `ranges`,
/// which should be a sorted array of non-empty, non-overlapping
/// ranges, to parse only those ranges. The tree returned in that
/// case will start at `ranges[0].from`.
startParse(input,fragments,ranges){return"string"==typeof input&&(input=new StringInput(input)),ranges=ranges?ranges.length?ranges.map(r=>new Range(r.from,r.to)):[new Range(0,0)]:[new Range(0,input.length)],this.createParse(input,fragments||[],ranges)}/// Run a full parse, returning the resulting tree.
parse(input,fragments,ranges){for(let done,parse=this.startParse(input,fragments,ranges);;)if(done=parse.advance(),done)return done}},exports.Tree=Tree,exports.TreeBuffer=TreeBuffer,exports.TreeCursor=TreeCursor,exports.TreeFragment=TreeFragment,exports.parseMixed=function(nest){return(parse,input,fragments,ranges)=>new MixedParse(parse,nest,input,fragments,ranges)},exports}