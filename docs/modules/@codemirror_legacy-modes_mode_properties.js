async function moduleInitFunction(require,exports={}){Object.defineProperty(exports,"__esModule",{value:!0});return exports.properties={token:function(stream,state){var sol=stream.sol()||state.afterSection,eol=stream.eol();if(state.afterSection=!1,sol&&(state.nextMultiline?(state.inMultiline=!0,state.nextMultiline=!1):state.position="def"),eol&&!state.nextMultiline&&(state.inMultiline=!1,state.position="def"),sol)for(;stream.eatSpace(););var ch=stream.next();return sol&&("#"===ch||"!"===ch||";"===ch)?(state.position="comment",stream.skipToEnd(),"comment"):sol&&"["===ch?(state.afterSection=!0,stream.skipTo("]"),stream.eat("]"),"header"):"="===ch||":"===ch?(state.position="quote",null):("\\"===ch&&"quote"===state.position&&stream.eol()&&(state.nextMultiline=!0),state.position)},startState:function(){return{position:"def",// Current position, "def", "quote" or "comment"
nextMultiline:!1,// Is the next line multiline value
inMultiline:!1,// Is the current line a multiline value
afterSection:!1// Did we just open a section
}}},exports}