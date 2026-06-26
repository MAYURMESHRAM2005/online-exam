const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'descriptive', 'coding'],
    required: true
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String
  },
  marks: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Question', questionSchema);
