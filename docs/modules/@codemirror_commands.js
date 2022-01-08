async function moduleInitFunction(require,exports={}){function updateSel(sel,by){return state.EditorSelection.create(sel.ranges.map(by),sel.mainIndex)}function setSel(state,selection){return state.update({selection,scrollIntoView:!0,userEvent:"select"})}function moveSel({state,dispatch},how){let selection=updateSel(state.selection,how);return!selection.eq(state.selection)&&(dispatch(setSel(state,selection)),!0)}function rangeEnd(range,forward){return state.EditorSelection.cursor(forward?range.to:range.from)}function cursorByChar(view,forward){return moveSel(view,range=>range.empty?view.moveByChar(range,forward):rangeEnd(range,forward))}/// Move the selection one character to the left (which is backward in
/// left-to-right text, forward in right-to-left text).
function cursorByGroup(view,forward){return moveSel(view,range=>range.empty?view.moveByGroup(range,forward):rangeEnd(range,forward))}/// Move the selection to the left across one group of word or
/// non-word (but also non-space) characters.
function moveBySubword(view,range,forward){let categorize=view.state.charCategorizer(range.from);return view.moveByChar(range,forward,start=>{let cat=state.CharCategory.Space,pos=range.from,done=!1,sawUpper=!1,sawLower=!1,step=next=>{if(done)return!1;pos+=forward?next.length:-next.length;let ahead,nextCat=categorize(next);if(cat==state.CharCategory.Space&&(cat=nextCat),cat!=nextCat)return!1;if(cat==state.CharCategory.Word)if(next.toLowerCase()==next){if(!forward&&sawUpper)return!1;sawLower=!0}else if(sawLower){if(forward)return!1;done=!0}else{if(sawUpper&&forward&&categorize(ahead=view.state.sliceDoc(pos,pos+1))==state.CharCategory.Word&&ahead.toLowerCase()==ahead)return!1;sawUpper=!0}return!0};return step(start),step})}function cursorBySubword(view,forward){return moveSel(view,range=>range.empty?moveBySubword(view,range,forward):rangeEnd(range,forward))}/// Move the selection one group or camel-case subword forward.
function interestingNode(state,node,bracketProp){if(node.type.prop(bracketProp))return!0;let len=node.to-node.from;return len&&(2<len||/[^\s,.;:]/.test(state.sliceDoc(node.from,node.to)))||node.firstChild}function moveBySyntax(state$1,start,forward){let pos=language.syntaxTree(state$1).resolveInner(start.head),bracketProp=forward?common.NodeProp.closedBy:common.NodeProp.openedBy;// Scan forward through child nodes to see if there's an interesting
// node ahead.
for(let next,at=start.head;;){if(next=forward?pos.childAfter(at):pos.childBefore(at),!next)break;interestingNode(state$1,next,bracketProp)?pos=next:at=forward?next.to:next.from}let match,newPos,bracket=pos.type.prop(bracketProp);return newPos=bracket&&(match=forward?matchbrackets.matchBrackets(state$1,pos.from,1):matchbrackets.matchBrackets(state$1,pos.to,-1))&&match.matched?forward?match.end.to:match.end.from:forward?pos.to:pos.from,state.EditorSelection.cursor(newPos,forward?-1:1)}/// Move the cursor over the next syntactic element to the left.
function cursorByLine(view,forward){return moveSel(view,range=>{if(!range.empty)return rangeEnd(range,forward);let moved=view.moveVertically(range,forward);return moved.head==range.head?view.moveToLineBoundary(range,forward):moved})}/// Move the selection one line up.
function cursorByPage(view,forward){return moveSel(view,range=>range.empty?view.moveVertically(range,forward,view.dom.clientHeight):rangeEnd(range,forward))}/// Move the selection one page up.
function moveByLineBoundary(view,start,forward){let line=view.lineBlockAt(start.head),moved=view.moveToLineBoundary(start,forward);if(moved.head==start.head&&moved.head!=(forward?line.to:line.from)&&(moved=view.moveToLineBoundary(start,forward,!1)),!forward&&moved.head==line.from&&line.length){let space=/^\s*/.exec(view.state.sliceDoc(line.from,Math.min(line.from+100,line.to)))[0].length;space&&start.head!=line.from+space&&(moved=state.EditorSelection.cursor(line.from+space))}return moved}/// Move the selection to the next line wrap point, or to the end of
/// the line if there isn't one left on this line.
function toMatchingBracket(state$1,dispatch,extend){let found=!1,selection=updateSel(state$1.selection,range=>{let matching=matchbrackets.matchBrackets(state$1,range.head,-1)||matchbrackets.matchBrackets(state$1,range.head,1)||0<range.head&&matchbrackets.matchBrackets(state$1,range.head-1,1)||range.head<state$1.doc.length&&matchbrackets.matchBrackets(state$1,range.head+1,-1);if(!matching||!matching.end)return range;found=!0;let head=matching.start.from==range.head?matching.end.to:matching.end.from;return extend?state.EditorSelection.range(range.anchor,head):state.EditorSelection.cursor(head)});return!!found&&(dispatch(setSel(state$1,selection)),!0)}/// Move the selection to the bracket matching the one it is currently
/// on, if any.
function extendSel(view,how){let selection=updateSel(view.state.selection,range=>{let head=how(range);return state.EditorSelection.range(range.anchor,head.head,head.goalColumn)});return!selection.eq(view.state.selection)&&(view.dispatch(setSel(view.state,selection)),!0)}function selectByChar(view,forward){return extendSel(view,range=>view.moveByChar(range,forward))}/// Move the selection head one character to the left, while leaving
/// the anchor in place.
function selectByGroup(view,forward){return extendSel(view,range=>view.moveByGroup(range,forward))}/// Move the selection head one [group](#commands.cursorGroupLeft) to
/// the left.
function selectBySubword(view,forward){return extendSel(view,range=>moveBySubword(view,range,forward))}/// Move the selection head one group or camel-case subword forward.
function selectByLine(view,forward){return extendSel(view,range=>view.moveVertically(range,forward))}/// Move the selection head one line up.
function selectByPage(view,forward){return extendSel(view,range=>view.moveVertically(range,forward,view.dom.clientHeight))}/// Move the selection head one page up.
function deleteBy({state:state$1,dispatch},by){if(state$1.readOnly)return!1;let event="delete.selection",changes=state$1.changeByRange(range=>{let{from,to}=range;if(from==to){let towards=by(from);towards<from?event="delete.backward":towards>from&&(event="delete.forward"),from=Math.min(from,towards),to=Math.max(to,towards)}return from==to?{range}:{changes:{from,to},range:state.EditorSelection.cursor(from)}});return!changes.changes.empty&&(dispatch(state$1.update(changes,{scrollIntoView:!0,userEvent:event})),!0)}function skipAtomic(target,pos,forward){if(target instanceof view.EditorView)for(let ranges of target.pluginField(view.PluginField.atomicRanges))ranges.between(pos,pos,(from,to)=>{from<pos&&to>pos&&(pos=forward?to:from)});return pos}function selectedLineBlocks(state){let blocks=[],upto=-1;for(let range of state.selection.ranges){let startLine=state.doc.lineAt(range.from),endLine=state.doc.lineAt(range.to);if(range.empty||range.to!=endLine.from||(endLine=state.doc.lineAt(range.to-1)),upto>=startLine.number){let prev=blocks[blocks.length-1];prev.to=endLine.to,prev.ranges.push(range)}else blocks.push({from:startLine.from,to:endLine.to,ranges:[range]});upto=endLine.number+1}return blocks}function moveLine(state$1,dispatch,forward){if(state$1.readOnly)return!1;let changes=[],ranges=[];for(let block of selectedLineBlocks(state$1)){if(forward?block.to==state$1.doc.length:0==block.from)continue;let nextLine=state$1.doc.lineAt(forward?block.to+1:block.from-1),size=nextLine.length+1;if(forward){changes.push({from:block.to,to:nextLine.to},{from:block.from,insert:nextLine.text+state$1.lineBreak});for(let r of block.ranges)ranges.push(state.EditorSelection.range(Math.min(state$1.doc.length,r.anchor+size),Math.min(state$1.doc.length,r.head+size)))}else{changes.push({from:nextLine.from,to:block.from},{from:block.to,insert:state$1.lineBreak+nextLine.text});for(let r of block.ranges)ranges.push(state.EditorSelection.range(r.anchor-size,r.head-size))}}return!!changes.length&&(dispatch(state$1.update({changes,scrollIntoView:!0,selection:state.EditorSelection.create(ranges,state$1.selection.mainIndex),userEvent:"move.line"})),!0)}/// Move the selected lines up one line.
function copyLine(state,dispatch,forward){if(state.readOnly)return!1;let changes=[];for(let block of selectedLineBlocks(state))forward?changes.push({from:block.from,insert:state.doc.slice(block.from,block.to)+state.lineBreak}):changes.push({from:block.to,insert:state.lineBreak+state.doc.slice(block.from,block.to)});return dispatch(state.update({changes,scrollIntoView:!0,userEvent:"input.copyline"})),!0}/// Create a copy of the selected lines. Keep the selection in the top copy.
function isBetweenBrackets(state,pos){if(/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos-1,pos+1)))return{from:pos,to:pos};let closedBy,context=language.syntaxTree(state).resolveInner(pos),before=context.childBefore(pos),after=context.childAfter(pos);return before&&after&&before.to<=pos&&after.from>=pos&&(closedBy=before.type.prop(common.NodeProp.closedBy))&&-1<closedBy.indexOf(after.name)&&state.doc.lineAt(before.to).from==state.doc.lineAt(after.from).from?{from:before.to,to:after.from}:null}/// Replace the selection with a newline and indent the newly created
/// line(s). If the current line consists only of whitespace, this
/// will also delete that whitespace. When the cursor is between
/// matching brackets, an additional newline will be inserted after
/// the cursor.
function newlineAndIndent(atEof){return({state:state$1,dispatch})=>{if(state$1.readOnly)return!1;let changes=state$1.changeByRange(range=>{let{from,to}=range,line=state$1.doc.lineAt(from),explode=!atEof&&from==to&&isBetweenBrackets(state$1,from);atEof&&(from=to=(to<=line.to?line:state$1.doc.lineAt(to)).to);let cx=new language.IndentContext(state$1,{simulateBreak:from,simulateDoubleBreak:!!explode}),indent=language.getIndentation(cx,from);for(null==indent&&(indent=/^\s*/.exec(state$1.doc.lineAt(from).text)[0].length);to<line.to&&/\s/.test(line.text[to-line.from]);)to++;explode?({from,to}=explode):from>line.from&&from<line.from+100&&!/\S/.test(line.text.slice(0,from))&&(from=line.from);let insert=["",language.indentString(state$1,indent)];return explode&&insert.push(language.indentString(state$1,cx.lineIndent(line.from,-1))),{changes:{from,to,insert:text.Text.of(insert)},range:state.EditorSelection.cursor(from+1+insert[1].length)}});return dispatch(state$1.update(changes,{scrollIntoView:!0,userEvent:"input"})),!0}}function changeBySelectedLine(state$1,f){let atLine=-1;return state$1.changeByRange(range=>{let changes=[];for(let line,pos=range.from;pos<=range.to;)line=state$1.doc.lineAt(pos),line.number>atLine&&(range.empty||range.to>line.from)&&(f(line,changes,range),atLine=line.number),pos=line.to+1;let changeSet=state$1.changes(changes);return{changes,range:state.EditorSelection.range(changeSet.mapPos(range.anchor,1),changeSet.mapPos(range.head,1))}})}/// Auto-indent the selected lines. This uses the [indentation service
/// facet](#language.indentService) as source for auto-indent
/// information.
Object.defineProperty(exports,"__esModule",{value:!0});var state=await require("@codemirror/state"),text=await require("@codemirror/text"),view=await require("@codemirror/view"),matchbrackets=await require("@codemirror/matchbrackets"),language=await require("@codemirror/language"),common=await require("@lezer/common");const cursorCharLeft=view$1=>cursorByChar(view$1,view$1.textDirection!=view.Direction.LTR),cursorCharRight=view$1=>cursorByChar(view$1,view$1.textDirection==view.Direction.LTR),cursorGroupLeft=view$1=>cursorByGroup(view$1,view$1.textDirection!=view.Direction.LTR),cursorGroupRight=view$1=>cursorByGroup(view$1,view$1.textDirection==view.Direction.LTR),cursorSyntaxLeft=view$1=>moveSel(view$1,range=>moveBySyntax(view$1.state,range,view$1.textDirection!=view.Direction.LTR)),cursorSyntaxRight=view$1=>moveSel(view$1,range=>moveBySyntax(view$1.state,range,view$1.textDirection==view.Direction.LTR)),cursorLineUp=view=>cursorByLine(view,!1),cursorLineDown=view=>cursorByLine(view,!0),cursorPageUp=view=>cursorByPage(view,!1),cursorPageDown=view=>cursorByPage(view,!0),cursorLineBoundaryForward=view=>moveSel(view,range=>moveByLineBoundary(view,range,!0)),cursorLineBoundaryBackward=view=>moveSel(view,range=>moveByLineBoundary(view,range,!1)),cursorLineStart=view=>moveSel(view,range=>state.EditorSelection.cursor(view.lineBlockAt(range.head).from,1)),cursorLineEnd=view=>moveSel(view,range=>state.EditorSelection.cursor(view.lineBlockAt(range.head).to,-1)),cursorMatchingBracket=({state,dispatch})=>toMatchingBracket(state,dispatch,!1),selectCharLeft=view$1=>selectByChar(view$1,view$1.textDirection!=view.Direction.LTR),selectCharRight=view$1=>selectByChar(view$1,view$1.textDirection==view.Direction.LTR),selectGroupLeft=view$1=>selectByGroup(view$1,view$1.textDirection!=view.Direction.LTR),selectGroupRight=view$1=>selectByGroup(view$1,view$1.textDirection==view.Direction.LTR),selectSyntaxLeft=view$1=>extendSel(view$1,range=>moveBySyntax(view$1.state,range,view$1.textDirection!=view.Direction.LTR)),selectSyntaxRight=view$1=>extendSel(view$1,range=>moveBySyntax(view$1.state,range,view$1.textDirection==view.Direction.LTR)),selectLineUp=view=>selectByLine(view,!1),selectLineDown=view=>selectByLine(view,!0),selectPageUp=view=>selectByPage(view,!1),selectPageDown=view=>selectByPage(view,!0),selectLineBoundaryForward=view=>extendSel(view,range=>moveByLineBoundary(view,range,!0)),selectLineBoundaryBackward=view=>extendSel(view,range=>moveByLineBoundary(view,range,!1)),selectLineStart=view=>extendSel(view,range=>state.EditorSelection.cursor(view.lineBlockAt(range.head).from)),selectLineEnd=view=>extendSel(view,range=>state.EditorSelection.cursor(view.lineBlockAt(range.head).to)),cursorDocStart=({state,dispatch})=>(dispatch(setSel(state,{anchor:0})),!0),cursorDocEnd=({state,dispatch})=>(dispatch(setSel(state,{anchor:state.doc.length})),!0),selectDocStart=({state,dispatch})=>(dispatch(setSel(state,{anchor:state.selection.main.anchor,head:0})),!0),selectDocEnd=({state,dispatch})=>(dispatch(setSel(state,{anchor:state.selection.main.anchor,head:state.doc.length})),!0),selectAll=({state,dispatch})=>(dispatch(state.update({selection:{anchor:0,head:state.doc.length},userEvent:"select"})),!0),selectLine=({state:state$1,dispatch})=>{let ranges=selectedLineBlocks(state$1).map(({from,to})=>state.EditorSelection.range(from,Math.min(to+1,state$1.doc.length)));return dispatch(state$1.update({selection:state.EditorSelection.create(ranges),userEvent:"select"})),!0},selectParentSyntax=({state:state$1,dispatch})=>{let selection=updateSel(state$1.selection,range=>{var _a;let context=language.syntaxTree(state$1).resolveInner(range.head,1);for(;!(context.from<range.from&&context.to>=range.to||context.to>range.to&&context.from<=range.from||null===(_a=context.parent)||void 0===_a||!_a.parent);)context=context.parent;return state.EditorSelection.range(context.to,context.from)});return dispatch(setSel(state$1,selection)),!0},simplifySelection=({state:state$1,dispatch})=>{let cur=state$1.selection,selection=null;return(1<cur.ranges.length?selection=state.EditorSelection.create([cur.main]):!cur.main.empty&&(selection=state.EditorSelection.create([state.EditorSelection.cursor(cur.main.head)])),!!selection)&&(dispatch(setSel(state$1,selection)),!0)},deleteByChar=(target,forward)=>deleteBy(target,pos=>{let before,targetPos,{state}=target,line=state.doc.lineAt(pos);if(!forward&&pos>line.from&&pos<line.from+200&&!/[^ \t]/.test(before=line.text.slice(0,pos-line.from))){if("\t"==before[before.length-1])return pos-1;let col=text.countColumn(before,state.tabSize),drop=col%language.getIndentUnit(state)||language.getIndentUnit(state);for(let i=0;i<drop&&" "==before[before.length-1-i];i++)pos--;targetPos=pos}else targetPos=text.findClusterBreak(line.text,pos-line.from,forward)+line.from,targetPos==pos&&line.number!=(forward?state.doc.lines:1)&&(targetPos+=forward?1:-1);return skipAtomic(target,targetPos,forward)}),deleteCharBackward=view=>deleteByChar(view,!1),deleteCharForward=view=>deleteByChar(view,!0),deleteByGroup=(target,forward)=>deleteBy(target,start=>{let pos=start,{state}=target,line=state.doc.lineAt(pos),categorize=state.charCategorizer(pos);for(let cat=null;;){if(pos==(forward?line.to:line.from)){pos==start&&line.number!=(forward?state.doc.lines:1)&&(pos+=forward?1:-1);break}let next=text.findClusterBreak(line.text,pos-line.from,forward)+line.from,nextChar=line.text.slice(Math.min(pos,next)-line.from,Math.max(pos,next)-line.from),nextCat=categorize(nextChar);if(null!=cat&&nextCat!=cat)break;(" "!=nextChar||pos!=start)&&(cat=nextCat),pos=next}return skipAtomic(target,pos,forward)}),deleteGroupBackward=target=>deleteByGroup(target,!1),deleteGroupForward=target=>deleteByGroup(target,!0),deleteToLineEnd=view=>deleteBy(view,pos=>{let lineEnd=view.lineBlockAt(pos).to;return skipAtomic(view,pos<lineEnd?lineEnd:Math.min(view.state.doc.length,pos+1),!0)}),deleteToLineStart=view=>deleteBy(view,pos=>{let lineStart=view.lineBlockAt(pos).from;return skipAtomic(view,pos>lineStart?lineStart:Math.max(0,pos-1),!1)}),splitLine=({state:state$1,dispatch})=>{if(state$1.readOnly)return!1;let changes=state$1.changeByRange(range=>({changes:{from:range.from,to:range.to,insert:text.Text.of(["",""])},range:state.EditorSelection.cursor(range.from)}));return dispatch(state$1.update(changes,{scrollIntoView:!0,userEvent:"input"})),!0},transposeChars=({state:state$1,dispatch})=>{if(state$1.readOnly)return!1;let changes=state$1.changeByRange(range=>{if(!range.empty||0==range.from||range.from==state$1.doc.length)return{range};let pos=range.from,line=state$1.doc.lineAt(pos),from=pos==line.from?pos-1:text.findClusterBreak(line.text,pos-line.from,!1)+line.from,to=pos==line.to?pos+1:text.findClusterBreak(line.text,pos-line.from,!0)+line.from;return{changes:{from,to,insert:state$1.doc.slice(pos,to).append(state$1.doc.slice(from,pos))},range:state.EditorSelection.cursor(to)}});return!changes.changes.empty&&(dispatch(state$1.update(changes,{scrollIntoView:!0,userEvent:"move.character"})),!0)},moveLineUp=({state,dispatch})=>moveLine(state,dispatch,!1),moveLineDown=({state,dispatch})=>moveLine(state,dispatch,!0),copyLineUp=({state,dispatch})=>copyLine(state,dispatch,!1),copyLineDown=({state,dispatch})=>copyLine(state,dispatch,!0),deleteLine=view=>{if(view.state.readOnly)return!1;let{state}=view,changes=state.changes(selectedLineBlocks(state).map(({from,to})=>(0<from?from--:to<state.doc.length&&to++,{from,to}))),selection=updateSel(state.selection,range=>view.moveVertically(range,!0)).map(changes);return view.dispatch({changes,selection,scrollIntoView:!0,userEvent:"delete.line"}),!0},insertNewlineAndIndent=newlineAndIndent(!1),insertBlankLine=newlineAndIndent(!0),indentSelection=({state,dispatch})=>{if(state.readOnly)return!1;let updated=Object.create(null),context=new language.IndentContext(state,{overrideIndentation:start=>{let found=updated[start];return null==found?-1:found}}),changes=changeBySelectedLine(state,(line,changes,range)=>{let indent=language.getIndentation(context,line.from);if(null==indent)return;/\S/.test(line.text)||(indent=0);let cur=/^\s*/.exec(line.text)[0],norm=language.indentString(state,indent);(cur!=norm||range.from<line.from+cur.length)&&(updated[line.from]=indent,changes.push({from:line.from,to:line.from+cur.length,insert:norm}))});return changes.changes.empty||dispatch(state.update(changes,{userEvent:"indent"})),!0},indentMore=({state,dispatch})=>!state.readOnly&&(dispatch(state.update(changeBySelectedLine(state,(line,changes)=>{changes.push({from:line.from,insert:state.facet(language.indentUnit)})}),{userEvent:"input.indent"})),!0),indentLess=({state,dispatch})=>!state.readOnly&&(dispatch(state.update(changeBySelectedLine(state,(line,changes)=>{let space=/^\s*/.exec(line.text)[0];if(!space)return;let col=text.countColumn(space,state.tabSize),keep=0,insert=language.indentString(state,Math.max(0,col-language.getIndentUnit(state)));for(;keep<space.length&&keep<insert.length&&space.charCodeAt(keep)==insert.charCodeAt(keep);)keep++;changes.push({from:line.from+keep,to:line.from+space.length,insert:insert.slice(keep)})}),{userEvent:"delete.dedent"})),!0),emacsStyleKeymap=[{key:"Ctrl-b",run:cursorCharLeft,shift:selectCharLeft,preventDefault:!0},{key:"Ctrl-f",run:cursorCharRight,shift:selectCharRight},{key:"Ctrl-p",run:cursorLineUp,shift:selectLineUp},{key:"Ctrl-n",run:cursorLineDown,shift:selectLineDown},{key:"Ctrl-a",run:cursorLineStart,shift:selectLineStart},{key:"Ctrl-e",run:cursorLineEnd,shift:selectLineEnd},{key:"Ctrl-d",run:deleteCharForward},{key:"Ctrl-h",run:deleteCharBackward},{key:"Ctrl-k",run:deleteToLineEnd},{key:"Ctrl-Alt-h",run:deleteGroupBackward},{key:"Ctrl-o",run:splitLine},{key:"Ctrl-t",run:transposeChars},{key:"Ctrl-v",run:cursorPageDown},{key:"Alt-v",run:cursorPageUp}],standardKeymap=[{key:"ArrowLeft",run:cursorCharLeft,shift:selectCharLeft,preventDefault:!0},{key:"Mod-ArrowLeft",mac:"Alt-ArrowLeft",run:cursorGroupLeft,shift:selectGroupLeft},{mac:"Cmd-ArrowLeft",run:cursorLineBoundaryBackward,shift:selectLineBoundaryBackward},{key:"ArrowRight",run:cursorCharRight,shift:selectCharRight,preventDefault:!0},{key:"Mod-ArrowRight",mac:"Alt-ArrowRight",run:cursorGroupRight,shift:selectGroupRight},{mac:"Cmd-ArrowRight",run:cursorLineBoundaryForward,shift:selectLineBoundaryForward},{key:"ArrowUp",run:cursorLineUp,shift:selectLineUp,preventDefault:!0},{mac:"Cmd-ArrowUp",run:cursorDocStart,shift:selectDocStart},{mac:"Ctrl-ArrowUp",run:cursorPageUp,shift:selectPageUp},{key:"ArrowDown",run:cursorLineDown,shift:selectLineDown,preventDefault:!0},{mac:"Cmd-ArrowDown",run:cursorDocEnd,shift:selectDocEnd},{mac:"Ctrl-ArrowDown",run:cursorPageDown,shift:selectPageDown},{key:"PageUp",run:cursorPageUp,shift:selectPageUp},{key:"PageDown",run:cursorPageDown,shift:selectPageDown},{key:"Home",run:cursorLineBoundaryBackward,shift:selectLineBoundaryBackward},{key:"Mod-Home",run:cursorDocStart,shift:selectDocStart},{key:"End",run:cursorLineBoundaryForward,shift:selectLineBoundaryForward},{key:"Mod-End",run:cursorDocEnd,shift:selectDocEnd},{key:"Enter",run:insertNewlineAndIndent},{key:"Mod-a",run:selectAll},{key:"Backspace",run:deleteCharBackward,shift:deleteCharBackward},{key:"Delete",run:deleteCharForward},{key:"Mod-Backspace",mac:"Alt-Backspace",run:deleteGroupBackward},{key:"Mod-Delete",mac:"Alt-Delete",run:deleteGroupForward},{mac:"Mod-Backspace",run:deleteToLineStart},{mac:"Mod-Delete",run:deleteToLineEnd}].concat(emacsStyleKeymap.map(b=>({mac:b.key,run:b.run,shift:b.shift}))),defaultKeymap=[{key:"Alt-ArrowLeft",mac:"Ctrl-ArrowLeft",run:cursorSyntaxLeft,shift:selectSyntaxLeft},{key:"Alt-ArrowRight",mac:"Ctrl-ArrowRight",run:cursorSyntaxRight,shift:selectSyntaxRight},{key:"Alt-ArrowUp",run:moveLineUp},{key:"Shift-Alt-ArrowUp",run:copyLineUp},{key:"Alt-ArrowDown",run:moveLineDown},{key:"Shift-Alt-ArrowDown",run:copyLineDown},{key:"Escape",run:simplifySelection},{key:"Mod-Enter",run:insertBlankLine},{key:"Alt-l",mac:"Ctrl-l",run:selectLine},{key:"Mod-i",run:selectParentSyntax,preventDefault:!0},{key:"Mod-[",run:indentLess},{key:"Mod-]",run:indentMore},{key:"Mod-Alt-\\",run:indentSelection},{key:"Shift-Mod-k",run:deleteLine},{key:"Shift-Mod-\\",run:cursorMatchingBracket}].concat(standardKeymap);/// Move the selection one character to the right.
return exports.copyLineDown=copyLineDown,exports.copyLineUp=copyLineUp,exports.cursorCharBackward=view=>cursorByChar(view,!1),exports.cursorCharForward=view=>cursorByChar(view,!0),exports.cursorCharLeft=cursorCharLeft,exports.cursorCharRight=cursorCharRight,exports.cursorDocEnd=cursorDocEnd,exports.cursorDocStart=cursorDocStart,exports.cursorGroupBackward=view=>cursorByGroup(view,!1),exports.cursorGroupForward=view=>cursorByGroup(view,!0),exports.cursorGroupLeft=cursorGroupLeft,exports.cursorGroupRight=cursorGroupRight,exports.cursorLineBoundaryBackward=cursorLineBoundaryBackward,exports.cursorLineBoundaryForward=cursorLineBoundaryForward,exports.cursorLineDown=cursorLineDown,exports.cursorLineEnd=cursorLineEnd,exports.cursorLineStart=cursorLineStart,exports.cursorLineUp=cursorLineUp,exports.cursorMatchingBracket=cursorMatchingBracket,exports.cursorPageDown=cursorPageDown,exports.cursorPageUp=cursorPageUp,exports.cursorSubwordBackward=view=>cursorBySubword(view,!1),exports.cursorSubwordForward=view=>cursorBySubword(view,!0),exports.cursorSyntaxLeft=cursorSyntaxLeft,exports.cursorSyntaxRight=cursorSyntaxRight,exports.defaultKeymap=defaultKeymap,exports.deleteCharBackward=deleteCharBackward,exports.deleteCharForward=deleteCharForward,exports.deleteGroupBackward=deleteGroupBackward,exports.deleteGroupForward=deleteGroupForward,exports.deleteLine=deleteLine,exports.deleteToLineEnd=deleteToLineEnd,exports.deleteToLineStart=deleteToLineStart,exports.deleteTrailingWhitespace=({state,dispatch})=>{if(state.readOnly)return!1;let changes=[];for(let pos=0,prev="",iter=state.doc.iter();;){if(iter.next(),iter.lineBreak||iter.done){let trailing=prev.search(/\s+$/);if(-1<trailing&&changes.push({from:pos-(prev.length-trailing),to:pos}),iter.done)break;prev=""}else prev=iter.value;pos+=iter.value.length}return!!changes.length&&(dispatch(state.update({changes,userEvent:"delete"})),!0)},exports.emacsStyleKeymap=emacsStyleKeymap,exports.indentLess=indentLess,exports.indentMore=indentMore,exports.indentSelection=indentSelection,exports.indentWithTab={key:"Tab",run:indentMore,shift:indentLess},exports.insertBlankLine=insertBlankLine,exports.insertNewline=({state,dispatch})=>(dispatch(state.update(state.replaceSelection(state.lineBreak),{scrollIntoView:!0,userEvent:"input"})),!0),exports.insertNewlineAndIndent=insertNewlineAndIndent,exports.insertTab=({state,dispatch})=>state.selection.ranges.some(r=>!r.empty)?indentMore({state,dispatch}):(dispatch(state.update(state.replaceSelection("\t"),{scrollIntoView:!0,userEvent:"input"})),!0),exports.moveLineDown=moveLineDown,exports.moveLineUp=moveLineUp,exports.selectAll=selectAll,exports.selectCharBackward=view=>selectByChar(view,!1),exports.selectCharForward=view=>selectByChar(view,!0),exports.selectCharLeft=selectCharLeft,exports.selectCharRight=selectCharRight,exports.selectDocEnd=selectDocEnd,exports.selectDocStart=selectDocStart,exports.selectGroupBackward=view=>selectByGroup(view,!1),exports.selectGroupForward=view=>selectByGroup(view,!0),exports.selectGroupLeft=selectGroupLeft,exports.selectGroupRight=selectGroupRight,exports.selectLine=selectLine,exports.selectLineBoundaryBackward=selectLineBoundaryBackward,exports.selectLineBoundaryForward=selectLineBoundaryForward,exports.selectLineDown=selectLineDown,exports.selectLineEnd=selectLineEnd,exports.selectLineStart=selectLineStart,exports.selectLineUp=selectLineUp,exports.selectMatchingBracket=({state,dispatch})=>toMatchingBracket(state,dispatch,!0),exports.selectPageDown=selectPageDown,exports.selectPageUp=selectPageUp,exports.selectParentSyntax=selectParentSyntax,exports.selectSubwordBackward=view=>selectBySubword(view,!1),exports.selectSubwordForward=view=>selectBySubword(view,!0),exports.selectSyntaxLeft=selectSyntaxLeft,exports.selectSyntaxRight=selectSyntaxRight,exports.simplifySelection=simplifySelection,exports.splitLine=splitLine,exports.standardKeymap=standardKeymap,exports.transposeChars=transposeChars,exports}