
import { ArrowLeft, Check, Calendar, Clock, Users, Shield, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CreateExamProps {
  onBack: () => void;
}

export function CreateExam({ onBack }: CreateExamProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    course: '',
    duration: '60',
    date: '',
    totalMarks: '100',
    passingMarks: '40',
    time: '',
    instructions: '',
    enableProctoring: true,
    enableCamera: true,
    enableMicrophone: true,
    enableScreenShare: false,
    tabSwitchLimit: '3',
    faceDetection: true
  });
  const [questions, setQuestions] = useState([
  {
    questionText: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 5,
  },
]);
const handleAddQuestion = () => {
  setQuestions([
    ...questions,
    {
      questionText: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 5,
    },
  ]);
};

// ✅ DELETE QUESTION
const handleDeleteQuestion = (index: number) => {
  const updated = questions.filter((_, i) => i !== index);
  setQuestions(updated);
};

// ✅ UPDATE QUESTION
const handleQuestionChange = (index: number, field: string, value: any) => {
  const updated = [...questions];
  updated[index][field] = value;
  setQuestions(updated);
};

// ✅ UPDATE OPTIONS
const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
  const updated = [...questions];
  updated[qIndex].options[optIndex] = value;
  setQuestions(updated);
};

// ✅ QUESTION BANK
const questionBank = [
  {
    questionText: "What is React?",
    options: ["Library", "Framework", "Language", "Tool"],
    correctAnswer: "Library",
    type: "mcq",
    marks: 5,
  },
];

// ✅ ADD FROM BANK
const addFromBank = () => {
  setQuestions([...questions, questionBank[0]]);
};

// ✅ IMPORT FILE
const handleFileImport = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const text = event.target?.result as string;

      const data = JSON.parse(text);

      // ✅ Validate structure
      if (!Array.isArray(data)) {
        alert("Invalid format: should be array of questions");
        return;
      }

      setQuestions(data);

    } catch {
      alert("Invalid JSON file");
    }
  };

  reader.readAsText(file);
};

  const steps = [
    { id: 1, name: 'Exam Details', icon: FileText },
    { id: 2, name: 'Questions', icon: FileText },
    { id: 3, name: 'Proctoring Rules', icon: Shield },
    { id: 4, name: 'Schedule & Publish', icon: Calendar }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setExamData({ ...examData, [field]: value });
  };
