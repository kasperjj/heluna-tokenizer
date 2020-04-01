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

class TokenList{
	constructor(str){
		this.rawString=str
		this.list=[]
		this.position=0;
		this.state=TokenType.NONE;
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

	lastTokenWas(str){
		if(this.list.length==0)return false;
		if(this.list[this.list.length-1].data==str)return true;
		return false;
	}

	collectToken(tokenType,tokenData){
		this.list.push(new Token(tokenType,tokenData,this.line,this.column));
		this.buffer=""
		this.state=TokenType.NONE;
	}

	error(msg){
		// TODO: add line and column numbers
		// do nothing for now
		throw new TokenizeException(msg);
	}

	count(){
		return this.list.length
	}

	getToken(index){
		return this.list[index]
	}
}

function tokenizeString(rawString){
	var list=new TokenList(rawString)
	var input=list.read();
	var stored=-1;
	var escaped=false;
	while(input!=-1){
		switch(list.state){
			case TokenType.NONE:
					// we are not currently in a token, start a new state
					if(!isBlankCharacter(input)){
						if(input=='"'){
							list.state=TokenType.STRING;
						}else if(input=='$'){
							list.state=TokenType.REFERENCE;
						}else if(isDigit(input)){
							list.buffer+=input;
							list.state=TokenType.INTEGER;
						}else if(input=='#'){
							list.state=TokenType.COMMENT;
						}else if(isSymbol(input)){
							list.collectToken(TokenType.SYMBOL,input);
						}else{
							list.buffer+=input;
							list.state=TokenType.IDENTIFIER;
						}
					}
				break;
			case TokenType.STRING:
					// We are currently reading a string literal, transform escaped characters and collect when " is reached
					if(escaped){
						switch(input){
							case 'n':list.buffer+="\n";break;
							case 'r':list.buffer+="\r";break;
							case 't':list.buffer+="\t";break;
							case "\\":list.buffer+="\\";break;
							case '"':list.buffer+='"';break;
							default: list.error("Unknown escape character '\\"+input+"'");
						}
						escaped=false;
					}else{
						if(input=='"'){
							list.collectToken(TokenType.STRING,list.buffer);
						}else if(input=="\\"){
							escaped=true;
						}else{
							list.buffer+=input;
						}
					}
				break;
			case TokenType.FLOAT:
			case TokenType.INTEGER:
					if(isDigit(input)){
						list.buffer+=input;
					}else if(isBlankCharacter(input)){
						list.collectToken(list.state,list.buffer);
					}else if(input=='.'){
						if(list.lastTokenWas(".")){
							// TODO: Find a way to handle this gracefully without introducing
							//       awareness of the actual language in the tokenizer.
							// we are probably in a list accessor, deny float change
							list.collectToken(list.state,list.buffer);
							stored=input;
						}else{
							list.buffer+=input;
							list.state=TokenType.FLOAT;
						}
					}else if(input=='e'||input=='E'){
						list.buffer+='e';
						list.state=TokenType.FLOAT;
					}else if(input=='-'){
						var c2=list.buffer.charAt(list.buffer.length-1);
						if(c2=='e' || c2=='E'){
							list.buffer+=input;
							// next must be digit
							input=list.read();
							if(input==-1)list.error("Unclosed floating point literal.");
							if(isDigit(input)){
								list.buffer+=input;
							}else list.error("Unclosed floating point literal.");
						}else{
							list.collectToken(list.state,list.buffer);
							stored=input; // push token
						}
					}else if(list.buffer.endsWith("e")){
						list.error("Unclosed floating point literal.");
					}else{
						list.collectToken(list.state,list.buffer);
						stored=input; // push token
					}
				break;
			case TokenType.COMMENT:
					// Collect comments until the end of the line
					if(input=="\n"){
						list.collectToken(list.state,list.buffer);
					}else{
						list.buffer+=input;
					}
				break;
			case TokenType.IDENTIFIER:
					if(isBlankCharacter(input)){
						list.collectToken(list.state,list.buffer);
					}else if(isSymbol(input)){
						list.collectToken(list.state,list.buffer);
						stored=input; // push token
					}else if(input==':'){
						list.state=TokenType.LABEL;
						list.collectToken(list.state,list.buffer);
					}else{
						list.buffer+=input;
					}
				break;
			case TokenType.LABEL:
			case TokenType.REFERENCE:
					if(isBlankCharacter(input)){
						list.collectToken(list.state,list.buffer);
					}else if(isSymbol(input)){
						list.collectToken(list.state,list.buffer);
						stored=input; // push token
					}else{
						list.buffer+=input;
					}
				break;
		}
		if(stored!=-1){
			// If a character has been pushed into stored, make this the new input
			input=stored;
			stored=-1;
		}else{
			// If there was no character waiting in stored, read a new character
			input=list.read();
		}
	}
	if(list.state==TokenType.STRING){
		// String literals must be closed before the end of the file, everything else is valid
		list.error("String literal never closed");
	}else if(list.state==TokenType.FLOAT && list.buffer.endsWith("e")){
		list.error("Floating point literal missing exponent value")
	}else if(list.state!=TokenType.NONE){
		list.collectToken(list.state,list.buffer);
	}
	return list;
}


module.exports = {tokenizeString,TokenType};