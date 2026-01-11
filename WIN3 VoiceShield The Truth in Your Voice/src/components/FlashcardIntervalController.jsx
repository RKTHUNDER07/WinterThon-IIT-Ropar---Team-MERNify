import { useState } from "react";

/**
 * Flashcard Interval Controller
 * Allows users to adjust the min/max intervals dynamically
 */
const FlashcardIntervalController = ({ currentMin, currentMax, onUpdate }) => {
  const [minInterval, setMinInterval] = useState(currentMin / 1000); // Convert to seconds
  const [maxInterval, setMaxInterval] = useState(currentMax / 1000);
  const [showController, setShowController] = useState(false);

  const handleUpdate = () => {
    onUpdate({
      minMs: minInterval * 1000,
      maxMs: maxInterval * 1000,
    });
  };

  const presets = [
    { name: "Testing (10-30s)", min: 10, max: 30 },
    { name: "Demo (30s-1m)", min: 30, max: 60 },
    { name: "Normal (2-5m)", min: 120, max: 300 },
    { name: "Long (5-10m)", min: 300, max: 600 },
  ];

  const applyPreset = (preset) => {
    setMinInterval(preset.min);
    setMaxInterval(preset.max);
  };

  if (!showController) {
    return (
      <button
        onClick={() => setShowController(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg text-sm font-medium"
        title="Open Flashcard Interval Controller"
      >
        ⚙️ Flashcard Settings
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 w-96 border-2 border-blue-500 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Flashcard Interval Control
        </h3>
        <button
          onClick={() => setShowController(false)}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* Current Settings Display */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Current:</strong> {minInterval}s - {maxInterval}s
        </p>
      </div>

      {/* Min Interval Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Interval: {minInterval} seconds
        </label>
        <input
          type="range"
          min="5"
          max="600"
          value={minInterval}
          onChange={(e) => setMinInterval(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">5s to 10 minutes</p>
      </div>

      {/* Max Interval Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Interval: {maxInterval} seconds
        </label>
        <input
          type="range"
          min="5"
          max="600"
          value={maxInterval}
          onChange={(e) => setMaxInterval(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">5s to 10 minutes</p>
      </div>

      {/* Validation */}
      {minInterval >= maxInterval && (
        <p className="text-red-600 text-sm mb-3 font-medium">
          ⚠️ Min must be less than Max
        </p>
      )}

      {/* Preset Buttons */}
      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium text-gray-700">Quick Presets:</p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleUpdate}
        disabled={minInterval >= maxInterval}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        Apply Changes
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 Changes apply immediately to new flashcard timers
      </p>
    </div>
  );
};

export default FlashcardIntervalController;