const handlePublish = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in");
      return;
    }

    // ✅ VALIDATION
    if (!examData.date || !examData.time) {
      alert("Please select date and time");
      return;
    }

    if (!examData.title || !examData.course) {
      alert("Please fill all required fields");
      return;
    }

    console.log("Sending Data:", examData);

    const response = await fetch("http://localhost:5000/api/exams/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    
      body: JSON.stringify({
        title: examData.title,
        courseCode: examData.course,

        // ✅ convert to number
        duration: Number(examData.duration),
        totalMarks: Number(examData.totalMarks),
        passingMarks: Number(examData.passingMarks),

        instructions: examData.instructions,

        // ✅ FIX DATE FORMAT
        // date: new Date(examData.date + "T" + examData.time),
        date:new Date(examData.date),
        time: examData.time,
        

        // ✅ FIXED PROCTORING (typo removed)
        proctoring: {
          enableProctoring: examData.enableProctoring,
          enableCamera: examData.enableCamera,
          enableMicrophone: examData.enableMicrophone,
          enableScreenShare: examData.enableScreenShare,
          faceDetection: examData.faceDetection,
          tabSwitchLimit: Number(examData.tabSwitchLimit),
        },

        // ✅ SAFE QUESTIONS
        questions: questions?.length ? questions : [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Exam creation failed");
      return;
    }

    alert("Exam Created Successfully 🎉");
    onBack();

  } catch (error) {
    console.error("Publish Error:", error);
    alert("Server error");
  }
};
          
 return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <button className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">
              Save as Draft
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Exam</h1>
          <p className="text-slate-600">Set up your exam with AI-powered proctoring</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep >= step.id
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-slate-500">Step {step.id}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8">
          {/* Step 1: Exam Details */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Exam Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Exam Title *
                    </label>
                    <input
                      type="text"
                      value={examData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Data Structures Midterm"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={examData.course}
                      onChange={(e) => handleInputChange('course', e.target.value)}
                      placeholder="e.g., CS301"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={examData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      value={examData.totalMarks}
                      onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Passing Marks *
                    </label>
                    <input
                      type="number"
                      value={examData.passingMarks}
                      onChange={(e) => handleInputChange('passingMarks', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Exam Instructions
                  </label>
                  <textarea
                    value={examData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Enter instructions for students..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Add Questions</h2>
                <button onClick={handleAddQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              </div>

              {/* <div className="space-y-4 mb-6"> */}
                {/* Sample Question Card
                <div className="border border-slate-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          Question 1
                        </span>
                        <select className="px-3 py-1 border border-slate-300 rounded text-sm">
                          <option>Multiple Choice</option>
                          <option>True/False</option>
                          <option>Descriptive</option>
                          <option>Coding</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Marks"
                          className="w-20 px-3 py-1 border border-slate-300 rounded text-sm"
                          defaultValue="5"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your question here..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3"
                      />
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Option A"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Option B"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Option C"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Option D"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <button className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Correct Answer:</label>
                    <select className="px-3 py-1 border border-slate-300 rounded text-sm">
                      <option>Option A</option>
                      <option>Option B</option>
                      <option>Option C</option>
                      <option>Option D</option>
                    </select>
                  </div>
                </div>
              </div> */}
  <div className="space-y-4 mb-6">
  {questions.map((q, index) => (
    <div key={index} className="border border-slate-200 rounded-lg p-5">
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">

          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              Question {index + 1}
            </span>

            {/* SAME STYLE SELECT */}
            <select
              value={q.type}
              onChange={(e) =>
                handleQuestionChange(index, "type", e.target.value)
              }
              className="px-3 py-1 border border-slate-300 rounded text-sm"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="truefalse">True/False</option>
              <option value="descriptive">Descriptive</option>
              <option value="coding">Coding</option>
            </select>

            {/* SAME STYLE INPUT */}
            <input
              type="number"
              value={q.marks}
              onChange={(e) =>
                handleQuestionChange(index, "marks", e.target.value)
              }
              className="w-20 px-3 py-1 border border-slate-300 rounded text-sm"
            />
          </div>

          {/* QUESTION INPUT */}
          <input
            type="text"
            value={q.questionText}
            onChange={(e) =>
              handleQuestionChange(index, "questionText", e.target.value)
            }
            placeholder="Enter your question here..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3"
          />

          {/* OPTIONS */}
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={(e) =>
                  handleOptionChange(index, i, e.target.value)
                }
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* DELETE BUTTON SAME STYLE */}
        <button
          onClick={() => handleDeleteQuestion(index)}
          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* CORRECT ANSWER */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">Correct Answer:</label>
        <select
          value={q.correctAnswer}
          onChange={(e) =>
            handleQuestionChange(index, "correctAnswer", e.target.value)
          }
          className="px-3 py-1 border border-slate-300 rounded text-sm"
        >
          <option value="">Select</option>
          <option value="Option A">Option A</option>
          <option value="Option B">Option B</option>
          <option value="Option C">Option C</option>
          <option value="Option D">Option D</option>
        </select>
      </div>
    </div>
  ))}
</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={addFromBank}  
                 className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center">
                  <Plus className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Add from Question Bank</p>
                </button>
                {/* <button onClick={handleFileImport} 
                className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Import from File</p>
                </button> */}
                <label className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center cursor-pointer">
  
  <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
  <p className="text-sm font-medium text-slate-600">
    Import from File
  </p>

  {/* HIDDEN INPUT */}
  <input
    type="file"
    accept=".json"
    onChange={handleFileImport}
    className="hidden"
  />
</label>
                <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Auto-Generate with AI</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Proctoring Rules */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Proctoring Configuration</h2>
              
              <div className="space-y-6">
                {/* Enable Proctoring */}
                <div className="p-5 border border-slate-200 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900">Enable AI Proctoring</p>
                      <p className="text-sm text-slate-600">Monitor students during the exam</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={examData.enableProctoring}
                      onChange={(e) => handleInputChange('enableProctoring', e.target.checked)}
                      className="w-12 h-6 appearance-none bg-slate-300 rounded-full relative cursor-pointer transition-colors checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-6"
                    />
                  </label>
                </div>

                {examData.enableProctoring && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 border border-slate-200 rounded-lg">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Camera Required</p>
                              <p className="text-xs text-slate-600">Webcam monitoring</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={examData.enableCamera}
                            onChange={(e) => handleInputChange('enableCamera', e.target.checked)}
                            className="w-5 h-5 text-indigo-600"
                          />
                        </label>
                      </div>

                      <div className="p-5 border border-slate-200 rounded-lg">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Check className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Microphone Access</p>
                              <p className="text-xs text-slate-600">Audio monitoring</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={examData.enableMicrophone}
                            onChange={(e) => handleInputChange('enableMicrophone', e.target.checked)}
                            className="w-5 h-5 text-indigo-600"
                          />
                        </label>
                      </div>

                      <div className="p-5 border border-slate-200 rounded-lg">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Check className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Screen Sharing</p>
                              <p className="text-xs text-slate-600">Share entire screen</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={examData.enableScreenShare}
                            onChange={(e) => handleInputChange('enableScreenShare', e.target.checked)}
                            className="w-5 h-5 text-indigo-600"
                          />
                        </label>
                      </div>

                      <div className="p-5 border border-slate-200 rounded-lg">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Check className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Face Detection</p>
                              <p className="text-xs text-slate-600">AI face recognition</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={examData.faceDetection}
                            onChange={(e) => handleInputChange('faceDetection', e.target.checked)}
                            className="w-5 h-5 text-indigo-600"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="p-5 border border-slate-200 rounded-lg">
                      <label className="block mb-3">
                        <span className="font-medium text-slate-900">Tab Switch Limit</span>
                        <p className="text-sm text-slate-600">Maximum allowed tab switches before warning</p>
                      </label>
                      <input
                        type="number"
                        value={examData.tabSwitchLimit}
                        onChange={(e) => handleInputChange('tabSwitchLimit', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                      <h3 className="font-semibold text-amber-900 mb-2">Violation Actions</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600" defaultChecked />
                          <span className="text-sm text-amber-800">Send warning notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600" defaultChecked />
                          <span className="text-sm text-amber-800">Record violation footage</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm text-amber-800">Auto-terminate after 3 violations</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Schedule & Publish */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Schedule & Publish</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Exam Date *
                    </label>
                    <input
                    type="date"
                    value={examData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={examData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Exam Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Title:</p>
                      <p className="font-medium text-slate-900">{examData.title || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Course:</p>
                      <p className="font-medium text-slate-900">{examData.course || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Duration:</p>
                      <p className="font-medium text-slate-900">{examData.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Total Marks:</p>
                      <p className="font-medium text-slate-900">{examData.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Proctoring:</p>
                      <p className={`font-medium ${examData.enableProctoring ? 'text-green-600' : 'text-slate-400'}`}>
                        {examData.enableProctoring ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Schedule:</p>
                      <p className="font-medium text-slate-900">
                        {examData.date && examData.time ? `${examData.date} at ${examData.time}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-semibold text-blue-900 mb-2">Ready to Publish?</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    Once published, students will be notified and the exam will appear in their dashboard.
                  </p>
                  <div className="flex gap-3">
                    {/* <button className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                      Publish Now
                    </button> */}
                    <button
                   onClick={handlePublish}
                   className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                    Publish Now
                   </button>
                    <button className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
                      Schedule for Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              Next Step
            </button>
          ) : (
            // <button
            //   onClick={onBack}
            //   className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
            // >
            //   Publish Exam
            // </button>
            <button
             onClick={handlePublish}
             className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-lg hover:shadow-xl transition-all">
             Publish Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
