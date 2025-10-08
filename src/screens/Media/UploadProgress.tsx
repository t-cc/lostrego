interface UploadProgressProps {
  progress: { [key: string]: number };
}

export default function UploadProgress({ progress }: UploadProgressProps) {
  if (Object.keys(progress).length === 0) return null;

  return (
    <div className="space-y-2">
      {Object.entries(progress).map(([fileName, progressValue]) => (
        <div key={fileName} className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
          <span className="text-sm text-gray-700">
            {fileName}: {Math.round(progressValue)}%
          </span>
        </div>
      ))}
    </div>
  );
}
