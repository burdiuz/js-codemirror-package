async function moduleInitFunction(require,exports={}){Object.defineProperty(exports,"__esModule",{value:!0});var curPunc,wordRegexp=function(words){return new RegExp("^(?:"+words.join("|")+")$","i")},tokenBase=function(stream/*, state*/){var ch=stream.next();if("\""===ch)return stream.match(/^.*?"/),"string";if("'"===ch)return stream.match(/^.*?'/),"string";if(/[{}\(\),\.;\[\]]/.test(ch))return curPunc=ch,"punctuation";if("/"===ch&&stream.eat("/"))return stream.skipToEnd(),"comment";if(operatorChars.test(ch))return stream.eatWhile(operatorChars),null;if(stream.eatWhile(/[_\w\d]/),stream.eat(":"))return stream.eatWhile(/[\w\d_\-]/),"atom";var word=stream.current();return funcs.test(word)?"builtin":preds.test(word)?"def":keywords.test(word)||systemKeywords.test(word)?"keyword":"variable"},pushContext=function(state,type,col){return state.context={prev:state.context,indent:state.indent,col:col,type:type}},popContext=function(state){return state.indent=state.context.indent,state.context=state.context.prev},funcs=wordRegexp(["abs","acos","allShortestPaths","asin","atan","atan2","avg","ceil","coalesce","collect","cos","cot","count","degrees","e","endnode","exp","extract","filter","floor","haversin","head","id","keys","labels","last","left","length","log","log10","lower","ltrim","max","min","node","nodes","percentileCont","percentileDisc","pi","radians","rand","range","reduce","rel","relationship","relationships","replace","reverse","right","round","rtrim","shortestPath","sign","sin","size","split","sqrt","startnode","stdev","stdevp","str","substring","sum","tail","tan","timestamp","toFloat","toInt","toString","trim","type","upper"]),preds=wordRegexp(["all","and","any","contains","exists","has","in","none","not","or","single","xor"]),keywords=wordRegexp(["as","asc","ascending","assert","by","case","commit","constraint","create","csv","cypher","delete","desc","descending","detach","distinct","drop","else","end","ends","explain","false","fieldterminator","foreach","from","headers","in","index","is","join","limit","load","match","merge","null","on","optional","order","periodic","profile","remove","return","scan","set","skip","start","starts","then","true","union","unique","unwind","using","when","where","with","call","yield"]),systemKeywords=wordRegexp(["access","active","assign","all","alter","as","catalog","change","copy","create","constraint","constraints","current","database","databases","dbms","default","deny","drop","element","elements","exists","from","grant","graph","graphs","if","index","indexes","label","labels","management","match","name","names","new","node","nodes","not","of","on","or","password","populated","privileges","property","read","relationship","relationships","remove","replace","required","revoke","role","roles","set","show","start","status","stop","suspended","to","traverse","type","types","user","users","with","write"]),operatorChars=/[*+\-<>=&|~%^]/;return exports.cypher={startState:function(){return{tokenize:tokenBase,context:null,indent:0,col:0}},token:function(stream,state){if(stream.sol()&&(state.context&&null==state.context.align&&(state.context.align=!1),state.indent=stream.indentation()),stream.eatSpace())return null;var style=state.tokenize(stream,state);if("comment"!==style&&state.context&&null==state.context.align&&"pattern"!==state.context.type&&(state.context.align=!0),"("===curPunc)pushContext(state,")",stream.column());else if("["===curPunc)pushContext(state,"]",stream.column());else if("{"===curPunc)pushContext(state,"}",stream.column());else if(/[\]\}\)]/.test(curPunc)){for(;state.context&&"pattern"===state.context.type;)popContext(state);state.context&&curPunc===state.context.type&&popContext(state)}else"."===curPunc&&state.context&&"pattern"===state.context.type?popContext(state):/atom|string|variable/.test(style)&&state.context&&(/[\}\]]/.test(state.context.type)?pushContext(state,"pattern",stream.column()):"pattern"===state.context.type&&!state.context.align&&(state.context.align=!0,state.context.col=stream.column()));return style},indent:function(state,textAfter,cx){var firstChar=textAfter&&textAfter.charAt(0),context=state.context;if(/[\]\}]/.test(firstChar))for(;context&&"pattern"===context.type;)context=context.prev;var closing=context&&firstChar===context.type;return context?"keywords"===context.type?null:context.align?context.col+(closing?0:1):context.indent+(closing?0:cx.unit):0}},exports}