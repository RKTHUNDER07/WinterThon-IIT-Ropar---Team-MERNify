const TranscriptBox = ({ transcript, isRecording }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Live Speech-to-Text</h3>
      <div className="bg-gray-50 rounded-lg p-4 min-h-[150px] max-h-[300px] overflow-y-auto border-2 border-gray-200">
        {transcript ? (
          <p className="text-gray-800 leading-relaxed">{transcript}</p>
        ) : (
          <p className="text-gray-400 italic">
            {isRecording
              ? 'Listening... Speak into your microphone'
              : 'Start recording to see live transcription'}
          </p>
        )}
      </div>
    </div>
  )
}

export default TranscriptBox
