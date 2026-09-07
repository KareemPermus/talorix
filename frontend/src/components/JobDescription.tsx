interface Props { description: string }

export default function JobDescription({ description }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold mb-4">Job Description</h2>
      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</div>
    </div>
  );
}