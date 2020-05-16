const {tokenizeString,TokenType} = require('./index');

test('Single string literal', () => {
  var list=tokenizeString('"Hello World"')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello World")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(13)
});

test('Single string literal with reserved symbols', () => {
  var list=tokenizeString('"Hello World`~!@#$%^&*()_+-=[]{}\|;:\',./<>?"')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello World`~!@#$%^&*()_+-=[]{}\|;:\',./<>?")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(43)
});

test('Multipe string literals', () => {
  var list=tokenizeString('"Hello""World"')
  expect(list.count()).toBe(2);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(7)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("World")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(14)
});

test('Padded string literal', () => {
  var list=tokenizeString('  "Hello World" \n')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello World")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(15)
});

test('String literal with linefeed', () => {
  var list=tokenizeString("\"Hello\nWorld\"")
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello\nWorld")
  expect(tkn.line).toBe(2)
  expect(tkn.column).toBe(7)
});

test('String literal with escaped characters', () => {
  var list=tokenizeString("\"Hello\\n\\r\\t\\\"\\\\World\"")
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello\n\r\t\"\\World")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(22)
});

test('String literal with bad escaped character', () => {
  expect(()=>{tokenizeString('"\\x"')}).toThrow()
});

test('String literal never closed', () => {
  expect(()=>{tokenizeString('"Hello World')}).toThrow()
});

test('Special Symbols', () => {
  var list=tokenizeString('=.,-+*/%?&!|\';<>(){}[]')
  expect(list.count()).toBe(22);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("=")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(1)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(",")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
  tkn=list.getToken(3)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("-")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(4)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  tkn=list.getToken(5)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("*")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(6)
  tkn=list.getToken(6)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("/")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(7)
  tkn=list.getToken(7)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("%")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(8)
  tkn=list.getToken(8)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("?")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
  tkn=list.getToken(9)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("&")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(10)
  tkn=list.getToken(10)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("!")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(11)
  tkn=list.getToken(11)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("|")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(12)
});

test('Spaced Special Symbols', () => {
  var list=tokenizeString('  = . , -  + * /   % ? & ! |  \' ; <   > ( )   { } [ ] ')
  expect(list.count()).toBe(22);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("=")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
});

test('String literals and a symbol', () => {
  var list=tokenizeString('"Hello" + "World"')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("Hello")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(7)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.STRING)
  expect(tkn.data).toBe("World")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(17)
});

test('Integer literal', () => {
  var list=tokenizeString('42')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("42")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
});

test('Single digit integer literal', () => {
  var list=tokenizeString('9')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(1)
});

test('Negative integer (symbol + literal)', () => {
  var list=tokenizeString('-16')
  expect(list.count()).toBe(2);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("-")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(1)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("16")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
});

test('Floating point literal', () => {
  var list=tokenizeString('3.141592')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.FLOAT)
  expect(tkn.data).toBe("3.141592")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(8)
});

test('Floating point literal using incomplete exponent', () => {
  expect(()=>{tokenizeString('3.141592e')}).toThrow()
});

test('Floating point literal using negative incomplete exponent', () => {
  expect(()=>{tokenizeString('3.141592e-')}).toThrow()
});

test('Floating point literal using non digit exponent', () => {
  expect(()=>{tokenizeString('3.141592eA')}).toThrow()
});

test('Floating point literal using negative non digit exponent', () => {
  expect(()=>{tokenizeString('3.141592e-A')}).toThrow()
});

test('Floating point literal using exponent', () => {
  var list=tokenizeString('3.141592e9')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.FLOAT)
  expect(tkn.data).toBe("3.141592e9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(10)
});

test('Floating point literal using upper case exponent', () => {
  var list=tokenizeString('3.141592E9')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.FLOAT)
  expect(tkn.data).toBe("3.141592e9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(10)
});

test('Floating point literal using negative exponent', () => {
  var list=tokenizeString('3.141592e-9')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.FLOAT)
  expect(tkn.data).toBe("3.141592e-9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(11)
});

test('Full line comment', () => {
  var list=tokenizeString('# Foo bar')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.COMMENT)
  expect(tkn.data).toBe(" Foo bar")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
});

test('Multi line comment', () => {
  var list=tokenizeString('# Foo\n# Bar')
  expect(list.count()).toBe(2);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.COMMENT)
  expect(tkn.data).toBe(" Foo")
  expect(tkn.line).toBe(2)
  expect(tkn.column).toBe(1)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.COMMENT)
  expect(tkn.data).toBe(" Bar")
  expect(tkn.line).toBe(2)
  expect(tkn.column).toBe(6)
});

test('Half line comment', () => {
  var list=tokenizeString('9 # Foo bar')
  expect(list.count()).toBe(2);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.COMMENT)
  expect(tkn.data).toBe(" Foo bar")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(11)
});

test('Reference', () => {
  var list=tokenizeString('$foo')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.REFERENCE)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
});

test('Identifier', () => {
  var list=tokenizeString('foo')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
});

test('Label', () => {
  var list=tokenizeString('foo:')
  expect(list.count()).toBe(1);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.LABEL)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
});

test('Numeric accessor', () => {
  var list=tokenizeString('foo.9')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
});


test('Nested numeric accessor', () => {
  var list=tokenizeString('foo.9.2')
  expect(list.count()).toBe(5);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(6)
  tkn=list.getToken(3)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(6)
  tkn=list.getToken(4)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("2")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(7)
});

test('Deep nested numeric accessor', () => {
  var list=tokenizeString('foo.9.2.3')
  expect(list.count()).toBe(7);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(6)
  tkn=list.getToken(3)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(6)
  tkn=list.getToken(4)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("2")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(8)
  tkn=list.getToken(5)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe(".")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(8)
  tkn=list.getToken(6)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("3")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
});

test('Integer expression 4-9', () => {
  var list=tokenizeString('4-9')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("4")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("-")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
});

test('Integer expression 4+9', () => {
  var list=tokenizeString('4+9')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("4")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
});

test('Integer expression 4 + 9', () => {
  var list=tokenizeString('4 + 9')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("4")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
});

test('Floating point expression 4.1 + 9.2', () => {
  var list=tokenizeString('4.1 + 9.2')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.FLOAT)
  expect(tkn.data).toBe("4.1")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.FLOAT)
  expect(tkn.data).toBe("9.2")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
});

test('Identifier expression foo+bar', () => {
  var list=tokenizeString('foo+bar')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("bar")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(7)
});

test('Identifier expression foo + bar', () => {
  var list=tokenizeString('foo + bar')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(4)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.IDENTIFIER)
  expect(tkn.data).toBe("bar")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
});

test('Reference expression $foo+$bar', () => {
  var list=tokenizeString('$foo+$bar')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.REFERENCE)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.REFERENCE)
  expect(tkn.data).toBe("bar")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(9)
});

test('Reference expression $foo + $bar', () => {
  var list=tokenizeString('$foo + $bar')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.type).toBe(TokenType.REFERENCE)
  expect(tkn.data).toBe("foo")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  tkn=list.getToken(1)
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(6)
  tkn=list.getToken(2)
  expect(tkn.type).toBe(TokenType.REFERENCE)
  expect(tkn.data).toBe("bar")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(11)
});

test('Token list iteration', () => {
  var list=tokenizeString('4 + 9')
  expect(list.hasNext()).toBeTruthy();
  var tkn=list.next()
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("4")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(2)
  tkn=list.next()
  expect(tkn.type).toBe(TokenType.SYMBOL)
  expect(tkn.data).toBe("+")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(3)
  tkn=list.next()
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("9")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(5)
  expect(list.hasNext()).toBeFalsy();
  expect(list.next()).toBeNull();
});

test('Token list reset', () => {
  var list=tokenizeString('4')
  expect(list.hasNext()).toBeTruthy();
  list.next()
  expect(list.hasNext()).toBeFalsy();
  list.reset()
  expect(list.hasNext()).toBeTruthy();
  var tkn=list.next()
  expect(tkn.type).toBe(TokenType.INTEGER)
  expect(tkn.data).toBe("4")
  expect(tkn.line).toBe(1)
  expect(tkn.column).toBe(1)
});

test('Token list requireNext', () => {
  var list=tokenizeString('4')
  expect(list.requireNext()).not.toBeNull()
  expect(()=>{tokenizeString('').requireNext()}).toThrow()
});


test('Token list requireSymbol', () => {
  var list=tokenizeString('+')
  expect(list.requireSymbol("some error")).not.toBeNull()
  expect(()=>{tokenizeString('foo').requireSymbol("some error")}).toThrow()
});

test('Token list consumeSymbol', () => {
  var list=tokenizeString('+ -')
  expect(list.consumeSymbol("+")).toBeTruthy()
  expect(list.consumeSymbol("+")).toBeFalsy()
  list.next()
  expect(list.consumeSymbol("+")).toBeFalsy()
});

test('Token list requireIdentifier', () => {
  var list=tokenizeString('foo')
  expect(list.requireIdentifier("some error")).not.toBeNull()
  expect(()=>{tokenizeString('42').requireIdentifier("some error")}).toThrow()
});

test('Token list consumeIdentifier', () => {
  var list=tokenizeString('foo bar 42')
  expect(list.consumeIdentifier("foo")).toBeTruthy()
  expect(list.consumeIdentifier("foo")).toBeFalsy()
  expect(list.consumeIdentifier("bar")).toBeTruthy()
  expect(list.consumeIdentifier("42")).toBeFalsy()
  list.next()
  expect(list.consumeIdentifier("foo")).toBeFalsy()
});

test('Token list consumseIdentifierHard', () => {
  var list=tokenizeString('foo')
  expect(list.consumeIdentifierHard("foo","some error")).toBeTruthy()
  expect(()=>{tokenizeString('42').consumeIdentifierHard("foo","some error")}).toThrow()
});

test('Token list returnToken empty', () => {
  var list=tokenizeString('')
  expect(()=>{list.returnToken()}).not.toThrow();
});

test('Set and get position',()=>{
  var list=tokenizeString('A B')
  expect(list.hasNext()).toBeTruthy()
  var pos=list.getPosition()
  list.next()
  list.next()
  expect(list.hasNext()).toBeFalsy()
  list.setPosition(pos)
  expect(list.hasNext()).toBeTruthy()
})

test('Token index', () => {
  var list=tokenizeString('4+9')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.index).toBe(0)
  tkn=list.getToken(1)
  expect(tkn.index).toBe(1)
  tkn=list.getToken(2)
  expect(tkn.index).toBe(2)
});

test('Token index with spaces', () => {
  var list=tokenizeString(' 4+  9')
  expect(list.count()).toBe(3);
  var tkn=list.getToken(0)
  expect(tkn.index).toBe(1)
  tkn=list.getToken(1)
  expect(tkn.index).toBe(2)
  tkn=list.getToken(2)
  expect(tkn.index).toBe(5)
});