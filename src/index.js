let TokenType={
	INTEGER:Symbol(),
	SYMBOL:Symbol(),
	FLOAT:Symbol(),
	STRING:Symbol(),
	COMMENT:Symbol(),
	REFERENCE:Symbol(),
	LABEL:Symbol(),
	NONE:Symbol(),
	IDENTIFIER:Symbol()
}

let CharacterBlanks=[' ',"\n","\r","\t"]
let CharacterSymbols=['=','.',',','-','+','*','/','%','?','&','!','|','\'',';','<','>','(',')','{','}','[',']']

// Returns true for any character that is treated as a token separating blank
function isBlankCharacter(ch){
	for(var i=0;i<CharacterBlanks.length;i++)
		if(CharacterBlanks[i]==ch){
			return true;
		}
	return false;
}

// Returns true for any character that is treated as a special symbol in the Heluna syntax
function isSymbol(ch){
	for(var i=0;i<CharacterSymbols.length;i++)
		if(CharacterSymbols[i]==ch){
			return true;
		}
	return false;
}
	
// Returns true if a given character is a numeric digit
function isDigit(ch){
	return (ch>= '0' && ch <= '9');
}


function TokenizeException(message) {
   this.message = message;
   this.name = "TokenizeException";
}

class Token{
	constructor(type,data,line,column){
		this.type=type
		this.data=data
		this.line=line
		this.column=column
	}
}
class TokenizerState{
	constructor(str,list){
		this.rawString=str
		this.list=list
		this.position=0;
		this.current=TokenType.NONE;
		this.buffer="";
		this.column=0;
		this.line=1;
	}

	read(){
		if(this.position<this.rawString.length){
			var ch=this.rawString.charAt(this.position++);
			if(ch=="\n"){
				this.line++;
				this.column=1;
			}else{
				this.column++;
			}
			return ch;
		}else{
			return -1;
		}
	} 

	collectToken(tokenType,tokenData){
		this.list.addToken(new Token(tokenType,tokenData,this.line,this.column));
		this.buffer=""
		this.current=TokenType.NONE;
	}

	error(msg){
		// TODO: add line and column numbers
		// do nothing for now
		throw new TokenizeException(msg);
	}
}

class TokenList{
	constructor(str){
		this.rawString=str
		this.list=[]
	}

	lastTokenWas(str){
		if(this.list.length==0)return false;
		if(this.list[this.list.length-1].data==str)return true;
		return false;
	}

	count(){
		return this.list.length
	}

	getToken(index){
		return this.list[index]
	}

	addToken(token){
		this.list.push(token)
	}
}

function tokenizeString(rawString){
	var list=new TokenList(rawString)
	var state=new TokenizerState(rawString,list)
	var input=state.read();
	var stored=-1;
	var escaped=false;
	while(input!=-1){
		switch(state.current){
			case TokenType.NONE:
					// we are not currently in a token, start a new state
					if(!isBlankCharacter(input)){
						if(input=='"'){
							state.current=TokenType.STRING;
						}else if(input=='$'){
							state.current=TokenType.REFERENCE;
						}else if(isDigit(input)){
							state.buffer+=input;
							state.current=TokenType.INTEGER;
						}else if(input=='#'){
							state.current=TokenType.COMMENT;
						}else if(isSymbol(input)){
							state.collectToken(TokenType.SYMBOL,input);
						}else{
							state.buffer+=input;
							state.current=TokenType.IDENTIFIER;
						}
					}
				break;
			case TokenType.STRING:
					// We are currently reading a string literal, transform escaped characters and collect when " is reached
					if(escaped){
						switch(input){
							case 'n':state.buffer+="\n";break;
							case 'r':state.buffer+="\r";break;
							case 't':state.buffer+="\t";break;
							case "\\":state.buffer+="\\";break;
							case '"':state.buffer+='"';break;
							default: state.error("Unknown escape character '\\"+input+"'");
						}
						escaped=false;
					}else{
						if(input=='"'){
							state.collectToken(TokenType.STRING,state.buffer);
						}else if(input=="\\"){
							escaped=true;
						}else{
							state.buffer+=input;
						}
					}
				break;
			case TokenType.FLOAT:
			case TokenType.INTEGER:
					if(isDigit(input)){
						state.buffer+=input;
					}else if(isBlankCharacter(input)){
						state.collectToken(state.current,state.buffer);
					}else if(input=='.'){
						if(list.lastTokenWas(".")){
							// TODO: Find a way to handle this gracefully without introducing
							//       awareness of the actual language in the tokenizer.
							// we are probably in a list accessor, deny float change
							state.collectToken(state.current,state.buffer);
							stored=input;
						}else{
							state.buffer+=input;
							state.current=TokenType.FLOAT;
						}
					}else if(input=='e'||input=='E'){
						state.buffer+='e';
						state.current=TokenType.FLOAT;
					}else if(input=='-'){
						var c2=state.buffer.charAt(state.buffer.length-1);
						if(c2=='e' || c2=='E'){
							state.buffer+=input;
							// next must be digit
							input=state.read();
							if(input==-1)state.error("Unclosed floating point literal.");
							if(isDigit(input)){
								state.buffer+=input;
							}else state.error("Unclosed floating point literal.");
						}else{
							state.collectToken(state.current,state.buffer);
							stored=input; // push token
						}
					}else if(state.buffer.endsWith("e")){
						state.error("Unclosed floating point literal.");
					}else{
						state.collectToken(state.current,state.buffer);
						stored=input; // push token
					}
				break;
			case TokenType.COMMENT:
					// Collect comments until the end of the line
					if(input=="\n"){
						state.collectToken(state.current,state.buffer);
					}else{
						state.buffer+=input;
					}
				break;
			case TokenType.IDENTIFIER:
					if(isBlankCharacter(input)){
						state.collectToken(state.current,state.buffer);
					}else if(isSymbol(input)){
						state.collectToken(state.current,state.buffer);
						stored=input; // push token
					}else if(input==':'){
						state.current=TokenType.LABEL;
						state.collectToken(state.current,state.buffer);
					}else{
						state.buffer+=input;
					}
				break;
			case TokenType.LABEL:
			case TokenType.REFERENCE:
					if(isBlankCharacter(input)){
						state.collectToken(state.current,state.buffer);
					}else if(isSymbol(input)){
						state.collectToken(state.current,state.buffer);
						stored=input; // push token
					}else{
						state.buffer+=input;
					}
				break;
		}
		if(stored!=-1){
			// If a character has been pushed into stored, make this the new input
			input=stored;
			stored=-1;
		}else{
			// If there was no character waiting in stored, read a new character
			input=state.read();
		}
	}
	if(state.current==TokenType.STRING){
		// String literals must be closed before the end of the file, everything else is valid
		state.error("String literal never closed");
	}else if(state.current==TokenType.FLOAT && state.buffer.endsWith("e")){
		state.error("Floating point literal missing exponent value")
	}else if(state.current!=TokenType.NONE){
		state.collectToken(state.current,state.buffer);
	}
	return list;
}


module.exports = {tokenizeString,TokenType};