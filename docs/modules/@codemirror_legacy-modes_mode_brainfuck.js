async function moduleInitFunction(require,exports={}){Object.defineProperty(exports,"__esModule",{value:!0});var reserve=[">","<","+","-",".",",","[","]"];/*
  comments can be either:
  placed behind lines

  +++    this is a comment

  where reserved characters cannot be used
  or in a loop
  [
  this is ok to use [ ] and stuff
  ]
  or preceded by #
*/return exports.brainfuck={startState:function(){return{commentLine:!1,left:0,right:0,commentLoop:!1}},token:function(stream,state){if(stream.eatSpace())return null;stream.sol()&&(state.commentLine=!1);var ch=stream.next().toString();if(-1!==reserve.indexOf(ch)){if(!0===state.commentLine)return stream.eol()&&(state.commentLine=!1),"comment";if("]"===ch||"["===ch)return"["===ch?state.left++:state.right++,"bracket";if("+"===ch||"-"===ch)return"keyword";if("<"===ch||">"===ch)return"atom";if("."===ch||","===ch)return"def"}else return state.commentLine=!0,stream.eol()&&(state.commentLine=!1),"comment";stream.eol()&&(state.commentLine=!1)}},exports}