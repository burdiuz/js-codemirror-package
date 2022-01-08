async function moduleInitFunction(require,exports={}){/// Create an extension that enables bracket matching. Whenever the
/// cursor is next to a bracket, that bracket and the one it matches
/// are highlighted. Or, when no matching bracket is found, another
/// highlighting style is used to indicate this.
function matchingNodes(node,dir,brackets){let byProp=node.prop(0>dir?common.NodeProp.openedBy:common.NodeProp.closedBy);if(byProp)return byProp;if(1==node.name.length){let index=brackets.indexOf(node.name);if(-1<index&&index%2==(0>dir?1:0))return[brackets[index+dir]]}return null}/// Find the matching bracket for the token at `pos`, scanning
/// direction `dir`. Only the `brackets` and `maxScanDistance`
/// properties are used from `config`, if given. Returns null if no
/// bracket was found at `pos`, or a match result otherwise.
function matchBrackets(state,pos,dir,config={}){let maxScanDistance=config.maxScanDistance||DefaultScanDist,brackets=config.brackets||DefaultBrackets,tree=language.syntaxTree(state),node=tree.resolveInner(pos,dir);for(let matches,cur=node;cur;cur=cur.parent)if(matches=matchingNodes(cur.type,dir,brackets),matches&&cur.from<cur.to)return matchMarkedBrackets(state,pos,dir,cur,matches,brackets);return matchPlainBrackets(state,pos,dir,tree,node.type,maxScanDistance,brackets)}function matchMarkedBrackets(_state,_pos,dir,token,matching,brackets){let parent=token.parent,firstToken={from:token.from,to:token.to},depth=0,cursor=null===parent||void 0===parent?void 0:parent.cursor;if(cursor&&(0>dir?cursor.childBefore(token.from):cursor.childAfter(token.to)))do if(0>dir?cursor.to<=token.from:cursor.from>=token.to){if(0==depth&&-1<matching.indexOf(cursor.type.name)&&cursor.from<cursor.to)return{start:firstToken,end:{from:cursor.from,to:cursor.to},matched:!0};if(matchingNodes(cursor.type,dir,brackets))depth++;else if(matchingNodes(cursor.type,-dir,brackets)&&(depth--,0==depth))return{start:firstToken,end:cursor.from==cursor.to?void 0:{from:cursor.from,to:cursor.to},matched:!1}}while(0>dir?cursor.prevSibling():cursor.nextSibling());return{start:firstToken,matched:!1}}function matchPlainBrackets(state,pos,dir,tree,tokenType,maxScanDistance,brackets){let startCh=0>dir?state.sliceDoc(pos-1,pos):state.sliceDoc(pos,pos+1),bracket=brackets.indexOf(startCh);if(0>bracket||0==bracket%2!=0<dir)return null;let startToken={from:0>dir?pos-1:pos,to:0<dir?pos+1:pos},iter=state.doc.iterRange(pos,0<dir?state.doc.length:0),depth=0;for(let text,distance=0;!iter.next().done&&distance<=maxScanDistance;){text=iter.value,0>dir&&(distance+=text.length);let basePos=pos+distance*dir;for(let found,pos=0<dir?0:text.length-1,end=0<dir?text.length:-1;pos!=end;pos+=dir)if(found=brackets.indexOf(text[pos]),!(0>found||tree.resolve(basePos+pos,1).type!=tokenType))if(0==found%2==0<dir)depth++;else{if(1==depth)// Closing
return{start:startToken,end:{from:basePos+pos,to:basePos+pos+1},matched:found>>1==bracket>>1};depth--}0<dir&&(distance+=text.length)}return iter.done?{start:startToken,matched:!1}:null}Object.defineProperty(exports,"__esModule",{value:!0});var state=await require("@codemirror/state"),language=await require("@codemirror/language"),view=await require("@codemirror/view"),common=await require("@lezer/common");const baseTheme=view.EditorView.baseTheme({"&.cm-focused .cm-matchingBracket":{backgroundColor:"#328c8252"},"&.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bb555544"}}),DefaultScanDist=1e4,DefaultBrackets="()[]{}",bracketMatchingConfig=state.Facet.define({combine(configs){return state.combineConfig(configs,{afterCursor:!0,brackets:DefaultBrackets,maxScanDistance:DefaultScanDist})}}),matchingMark=view.Decoration.mark({class:"cm-matchingBracket"}),nonmatchingMark=view.Decoration.mark({class:"cm-nonmatchingBracket"}),bracketMatchingState=state.StateField.define({create(){return view.Decoration.none},update(deco,tr){if(!tr.docChanged&&!tr.selection)return deco;let decorations=[],config=tr.state.facet(bracketMatchingConfig);for(let range of tr.state.selection.ranges){if(!range.empty)continue;let match=matchBrackets(tr.state,range.head,-1,config)||0<range.head&&matchBrackets(tr.state,range.head-1,1,config)||config.afterCursor&&(matchBrackets(tr.state,range.head,1,config)||range.head<tr.state.doc.length&&matchBrackets(tr.state,range.head+1,-1,config));if(!match)continue;let mark=match.matched?matchingMark:nonmatchingMark;decorations.push(mark.range(match.start.from,match.start.to)),match.end&&decorations.push(mark.range(match.end.from,match.end.to))}return view.Decoration.set(decorations,!0)},provide:f=>view.EditorView.decorations.from(f)}),bracketMatchingUnique=[bracketMatchingState,baseTheme];return exports.bracketMatching=function(config={}){return[bracketMatchingConfig.of(config),bracketMatchingUnique]},exports.matchBrackets=matchBrackets,exports}