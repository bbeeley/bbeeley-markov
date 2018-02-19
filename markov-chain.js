const separators = [
  '.',
  '!',
  '?',
  '\n'
]
const separatorsString = separators.join('');
const separatorsRegexGlobal = new RegExp(`([${separatorsString}]+"?)`, 'g');
const separatorsRegexComplete = new RegExp(`^[${separatorsString}]+"?$`);

class MarkovChain {
  constructor () {
    this.chain = {};
    this.beginString = '\t';
    this.endString = '\r';
    this.minLength = 280;
    this.maxLength = 0;
  }

  addString (text) {
    // Keep track of min and max text length
    if (this.minLength > text.length) {
      this.minLength = text.length;
    }
    if (this.maxLength < text.length) {
      this.maxLength = text.length;
    }

    const splitWords = text.split(separatorsRegexGlobal);

    // Add punctuation back in
    const sentences = [ splitWords[0] ]
    for (let i = 1; i < splitWords.length; i++) {
      if (separatorsRegexComplete.test(splitWords[i])) {
        sentences[sentences.length - 1] += splitWords[i];
      }
      else if (splitWords[i] !== '') {
        sentences.push(splitWords[i]);
      }
    }

    for (const sentence of sentences) {
      this.addSentence(sentence);
    }
  }

  addSentence (sentence) {
    const words = [ this.beginString, ...sentence.trim().split(/ +/) ];

    // Strip whitespace-only words
    if (['', '\n'].indexOf(words[words.length - 1]) > -1) {
      words[words.length - 1] = this.endString;
    }
    else {
      words.push(this.endString);
    }

    // Nothing left in the sentence.
    if (words.length === 2) {
      return;
    }

    for (let i = 0; i < (words.length - 1); i++) {
      this.chain[words[i]] = this.chain[words[i]] || {};
      if (!this.chain[words[i]].hasOwnProperty(words[i + 1])) {
        this.chain[words[i]][words[i + 1]] = 1;
      }
      else {
        this.chain[words[i]][words[i + 1]] += 1;
      }
    }
  }

  dump () {
    const markovData = {
      minLength: this.minLength,
      maxLength: this.maxLength,
      chain: this.chain
    };

    return markovData;
  }

  restore (markovData) {
    this.minLength = markovData.minLength;
    this.maxLength = markovData.maxLength;
    this.chain = markovData.chain;
  }

  generateSentence () {
    let nextWord = this.nextWord(this.chain[this.beginString]);

    let sentence = [];
    while (nextWord !== this.endString) {
      sentence.push(nextWord);
      nextWord = this.nextWord(this.chain[nextWord]);
    }

    return sentence.join(' ');
  }

  static getSum(total, num) {
    return total + num;
  }

  nextWord (links) {
    const sum = Object.values(links).reduce(MarkovChain.getSum);

    // Select a number between 1 and the sum of word counts
    let randomChoice = Math.floor((Math.random() * sum) + 1);

    for (const [word, count] of Object.entries(links)) {
      if (count < randomChoice) {
        randomChoice -= count;
      }
      else {
        return word;
      }
    }
  }
}

module.exports = MarkovChain;
